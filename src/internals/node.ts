import { getActiveObserver, type TrackingObserver } from './tracking';

export class Node {
  readonly subscribers = new Set<TrackingObserver>();

  track(): void {
    const observer = getActiveObserver();

    if (!observer) {
      return;
    }

    this.subscribers.add(observer);
    observer.nodes.add(this);
  }

  trigger(): void {
    const subscribers = Array.from(this.subscribers);

    for (const subscriber of subscribers) {
      subscriber.notify();
    }
  }
}
