export interface CleanupRegistrar {
  (cleanup: () => void): void;
}

export interface DependencyObserver {
  readonly dependencies: Set<Dependency>;
  notify(): void;
}

export class Dependency {
  readonly subscribers = new Set<DependencyObserver>();

  track(): void {
    const observer = getActiveObserver();

    if (!observer) {
      return;
    }

    this.subscribers.add(observer);
    observer.dependencies.add(this);
  }

  trigger(): void {
    const subscribers = Array.from(this.subscribers);

    for (const subscriber of subscribers) {
      subscriber.notify();
    }
  }
}

let activeObserver: DependencyObserver | null = null;

export function getActiveObserver(): DependencyObserver | null {
  return activeObserver;
}

export function withObserver<T>(
  observer: DependencyObserver,
  fn: () => T,
): T {
  const previous = activeObserver;
  activeObserver = observer;

  try {
    return fn();
  } finally {
    activeObserver = previous;
  }
}

export function clearDependencies(observer: DependencyObserver): void {
  for (const dependency of observer.dependencies) {
    dependency.subscribers.delete(observer);
  }

  observer.dependencies.clear();
}
