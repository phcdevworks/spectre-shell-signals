import {
  type CleanupRegistrar,
  clearTracking,
  type TrackingObserver,
  withTracking,
} from './internals/tracking';
import { Node } from './internals/node';

export type EffectCleanup = () => void;
export type EffectCallback = (onCleanup: CleanupRegistrar) => void;
export type StopEffect = () => void;

class EffectRunner implements TrackingObserver {
  readonly nodes = new Set<Node>();

  private cleanups: EffectCleanup[] = [];
  private active = true;
  private running = false;

  constructor(private readonly callback: EffectCallback) {
    this.run();
  }

  notify(): void {
    if (!this.active) {
      return;
    }

    this.run();
  }

  stop(): void {
    if (!this.active) {
      return;
    }

    this.active = false;
    clearTracking(this);
    this.runCleanup();
  }

  private run(): void {
    if (!this.active) {
      return;
    }

    if (this.running) {
      throw new Error('Effects cannot synchronously trigger themselves.');
    }

    this.running = true;
    this.runCleanup();
    clearTracking(this);

    try {
      withTracking(this, () =>
        this.callback((cleanup) => {
          this.cleanups.push(cleanup);
        }),
      );
    } finally {
      this.running = false;
    }
  }

  private runCleanup(): void {
    const cleanups = this.cleanups;
    this.cleanups = [];

    for (let index = cleanups.length - 1; index >= 0; index -= 1) {
      cleanups[index]?.();
    }
  }
}

export function effect(fn: EffectCallback): StopEffect {
  const runner = new EffectRunner(fn);
  return () => runner.stop();
}
