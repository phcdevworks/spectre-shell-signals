import { computed, effect, signal, type ReadonlySignal } from '../../dist/index.js'

const count = signal(1)
const doubled = computed(() => count.value * 2)
const view: ReadonlySignal<number> = doubled
const stop = effect(() => {
  void view.value
})

stop[Symbol.dispose]()
doubled[Symbol.dispose]()
