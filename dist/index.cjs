'use strict';

// src/internals/tracking.ts
var activeObserver = null;
function getActiveObserver() {
  return activeObserver;
}
function withTracking(observer, fn) {
  const previous = activeObserver;
  activeObserver = observer;
  try {
    return fn();
  } finally {
    activeObserver = previous;
  }
}
function runTracked(observer, fn) {
  const previousNodes = Array.from(observer.nodes.keys());
  observer.nodes.clear();
  try {
    return withTracking(observer, fn);
  } finally {
    for (const node of previousNodes) {
      if (!observer.nodes.has(node)) {
        node.unsubscribe(observer);
      }
    }
  }
}
function clearTracking(observer) {
  unsubscribeTracked(observer);
  observer.nodes.clear();
}
function subscribeTracked(observer) {
  for (const node of observer.nodes.keys()) {
    node.subscribe(observer);
  }
}
function unsubscribeTracked(observer) {
  for (const node of observer.nodes.keys()) {
    node.unsubscribe(observer);
  }
}
var writeVersion = 0;
function getWriteVersion() {
  return writeVersion;
}
function assertWritable() {
  if (activeObserver?.derived) {
    throw new Error("Signals cannot be written inside a computed.");
  }
}
function recordWrite() {
  writeVersion++;
}
function dependenciesChanged(observer) {
  for (const [node, seenVersion] of observer.nodes) {
    try {
      node.refresh();
    } catch {
      return true;
    }
    if (node.version !== seenVersion) {
      return true;
    }
  }
  return false;
}
var batchDepth = 0;
var pendingEffects = /* @__PURE__ */ new Set();
function queueEffect(flush) {
  pendingEffects.add(flush);
}
function startBatch() {
  batchDepth++;
}
function endBatch() {
  if (--batchDepth === 0) {
    const snapshot = Array.from(pendingEffects);
    pendingEffects.clear();
    const errors = [];
    for (const flush of snapshot) {
      try {
        flush();
      } catch (err) {
        errors.push(err);
      }
    }
    if (errors.length > 0) {
      throw errors[0];
    }
  }
}

// src/internals/node.ts
var Node = class {
  constructor(hooks = {}) {
    this.hooks = hooks;
    this.subscribers = /* @__PURE__ */ new Set();
    this.version = 0;
  }
  refresh() {
    this.hooks.refresh?.();
  }
  track() {
    const observer = getActiveObserver();
    if (!observer) {
      return;
    }
    observer.nodes.set(this, this.version);
    if (observer.watched) {
      this.subscribe(observer);
    }
  }
  subscribe(observer) {
    if (this.subscribers.has(observer)) {
      return;
    }
    this.subscribers.add(observer);
    if (this.subscribers.size === 1) {
      this.hooks.watch?.();
    }
  }
  unsubscribe(observer) {
    if (!this.subscribers.delete(observer)) {
      return;
    }
    if (this.subscribers.size === 0) {
      this.hooks.unwatch?.();
    }
  }
  trigger() {
    const subscribers = Array.from(this.subscribers);
    for (const subscriber of subscribers) {
      subscriber.notify();
    }
  }
};

// src/asyncEffect.ts
var AsyncEffectRunner = class {
  constructor(callback, options = {}) {
    this.callback = callback;
    this.options = options;
    this.nodes = /* @__PURE__ */ new Map();
    this.derived = false;
    this.cleanups = [];
    this.active = true;
    this.running = false;
    this.queued = false;
    this.controller = null;
    this.run();
  }
  get watched() {
    return this.active;
  }
  notify() {
    if (!this.active || this.queued) {
      return;
    }
    this.queued = true;
    queueEffect(() => {
      this.queued = false;
      if (this.active && dependenciesChanged(this)) {
        this.run();
      }
    });
  }
  stop() {
    if (!this.active) {
      return;
    }
    this.active = false;
    clearTracking(this);
    this.controller?.abort();
    try {
      this.runCleanup();
    } catch (err) {
      if (this.options.onError) {
        this.options.onError(err);
      } else {
        throw err;
      }
    }
  }
  run() {
    if (!this.active) {
      return;
    }
    if (this.running) {
      throw new Error("Effects cannot synchronously trigger themselves.");
    }
    this.running = true;
    try {
      this.controller?.abort();
      this.runCleanup();
      const controller = new AbortController();
      this.controller = controller;
      const result = runTracked(
        this,
        () => this.callback({
          signal: controller.signal,
          onCleanup: (cleanup) => {
            if (controller.signal.aborted) {
              cleanup();
            } else {
              this.cleanups.push(cleanup);
            }
          }
        })
      );
      if (result && typeof result.then === "function") {
        result.catch((err) => {
          if (controller.signal.aborted) {
            return;
          }
          this.reportError(err);
        });
      }
    } catch (err) {
      this.reportError(err);
    } finally {
      this.running = false;
    }
  }
  reportError(err) {
    if (this.options.onError) {
      this.options.onError(err);
    } else {
      throw err;
    }
  }
  runCleanup() {
    const cleanups = this.cleanups;
    this.cleanups = [];
    const errors = [];
    for (let index = cleanups.length - 1; index >= 0; index -= 1) {
      try {
        cleanups[index]?.();
      } catch (err) {
        errors.push(err);
      }
    }
    if (errors.length > 0) {
      throw errors[0];
    }
  }
};
function asyncEffect(fn, options) {
  const runner = new AsyncEffectRunner(fn, options);
  return () => runner.stop();
}

// src/batch.ts
function batch(fn) {
  startBatch();
  try {
    fn();
  } finally {
    endBatch();
  }
}

// src/computed.ts
var ComputedImpl = class {
  constructor(computeValue) {
    this.computeValue = computeValue;
    this.nodes = /* @__PURE__ */ new Map();
    this.derived = true;
    this.node = new Node({
      refresh: () => this.refresh(),
      watch: () => subscribeTracked(this),
      unwatch: () => {
        unsubscribeTracked(this);
        this.notified = false;
      }
    });
    this.initialized = false;
    this.dirty = true;
    this.notified = false;
    this.evaluating = false;
    this.checkedAtWrite = -1;
  }
  get watched() {
    return this.node.subscribers.size > 0;
  }
  get value() {
    try {
      this.refresh();
    } finally {
      this.node.track();
    }
    return this.cachedValue;
  }
  notify() {
    if (this.notified) {
      return;
    }
    this.notified = true;
    this.node.trigger();
  }
  dispose() {
    clearTracking(this);
  }
  refresh() {
    if (this.evaluating) {
      throw new Error("Circular computed dependencies are not supported.");
    }
    if (!this.dirty && !this.isStale()) {
      return;
    }
    try {
      if (this.dirty || dependenciesChanged(this)) {
        this.recompute();
      }
      this.checkedAtWrite = getWriteVersion();
    } finally {
      this.notified = false;
    }
  }
  isStale() {
    return this.watched ? this.notified : this.checkedAtWrite !== getWriteVersion();
  }
  recompute() {
    this.evaluating = true;
    this.dirty = true;
    try {
      const nextValue = runTracked(this, this.computeValue);
      if (!this.initialized || !Object.is(this.cachedValue, nextValue)) {
        this.cachedValue = nextValue;
        this.initialized = true;
        this.node.version++;
      }
      this.dirty = false;
    } finally {
      this.evaluating = false;
    }
  }
};
function computed(fn) {
  return new ComputedImpl(fn);
}

// src/effect.ts
var EffectRunner = class {
  constructor(callback, options = {}) {
    this.callback = callback;
    this.options = options;
    this.nodes = /* @__PURE__ */ new Map();
    this.derived = false;
    this.cleanups = [];
    this.active = true;
    this.running = false;
    this.queued = false;
    this.run();
  }
  get watched() {
    return this.active;
  }
  notify() {
    if (!this.active || this.queued) {
      return;
    }
    this.queued = true;
    queueEffect(() => {
      this.queued = false;
      if (this.active && dependenciesChanged(this)) {
        this.run();
      }
    });
  }
  stop() {
    if (!this.active) {
      return;
    }
    this.active = false;
    clearTracking(this);
    try {
      this.runCleanup();
    } catch (err) {
      if (this.options.onError) {
        this.options.onError(err);
      } else {
        throw err;
      }
    }
  }
  run() {
    if (!this.active) {
      return;
    }
    if (this.running) {
      throw new Error("Effects cannot synchronously trigger themselves.");
    }
    this.running = true;
    try {
      this.runCleanup();
      runTracked(
        this,
        () => this.callback((cleanup) => {
          this.cleanups.push(cleanup);
        })
      );
    } catch (err) {
      if (this.options.onError) {
        this.options.onError(err);
      } else {
        throw err;
      }
    } finally {
      this.running = false;
    }
  }
  runCleanup() {
    const cleanups = this.cleanups;
    this.cleanups = [];
    const errors = [];
    for (let index = cleanups.length - 1; index >= 0; index -= 1) {
      try {
        cleanups[index]?.();
      } catch (err) {
        errors.push(err);
      }
    }
    if (errors.length > 0) {
      throw errors[0];
    }
  }
};
function effect(fn, options) {
  const runner = new EffectRunner(fn, options);
  return () => runner.stop();
}

// src/signal.ts
var SignalImpl = class {
  constructor(currentValue) {
    this.currentValue = currentValue;
    this.node = new Node();
  }
  get value() {
    this.node.track();
    return this.currentValue;
  }
  set value(nextValue) {
    assertWritable();
    if (Object.is(this.currentValue, nextValue)) {
      return;
    }
    this.currentValue = nextValue;
    this.node.version++;
    recordWrite();
    startBatch();
    try {
      this.node.trigger();
    } finally {
      endBatch();
    }
  }
  peek() {
    return this.currentValue;
  }
};
function signal(initialValue) {
  return new SignalImpl(initialValue);
}

exports.asyncEffect = asyncEffect;
exports.batch = batch;
exports.computed = computed;
exports.effect = effect;
exports.signal = signal;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map