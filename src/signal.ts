import { Dependency } from './internals/graph';

export interface Signal<T> {
  get value(): T;
  set value(nextValue: T);
}

class SignalImpl<T> implements Signal<T> {
  readonly dependency = new Dependency();

  constructor(private currentValue: T) {}

  get value(): T {
    this.dependency.track();
    return this.currentValue;
  }

  set value(nextValue: T) {
    if (Object.is(this.currentValue, nextValue)) {
      return;
    }

    this.currentValue = nextValue;
    this.dependency.trigger();
  }
}

export function signal<T>(initialValue: T): Signal<T> {
  return new SignalImpl(initialValue);
}
