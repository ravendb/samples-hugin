"use strict";

function createLatestWinsQueue(now = () => Date.now()) {
  let running = Promise.resolve();
  let current = null;
  let latestToken = 0;

  function acquire(description) {
    const token = ++latestToken;
    const waitFor = running;
    let finish;
    const done = new Promise((resolve) => { finish = resolve; });
    let released = false;

    return {
      async wait() {
        const started = now();
        await waitFor;
        const queueWaitMs = now() - started;
        if (token !== latestToken) return { superseded: true, queueWaitMs };
        current = description;
        running = done;
        return { superseded: false, queueWaitMs };
      },
      release() {
        if (released) return;
        released = true;
        if (current === description) current = null;
        finish();
      },
    };
  }

  return {
    acquire,
    status() {
      if (!current) return { busy: false, current: null };
      return {
        busy: true,
        current: {
          kind: current.kind,
          mode: current.mode,
          q: String(current.q || "").slice(0, 80),
          forMs: Math.max(0, now() - current.startedAt),
        },
      };
    },
  };
}

module.exports = { createLatestWinsQueue };
