import { Node } from './internals/node';

export interface Signal<T> {
  get value(): T;
  set value(nextValue: T);
}

class SignalImpl<T> implements Signal<T> {
  readonly node = new Node();

  constructor(private currentValue: T) {}

  get value(): T {
    this.node.track();
    return this.currentValue;
  }

  set value(nextValue: T) {
    if (Object.is(this.currentValue, nextValue)) {
      return;
    }

    this.currentValue = nextValue;
    this.node.trigger();
  }
}

export function signal<T>(initialValue: T): Signal<T> {
  return new SignalImpl(initialValue);
}
