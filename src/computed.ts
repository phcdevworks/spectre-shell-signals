import {
  clearTracking,
  type TrackingObserver,
  withTracking,
} from './internals/tracking';
import { Node } from './internals/node';

export interface Computed<T> {
  readonly value: T;
}

class ComputedImpl<T> implements Computed<T>, TrackingObserver {
  readonly nodes = new Set<Node>();
  readonly node = new Node();

  private cachedValue!: T;
  private dirty = true;
  private evaluating = false;

  constructor(private readonly computeValue: () => T) {}

  get value(): T {
    this.node.track();

    if (this.dirty) {
      this.recompute();
    }

    return this.cachedValue;
  }

  notify(): void {
    if (this.dirty) {
      return;
    }

    this.dirty = true;
    this.node.trigger();
  }

  private recompute(): void {
    if (this.evaluating) {
      throw new Error('Circular computed dependencies are not supported.');
    }

    this.evaluating = true;
    clearTracking(this);

    try {
      this.cachedValue = withTracking(this, this.computeValue);
      this.dirty = false;
    } finally {
      this.evaluating = false;
    }
  }
}

export function computed<T>(fn: () => T): Computed<T> {
  return new ComputedImpl(fn);
}
