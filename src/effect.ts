import {
  type CleanupRegistrar,
  clearTracking,
  dependenciesChanged,
  queueEffect,
  runTracked,
  type TrackingObserver,
} from './internals/tracking'

export type { CleanupRegistrar }
import { Node } from './internals/node'

export type EffectCleanup = () => void
export type EffectCallback = (onCleanup: CleanupRegistrar) => void
export type StopEffect = () => void

export interface EffectOptions {
  onError?: (err: unknown) => void
}

class EffectRunner implements TrackingObserver {
  readonly nodes = new Map<Node, number>()
  readonly derived = false

  private cleanups: EffectCleanup[] = []
  private active = true
  private running = false
  private queued = false

  constructor(
    private readonly callback: EffectCallback,
    private readonly options: EffectOptions = {}
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
      this.runCleanup()
      runTracked(this, () =>
        this.callback((cleanup) => {
          this.cleanups.push(cleanup)
        })
      )
    } catch (err) {
      if (this.options.onError) {
        this.options.onError(err)
      } else {
        throw err
      }
    } finally {
      this.running = false
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

export function effect(fn: EffectCallback, options?: EffectOptions): StopEffect {
  const runner = new EffectRunner(fn, options)
  return () => runner.stop()
}
