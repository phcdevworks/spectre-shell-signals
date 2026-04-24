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
declare function effect(fn: EffectCallback): StopEffect;

interface Signal<T> {
    get value(): T;
    set value(nextValue: T);
}
declare function signal<T>(initialValue: T): Signal<T>;

export { type CleanupRegistrar, type Computed, type EffectCallback, type EffectCleanup, type Signal, type StopEffect, computed, effect, signal };
