function redirectFeed() {
  chrome.storage.sync.get(["hideTrending", "hideSubs"], function (result) {
    if (
      (result.hideTrending === true && window.location.pathname.startsWith("/feed/trending")) ||
      (result.hideSubs === true && window.location.pathname.startsWith("/feed/subscriptions"))
    ) {
      chrome.runtime.sendMessage({ redirect: "https://www.youtube.com/" });
    }
  });
}

// YouTube changes pages without reloading the content scripts.
document.addEventListener("yt-navigate-finish", redirectFeed);
redirectFeed();
