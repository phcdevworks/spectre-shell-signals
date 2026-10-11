import { Node } from './internals/node'
import { assertWritable, endBatch, recordWrite, startBatch } from './internals/tracking'

export interface Signal<T> {
  get value(): T
  set value(nextValue: T)
  peek(): T
}

class SignalImpl<T> implements Signal<T> {
  readonly node = new Node()

  constructor(private currentValue: T) {}

  get value(): T {
    this.node.track()
    return this.currentValue
  }

  set value(nextValue: T) {
    assertWritable()

    if (Object.is(this.currentValue, nextValue)) {
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

export function signal<T>(initialValue: T): Signal<T> {
  return new SignalImpl(initialValue)
}
