import { endBatch, startBatch } from './internals/tracking'

export function batch(fn: () => void): void {
  startBatch()
  try {
    fn()
  } finally {
    endBatch()
  }
}
