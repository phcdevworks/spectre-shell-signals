import { describe, expect, it, vi } from 'vitest';

import { computed, effect, signal } from '../src';

describe('@phcdevworks/spectre-shell-signals', () => {
  it('reads and writes signal values through .value', () => {
    const count = signal(0);

    expect(count.value).toBe(0);

    count.value = 2;

    expect(count.value).toBe(2);
  });

  it('does not notify dependents when a signal is assigned the same value', () => {
    const count = signal(1);
    const runs: number[] = [];

    effect(() => {
      runs.push(count.value);
    });

    count.value = 1;

    expect(runs).toEqual([1]);
  });

  it('evaluates computed values lazily', () => {
    const count = signal(2);
    const spy = vi.fn(() => count.value * 2);
    const doubled = computed(spy);

    expect(spy).not.toHaveBeenCalled();

    expect(doubled.value).toBe(4);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('caches computed values until dependencies change', () => {
    const count = signal(2);
    const spy = vi.fn(() => count.value * 2);
    const doubled = computed(spy);

    expect(doubled.value).toBe(4);
    expect(doubled.value).toBe(4);
    expect(spy).toHaveBeenCalledTimes(1);

    count.value = 3;

    expect(spy).toHaveBeenCalledTimes(1);
    expect(doubled.value).toBe(6);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('invalidates computed values when dependencies change', () => {
    const count = signal(1);
    const doubled = computed(() => count.value * 2);

    expect(doubled.value).toBe(2);

    count.value = 5;

    expect(doubled.value).toBe(10);
  });

  it('runs effects immediately and re-runs them when dependencies change', () => {
    const count = signal(0);
    const seen: number[] = [];
    const stop = effect(() => {
      seen.push(count.value);
    });

    count.value = 1;
    count.value = 2;
    stop();

    expect(seen).toEqual([0, 1, 2]);
  });

  it('runs effect cleanup before re-running and when disposed', () => {
    const count = signal(0);
    const events: string[] = [];
    const stop = effect((onCleanup) => {
      const current = count.value;
      events.push(`run:${current}`);
      onCleanup(() => {
        events.push(`cleanup:${current}`);
      });
    });

    count.value = 1;
    stop();

    expect(events).toEqual(['run:0', 'cleanup:0', 'run:1', 'cleanup:1']);
  });

  it('runs multiple cleanup callbacks in reverse registration order', () => {
    const count = signal(0);
    const events: string[] = [];
    const stop = effect((onCleanup) => {
      void count.value;
      onCleanup(() => {
        events.push('first');
      });
      onCleanup(() => {
        events.push('second');
      });
    });

    count.value = 1;
    stop();

    expect(events).toEqual(['second', 'first', 'second', 'first']);
  });

  it('stops effects from responding after disposal', () => {
    const count = signal(0);
    const runs = vi.fn(() => {
      void count.value;
    });
    const stop = effect(runs);

    stop();
    count.value = 1;

    expect(runs).toHaveBeenCalledTimes(1);
  });

  it('throws when an effect synchronously triggers itself', () => {
    const count = signal(0);
    let runs = 0;

    expect(() =>
      effect(() => {
        runs += 1;

        if (count.value === 0) {
          count.value = 1;
        }
      }),
    ).toThrowError('Effects cannot synchronously trigger themselves.');

    expect(runs).toBe(1);
  });

  it('supports nested computed values', () => {
    const count = signal(2);
    const doubled = computed(() => count.value * 2);
    const label = computed(() => `value:${doubled.value}`);

    expect(label.value).toBe('value:4');

    count.value = 3;

    expect(label.value).toBe('value:6');
  });

  it('propagates invalidation through computed chains lazily', () => {
    const count = signal(1);
    const doubled = vi.fn(() => count.value * 2);
    const tripled = vi.fn(() => count.value * 3);
    const doubledSignal = computed(doubled);
    const tripledSignal = computed(tripled);
    const summary = computed(() => doubledSignal.value + tripledSignal.value);

    expect(summary.value).toBe(5);
    expect(summary.value).toBe(5);
    expect(doubled).toHaveBeenCalledTimes(1);
    expect(tripled).toHaveBeenCalledTimes(1);

    count.value = 2;

    expect(doubled).toHaveBeenCalledTimes(1);
    expect(tripled).toHaveBeenCalledTimes(1);
    expect(summary.value).toBe(10);
    expect(doubled).toHaveBeenCalledTimes(2);
    expect(tripled).toHaveBeenCalledTimes(2);
  });

  it('supports multiple subscribers on the same dependency', () => {
    const count = signal(1);
    const first: number[] = [];
    const second: number[] = [];

    effect(() => {
      first.push(count.value);
    });

    effect(() => {
      second.push(count.value);
    });

    count.value = 2;

    expect(first).toEqual([1, 2]);
    expect(second).toEqual([1, 2]);
  });

  it('switches effect dependencies based on the latest execution path', () => {
    const left = signal(1);
    const right = signal(10);
    const useLeft = signal(true);
    const values: number[] = [];

    effect(() => {
      values.push(useLeft.value ? left.value : right.value);
    });

    useLeft.value = false;
    right.value = 11;
    left.value = 2;
    right.value = 12;

    expect(values).toEqual([1, 10, 11, 12]);
  });

  it('switches computed dependencies based on the latest execution path', () => {
    const left = signal(1);
    const right = signal(10);
    const useLeft = signal(true);
    const picked = computed(() => (useLeft.value ? left.value : right.value));

    expect(picked.value).toBe(1);

    useLeft.value = false;
    left.value = 2;

    expect(picked.value).toBe(10);

    right.value = 11;

    expect(picked.value).toBe(11);
  });

  it('allows effects to depend on computed values', () => {
    const count = signal(2);
    const doubled = computed(() => count.value * 2);
    const seen: number[] = [];

    const stop = effect(() => {
      seen.push(doubled.value);
    });

    count.value = 3;
    stop();

    expect(seen).toEqual([4, 6]);
  });

  it('throws for self-referential computed reads', () => {
    const loop: { readonly value: number } = computed(() => loop.value + 1);

    expect(() => loop.value).toThrowError(
      'Circular computed dependencies are not supported.',
    );
  });
});
