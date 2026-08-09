import {
  type CleanupRegistrar,
  clearTracking,
  isBatching,
  queueEffect,
  type TrackingObserver,
  withTracking,
} from './internals/tracking'
import { Node } from './internals/node'
import type { EffectCleanup, StopEffect } from './effect'

export interface AsyncEffectContext {
  onCleanup: CleanupRegistrar
  signal: AbortSignal
}

export type AsyncEffectCallback = (context: AsyncEffectContext) => void | Promise<void>

export interface AsyncEffectOptions {
  onError?: (err: unknown) => void
}

class AsyncEffectRunner implements TrackingObserver {
  readonly nodes = new Set<Node>()

  private cleanups: EffectCleanup[] = []
  private active = true
  private running = false
  private queued = false
  private controller: AbortController | null = null

  constructor(
    private readonly callback: AsyncEffectCallback,
    private readonly options: AsyncEffectOptions = {}
  ) {
    this.run()
  }

  notify(): void {
    if (!this.active || this.queued) {
      return
    }

    if (isBatching()) {
      this.queued = true
      queueEffect(() => {
        this.queued = false
        if (this.active) {
          this.run()
        }
      })
      return
    }

    this.run()
  }

  stop(): void {
    if (!this.active) {
      return
    }

    this.active = false
    clearTracking(this)
    this.controller?.abort()
    this.runCleanup()
  }

  private run(): void {
    if (!this.active) {
      return
    }

    if (this.running) {
      throw new Error('Effects cannot synchronously trigger themselves.')
    }

    this.running = true
    this.runCleanup()
    clearTracking(this)
    this.controller?.abort()

    const controller = new AbortController()
    this.controller = controller

    try {
      const result = withTracking(this, () =>
        this.callback({
          signal: controller.signal,
          onCleanup: (cleanup) => {
            this.cleanups.push(cleanup)
          },
        })
      )

      if (result && typeof result.then === 'function') {
        result.catch((err: unknown) => {
          if (controller.signal.aborted) {
            return
          }
          this.reportError(err)
        })
      }
    } catch (err) {
      this.reportError(err)
    } finally {
      this.running = false
    }
  }

  private reportError(err: unknown): void {
    if (this.options.onError) {
      this.options.onError(err)
    } else {
      throw err
    }
  }

  private runCleanup(): void {
    const cleanups = this.cleanups
    this.cleanups = []

    for (let index = cleanups.length - 1; index >= 0; index -= 1) {
      cleanups[index]?.()
    }
  }
}

export function asyncEffect(fn: AsyncEffectCallback, options?: AsyncEffectOptions): StopEffect {
  const runner = new AsyncEffectRunner(fn, options)
  return () => runner.stop()
}
