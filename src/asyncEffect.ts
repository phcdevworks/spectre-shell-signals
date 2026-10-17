import {
  type CleanupRegistrar,
  clearTracking,
  dependenciesChanged,
  queueEffect,
  runTracked,
  type TrackingObserver,
} from './internals/tracking'
import { Node } from './internals/node'
import { createStopEffect, type EffectCleanup, type StopEffect } from './effect'

export interface AsyncEffectContext {
  onCleanup: CleanupRegistrar
  signal: AbortSignal
}

export type AsyncEffectCallback = (context: AsyncEffectContext) => void | Promise<void>

export interface AsyncEffectOptions {
  onError?: (err: unknown) => void
}

class AsyncEffectRunner implements TrackingObserver {
  readonly nodes = new Map<Node, number>()
  readonly derived = false

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

  get watched(): boolean {
    return this.active
  }

  notify(): void {
    if (!this.active || this.queued) {
      return
    }

    this.queued = true
    queueEffect(() => {
      this.queued = false
      if (this.active && dependenciesChanged(this)) {
        this.run()
      }
    })
  }

  stop(): void {
    if (!this.active) {
      return
    }

    this.active = false
    clearTracking(this)
    this.controller?.abort()
    try {
      this.runCleanup()
    } catch (err) {
      if (this.options.onError) {
        this.options.onError(err)
      } else {
        throw err
      }
    }
  }

  private run(): void {
    if (!this.active) {
      return
    }

    if (this.running) {
      throw new Error('Effects cannot synchronously trigger themselves.')
    }

    this.running = true
    try {
      this.controller?.abort()
      this.runCleanup()

      const controller = new AbortController()
      this.controller = controller
      const result = runTracked(this, () =>
        this.callback({
          signal: controller.signal,
          onCleanup: (cleanup) => {
            if (controller.signal.aborted) {
              cleanup()
            } else {
              this.cleanups.push(cleanup)
            }
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

    const errors: unknown[] = []
    for (let index = cleanups.length - 1; index >= 0; index -= 1) {
      try {
        cleanups[index]?.()
      } catch (err) {
        errors.push(err)
      }
    }
    if (errors.length > 0) {
      throw errors[0]
    }
  }
}

export function asyncEffect(fn: AsyncEffectCallback, options?: AsyncEffectOptions): StopEffect {
  const runner = new AsyncEffectRunner(fn, options)
  return createStopEffect(() => runner.stop())
}
