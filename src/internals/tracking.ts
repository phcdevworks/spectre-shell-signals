import type { Node } from './node'

export interface CleanupRegistrar {
  (cleanup: () => void): void
}

export interface TrackingObserver {
  readonly nodes: Map<Node, number>
  readonly watched: boolean
  readonly derived: boolean
  notify(): void
}

let activeObserver: TrackingObserver | null = null
let insideDerived = false

export function getActiveObserver(): TrackingObserver | null {
  return activeObserver
}

export function withTracking<T>(observer: TrackingObserver, fn: () => T): T {
  const previous = activeObserver
  activeObserver = observer

  try {
    return fn()
  } finally {
    activeObserver = previous
  }
}

export function untracked<T>(fn: () => T): T {
  const previous = activeObserver
  const previousInsideDerived = insideDerived
  insideDerived ||= previous?.derived === true
  activeObserver = null

  try {
    return fn()
  } finally {
    activeObserver = previous
    insideDerived = previousInsideDerived
  }
}

export function runTracked<T>(observer: TrackingObserver, fn: () => T): T {
  const previousNodes = Array.from(observer.nodes.keys())
  observer.nodes.clear()

  try {
    return withTracking(observer, fn)
  } finally {
    for (const node of previousNodes) {
      if (!observer.nodes.has(node)) {
        node.unsubscribe(observer)
      }
    }
  }
}

export function clearTracking(observer: TrackingObserver): void {
  unsubscribeTracked(observer)
  observer.nodes.clear()
}

export function subscribeTracked(observer: TrackingObserver): void {
  for (const node of observer.nodes.keys()) {
    node.subscribe(observer)
  }
}

export function unsubscribeTracked(observer: TrackingObserver): void {
  for (const node of observer.nodes.keys()) {
    node.unsubscribe(observer)
  }
}

let writeVersion = 0

export function getWriteVersion(): number {
  return writeVersion
}

export function assertWritable(): void {
  if (activeObserver ? activeObserver.derived : insideDerived) {
    throw new Error('Signals cannot be written inside a computed.')
  }
}

export function recordWrite(): void {
  writeVersion++
}

export function dependenciesChanged(observer: TrackingObserver): boolean {
  for (const [node, seenVersion] of observer.nodes) {
    try {
      node.refresh()
    } catch {
      return true
    }

    if (node.version !== seenVersion) {
      return true
    }
  }

  return false
}

let batchDepth = 0
const pendingEffects = new Set<() => void>()

export function queueEffect(flush: () => void): void {
  pendingEffects.add(flush)
}

export function startBatch(): void {
  batchDepth++
}

export function endBatch(): void {
  if (--batchDepth !== 0 || pendingEffects.size === 0) {
    return
  }

  const snapshot = Array.from(pendingEffects)
  pendingEffects.clear()
  let failed = false
  let firstError: unknown
  for (const flush of snapshot) {
    try {
      flush()
    } catch (err) {
      if (!failed) {
        failed = true
        firstError = err
      }
    }
  }
  if (failed) {
    throw firstError
  }
}
