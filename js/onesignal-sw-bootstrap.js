// Shared Service Worker bootstrap for OneSignal v16.
// Registers a synchronous top-level 'message' listener during initial evaluation
// and absorbs deferred WorkerMessengerSW._listen() registrations (sw.ts:83)
// so Chromium does not emit an initial-evaluation warning after importScripts.
(function (globalScope) {
  const deferredMessageListeners = [];
  let isInitialEval = true;
  const nativeAdd = globalScope.addEventListener.bind(globalScope);
  const nativeRemove = globalScope.removeEventListener.bind(globalScope);

  function findListenerIndex(listener) {
    return deferredMessageListeners.findIndex((entry) => entry.listener === listener);
  }

  function invokeDeferredListeners(event) {
    for (let i = 0; i < deferredMessageListeners.length; i++) {
      const entry = deferredMessageListeners[i];
      if (!entry) continue;
      if (entry.once) {
        deferredMessageListeners.splice(i, 1);
        i--;
      }
      if (typeof entry.listener === "function") {
        entry.listener.call(globalScope, event);
      } else if (entry.listener && typeof entry.listener.handleEvent === "function") {
        entry.listener.handleEvent(event);
      }
    }
  }

  nativeAdd("message", function (event) {
    if (deferredMessageListeners.length > 0) {
      invokeDeferredListeners(event);
      return;
    }
    if (typeof event.waitUntil === "function") {
      let resolvePending;
      event.waitUntil(new Promise((resolve) => { resolvePending = resolve; }));
      setTimeout(function () {
        const pendingPromises = [];
        const bufferedEvent = new Proxy(event, {
          get(target, prop) {
            if (prop === "waitUntil") {
              return function (promise) { pendingPromises.push(Promise.resolve(promise)); };
            }
            const value = target[prop];
            return typeof value === "function" ? value.bind(target) : value;
          }
        });
        try {
          invokeDeferredListeners(bufferedEvent);
        } finally {
          Promise.allSettled(pendingPromises).then(resolvePending);
        }
      }, 0);
    }
  });

  globalScope.addEventListener = function (type, listener, options) {
    if (type === "message" && !isInitialEval && listener) {
      if (findListenerIndex(listener) === -1) {
        deferredMessageListeners.push({
          listener,
          once: Boolean(options && typeof options === "object" && options.once)
        });
      }
      return;
    }
    return nativeAdd(type, listener, options);
  };

  globalScope.removeEventListener = function (type, listener, options) {
    if (type === "message") {
      const idx = findListenerIndex(listener);
      if (idx !== -1) deferredMessageListeners.splice(idx, 1);
    }
    return nativeRemove(type, listener, options);
  };

  try {
    importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
  } finally {
    isInitialEval = false;
  }
})(self);
