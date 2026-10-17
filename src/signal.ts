import { Node } from './internals/node'
import { assertWritable, endBatch, recordWrite, startBatch } from './internals/tracking'

export interface ReadonlySignal<T> {
  readonly value: T
  peek(): T
}

export interface Signal<T> extends ReadonlySignal<T> {
  get value(): T
  set value(nextValue: T)
}

export interface SignalOptions<T> {
  equals?: (previous: T, next: T) => boolean
}

class SignalImpl<T> implements Signal<T> {
  readonly node = new Node()
  private readonly equals: (previous: T, next: T) => boolean

  constructor(
    private currentValue: T,
    options: SignalOptions<T>
  ) {
    this.equals = options.equals ?? Object.is
  }

  get value(): T {
    this.node.track()
    return this.currentValue
  }

  set value(nextValue: T) {
    assertWritable()

    if (this.equals(this.currentValue, nextValue)) {
      return
    }

    this.currentValue = nextValue
    this.node.version++
    recordWrite()
    startBatch()
    try {
      this.node.trigger()
    } finally {
      endBatch()
    }
  }

  peek(): T {
    return this.currentValue
  }
}

export function signal<T>(initialValue: T, options: SignalOptions<T> = {}): Signal<T> {
  return new SignalImpl(initialValue, options)
}
