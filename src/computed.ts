import {
  clearDependencies,
  Dependency,
  type DependencyObserver,
  withObserver,
} from './internals/graph';

export interface Computed<T> {
  readonly value: T;
}

class ComputedImpl<T> implements Computed<T>, DependencyObserver {
  readonly dependencies = new Set<Dependency>();
  readonly dependency = new Dependency();

  private cachedValue!: T;
  private dirty = true;
  private evaluating = false;

  constructor(private readonly computeValue: () => T) {}

  get value(): T {
    this.dependency.track();

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
    this.dependency.trigger();
  }

  private recompute(): void {
    if (this.evaluating) {
      throw new Error('Circular computed dependencies are not supported.');
    }

    this.evaluating = true;
    clearDependencies(this);

    try {
      this.cachedValue = withObserver(this, this.computeValue);
      this.dirty = false;
    } finally {
      this.evaluating = false;
    }
  }
}

export function computed<T>(fn: () => T): Computed<T> {
  return new ComputedImpl(fn);
}
