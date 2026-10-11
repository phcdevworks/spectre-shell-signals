import {
  clearTracking,
  dependenciesChanged,
  getWriteVersion,
  runTracked,
  subscribeTracked,
  type TrackingObserver,
  unsubscribeTracked,
} from './internals/tracking'
import { Node } from './internals/node'

export interface Computed<T> {
  readonly value: T
  dispose(): void
}

class ComputedImpl<T> implements Computed<T>, TrackingObserver {
  readonly nodes = new Map<Node, number>()
  readonly derived = true
  readonly node = new Node({
    refresh: () => this.refresh(),
    watch: () => subscribeTracked(this),
    unwatch: () => {
      unsubscribeTracked(this)
      this.notified = false
    },
  })

  private cachedValue!: T
  private initialized = false
  private dirty = true
  private notified = false
  private evaluating = false
  private checkedAtWrite = -1

  constructor(private readonly computeValue: () => T) {}

  get watched(): boolean {
    return this.node.subscribers.size > 0
  }

  get value(): T {
    try {
      this.refresh()
    } finally {
      this.node.track()
    }

    return this.cachedValue
  }

  notify(): void {
    if (this.notified) {
      return
    }

    this.notified = true
    this.node.trigger()
  }

  dispose(): void {
    clearTracking(this)
  }

  private refresh(): void {
    if (this.evaluating) {
      throw new Error('Circular computed dependencies are not supported.')
    }

    if (!this.dirty && !this.isStale()) {
      return
    }

    try {
      if (this.dirty || dependenciesChanged(this)) {
        this.recompute()
      }
      this.checkedAtWrite = getWriteVersion()
    } finally {
      this.notified = false
    }
  }

  private isStale(): boolean {
    return this.watched ? this.notified : this.checkedAtWrite !== getWriteVersion()
  }

  private recompute(): void {
    this.evaluating = true
    this.dirty = true

    try {
      const nextValue = runTracked(this, this.computeValue)
      if (!this.initialized || !Object.is(this.cachedValue, nextValue)) {
        this.cachedValue = nextValue
        this.initialized = true
        this.node.version++
      }
      this.dirty = false
    } finally {
      this.evaluating = false
    }
  }
}

export function computed<T>(fn: () => T): Computed<T> {
  return new ComputedImpl(fn)
}
