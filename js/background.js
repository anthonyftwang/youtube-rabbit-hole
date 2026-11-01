chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason !== "install") {
    return;
  }
  chrome.storage.sync.set({
    hideHomePage: true,
    hideTrending: true,
    hideSubs: true,
    hideSideBar: true,
    hideComments: true,
    hideNav: true,
    hideEndWall: true,
  });
});

chrome.runtime.onMessage.addListener(function (request, sender) {
  if (sender.tab && request && request.redirect === "https://www.youtube.com/") {
    chrome.tabs.update(sender.tab.id, { url: request.redirect });
  }
});
