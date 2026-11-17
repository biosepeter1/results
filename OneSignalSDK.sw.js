// Synchronous root event listener required by Chromium initial-evaluation rules
self.addEventListener("message", () => {});
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
