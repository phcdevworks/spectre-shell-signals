interface CleanupRegistrar {
    (cleanup: () => void): void;
}
declare function untracked<T>(fn: () => T): T;

type EffectCleanup = () => void;
type EffectCallback = (onCleanup: CleanupRegistrar) => void;
interface StopEffect {
    (): void;
    [Symbol.dispose](): void;
}
interface EffectOptions {
    onError?: (err: unknown) => void;
}
declare function effect(fn: EffectCallback, options?: EffectOptions): StopEffect;

interface AsyncEffectContext {
    onCleanup: CleanupRegistrar;
    signal: AbortSignal;
}
type AsyncEffectCallback = (context: AsyncEffectContext) => void | Promise<void>;
interface AsyncEffectOptions {
    onError?: (err: unknown) => void;
}
declare function asyncEffect(fn: AsyncEffectCallback, options?: AsyncEffectOptions): StopEffect;

declare function batch(fn: () => void): void;

interface ReadonlySignal<T> {
    readonly value: T;
    peek(): T;
}
interface Signal<T> extends ReadonlySignal<T> {
    get value(): T;
    set value(nextValue: T);
}
interface SignalOptions<T> {
    equals?: (previous: T, next: T) => boolean;
}
declare function signal<T>(initialValue: T, options?: SignalOptions<T>): Signal<T>;

interface Computed<T> extends ReadonlySignal<T> {
    dispose(): void;
    [Symbol.dispose](): void;
}
interface ComputedOptions<T> {
    equals?: (previous: T, next: T) => boolean;
}
declare function computed<T>(fn: () => T, options?: ComputedOptions<T>): Computed<T>;

export { asyncEffect, batch, computed, effect, signal, untracked };
export type { AsyncEffectCallback, AsyncEffectContext, AsyncEffectOptions, CleanupRegistrar, Computed, ComputedOptions, EffectCallback, EffectCleanup, EffectOptions, ReadonlySignal, Signal, SignalOptions, StopEffect };
