chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({
    hideHomePage: true,
    hideTrending: true,
    hideSubs: true,
    hideSideBar: true,
    hideComments: true,
    hideNav: true,
    hideEndWall: true,
  });

  chrome.runtime.onMessage.addListener(function (request, sender) {
    chrome.tabs.update(sender.tab.id, { url: request.redirect });
  });

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      videoRule,
      homeRule,
      othersRule,
    ]);
  });

  var videoRule = {
    conditions: [
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { urlContains: "youtube.com/watch?" },
      }),
    ],
    actions: [
      new chrome.declarativeContent.RequestContentScript({
        js: ["js/video.js"],
      }),
    ],
  };

  var homeRule = {
    conditions: [
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: "www.youtube.com", pathPrefix: "/?gl=" },
      }),
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: "www.youtube.com", pathEquals: "/" },
      }),
    ],
    actions: [
      new chrome.declarativeContent.RequestContentScript({
        js: ["js/home.js"],
      }),
    ],
  };

  var othersRule = {
    conditions: [
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { urlContains: "youtube.com/feed/trending" },
      }),
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { urlContains: "youtube.com/feed/subscriptions" },
      }),
    ],
    actions: [
      new chrome.declarativeContent.RequestContentScript({
        js: ["js/others.js"],
      }),
    ],
  };
});
