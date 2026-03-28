import {
  clearDependencies,
  Dependency,
  type CleanupRegistrar,
  type DependencyObserver,
  withObserver,
} from './internals/graph';

export type EffectCleanup = () => void;
export type EffectCallback = (onCleanup: CleanupRegistrar) => void;
export type StopEffect = () => void;

class EffectRunner implements DependencyObserver {
  readonly dependencies = new Set<Dependency>();

  private cleanup: EffectCleanup | undefined;
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
    this.runCleanup();
    clearDependencies(this);
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
    clearDependencies(this);

    try {
      withObserver(this, () =>
        this.callback((cleanup) => {
          this.cleanup = cleanup;
        }),
      );
    } finally {
      this.running = false;
    }
  }

  private runCleanup(): void {
    const cleanup = this.cleanup;
    this.cleanup = undefined;
    cleanup?.();
  }
}

export function effect(fn: EffectCallback): StopEffect {
  const runner = new EffectRunner(fn);
  return () => runner.stop();
}
