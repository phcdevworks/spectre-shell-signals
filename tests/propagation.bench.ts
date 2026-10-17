import { test } from 'vitest'

import { batch, computed, effect, signal } from '../dist/index.js'

test('signal write without observers', async ({ bench }) => {
  const source = signal(0)

  await bench('signal write', () => {
    source.value++
  }).run()
})

test('wide fan-out', async ({ bench }) => {
  const source = signal(0)
  for (let index = 0; index < 1000; index++) {
    effect(() => {
      void source.value
    })
  }

  await bench('1 signal -> 1000 effects', () => {
    source.value++
  }).run()
})

test('deep chain', async ({ bench }) => {
  const source = signal(0)
  let tail = computed(() => source.value)
  for (let index = 0; index < 100; index++) {
    const previous = tail
    tail = computed(() => previous.value + 1)
  }
  const end = tail
  effect(() => {
    void end.value
  })

  await bench('signal -> 100 computeds -> effect', () => {
    source.value++
  }).run()
})

test('diamond', async ({ bench }) => {
  const source = signal(0)
  const branches = Array.from({ length: 100 }, (_, index) => computed(() => source.value + index))
  effect(() => {
    let sum = 0
    for (const branch of branches) {
      sum += branch.value
    }
    void sum
  })

  await bench('signal -> 100 computeds -> 1 effect', () => {
    source.value++
  }).run()
})

test('batched writes', async ({ bench }) => {
  const sources = Array.from({ length: 100 }, () => signal(0))
  effect(() => {
    for (const source of sources) {
      void source.value
    }
  })

  await bench('100 writes in one batch -> 1 effect', () => {
    batch(() => {
      for (const source of sources) {
        source.value++
      }
    })
  }).run()
})

test('dynamic dependencies', async ({ bench }) => {
  const toggle = signal(true)
  const left = signal(0)
  const right = signal(0)
  effect(() => {
    void (toggle.value ? left.value : right.value)
  })

  await bench('effect switching dependencies', () => {
    toggle.value = !toggle.value
  }).run()
})
