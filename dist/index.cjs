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
function clearTracking(observer) {
  for (const node of observer.nodes) {
    node.subscribers.delete(observer);
  }
  observer.nodes.clear();
}

// src/internals/node.ts
var Node = class {
  constructor() {
    this.subscribers = /* @__PURE__ */ new Set();
  }
  track() {
    const observer = getActiveObserver();
    if (!observer) {
      return;
    }
    this.subscribers.add(observer);
    observer.nodes.add(this);
  }
  trigger() {
    const subscribers = Array.from(this.subscribers);
    for (const subscriber of subscribers) {
      subscriber.notify();
    }
  }
};

// src/computed.ts
var ComputedImpl = class {
  constructor(computeValue) {
    this.computeValue = computeValue;
    this.nodes = /* @__PURE__ */ new Set();
    this.node = new Node();
    this.dirty = true;
    this.evaluating = false;
  }
  get value() {
    this.node.track();
    if (this.dirty) {
      this.recompute();
    }
    return this.cachedValue;
  }
  notify() {
    if (this.dirty) {
      return;
    }
    this.dirty = true;
    this.node.trigger();
  }
  dispose() {
    clearTracking(this);
  }
  recompute() {
    if (this.evaluating) {
      throw new Error("Circular computed dependencies are not supported.");
    }
    this.evaluating = true;
    clearTracking(this);
    try {
      this.cachedValue = withTracking(this, this.computeValue);
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
  constructor(callback) {
    this.callback = callback;
    this.nodes = /* @__PURE__ */ new Set();
    this.cleanups = [];
    this.active = true;
    this.running = false;
    this.run();
  }
  notify() {
    if (!this.active) {
      return;
    }
    this.run();
  }
  stop() {
    if (!this.active) {
      return;
    }
    this.active = false;
    clearTracking(this);
    this.runCleanup();
  }
  run() {
    if (!this.active) {
      return;
    }
    if (this.running) {
      throw new Error("Effects cannot synchronously trigger themselves.");
    }
    this.running = true;
    this.runCleanup();
    clearTracking(this);
    try {
      withTracking(
        this,
        () => this.callback((cleanup) => {
          this.cleanups.push(cleanup);
        })
      );
    } finally {
      this.running = false;
    }
  }
  runCleanup() {
    const cleanups = this.cleanups;
    this.cleanups = [];
    for (let index = cleanups.length - 1; index >= 0; index -= 1) {
      cleanups[index]?.();
    }
  }
};
function effect(fn) {
  const runner = new EffectRunner(fn);
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
    if (Object.is(this.currentValue, nextValue)) {
      return;
    }
    this.currentValue = nextValue;
    this.node.trigger();
  }
};
function signal(initialValue) {
  return new SignalImpl(initialValue);
}

exports.computed = computed;
exports.effect = effect;
exports.signal = signal;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map