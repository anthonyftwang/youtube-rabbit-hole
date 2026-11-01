importScripts("preferences.js");

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason !== "install") return;
  chrome.storage.sync.get(DEFAULT_PREFS, function (preferences) {
    chrome.storage.sync.set(preferences);
  });
});

chrome.runtime.onMessage.addListener(function (request, sender) {
  if (sender.tab && request && request.redirect === "https://www.youtube.com/") {
    chrome.tabs.update(sender.tab.id, { url: request.redirect });
  }
});
