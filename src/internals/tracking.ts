import type { Node } from './node';

export interface CleanupRegistrar {
  (cleanup: () => void): void;
}

export interface TrackingObserver {
  readonly nodes: Set<Node>;
  notify(): void;
}

let activeObserver: TrackingObserver | null = null;

export function getActiveObserver(): TrackingObserver | null {
  return activeObserver;
}

export function withTracking<T>(observer: TrackingObserver, fn: () => T): T {
  const previous = activeObserver;
  activeObserver = observer;

  try {
    return fn();
  } finally {
    activeObserver = previous;
  }
}

export function clearTracking(observer: TrackingObserver): void {
  for (const node of observer.nodes) {
    node.subscribers.delete(observer);
  }

  observer.nodes.clear();
}
