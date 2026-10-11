import { getActiveObserver, type TrackingObserver } from './tracking'

export interface NodeHooks {
  refresh?: () => void
  watch?: () => void
  unwatch?: () => void
}

export class Node {
  readonly subscribers = new Set<TrackingObserver>()
  version = 0

  constructor(private readonly hooks: NodeHooks = {}) {}

  refresh(): void {
    this.hooks.refresh?.()
  }

  track(): void {
    const observer = getActiveObserver()

    if (!observer) {
      return
    }

    observer.nodes.set(this, this.version)

    if (observer.watched) {
      this.subscribe(observer)
    }
  }

  subscribe(observer: TrackingObserver): void {
    if (this.subscribers.has(observer)) {
      return
    }

    this.subscribers.add(observer)

    if (this.subscribers.size === 1) {
      this.hooks.watch?.()
    }
  }

  unsubscribe(observer: TrackingObserver): void {
    if (!this.subscribers.delete(observer)) {
      return
    }

    if (this.subscribers.size === 0) {
      this.hooks.unwatch?.()
    }
  }

  trigger(): void {
    const subscribers = Array.from(this.subscribers)

    for (const subscriber of subscribers) {
      subscriber.notify()
    }
  }
}
