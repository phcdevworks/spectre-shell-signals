export {
  asyncEffect,
  type AsyncEffectCallback,
  type AsyncEffectContext,
  type AsyncEffectOptions,
} from './asyncEffect'
export { batch } from './batch'
export { computed, type Computed, type ComputedOptions } from './computed'
export {
  effect,
  type CleanupRegistrar,
  type EffectCallback,
  type EffectCleanup,
  type EffectOptions,
  type StopEffect,
} from './effect'
export { signal, type ReadonlySignal, type Signal, type SignalOptions } from './signal'
export { untracked } from './internals/tracking'

// Public types use Symbol.dispose; declaring it keeps consumers on pre-ESNext libs compiling.
// Matches the lib.esnext.disposable declaration, so the two merge cleanly.
declare global {
  interface SymbolConstructor {
    readonly dispose: unique symbol
  }
}
