declare function batch(fn: () => void): void;

interface Computed<T> {
    readonly value: T;
    dispose(): void;
}
declare function computed<T>(fn: () => T): Computed<T>;

interface CleanupRegistrar {
    (cleanup: () => void): void;
}

type EffectCleanup = () => void;
type EffectCallback = (onCleanup: CleanupRegistrar) => void;
type StopEffect = () => void;
interface EffectOptions {
    onError?: (err: unknown) => void;
}
declare function effect(fn: EffectCallback, options?: EffectOptions): StopEffect;

interface Signal<T> {
    get value(): T;
    set value(nextValue: T);
    peek(): T;
}
declare function signal<T>(initialValue: T): Signal<T>;

export { type CleanupRegistrar, type Computed, type EffectCallback, type EffectCleanup, type EffectOptions, type Signal, type StopEffect, batch, computed, effect, signal };
