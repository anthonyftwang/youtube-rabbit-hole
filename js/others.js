chrome.storage.sync.set({hideTrending: true, hideSubs: true}); // for testing

chrome.storage.sync.get(["hideTrending", "hideSubs"], function(result) {
    var hideTrending = result.hideTrending;
    var hideSubs = result.hideSubs;
    if (hideTrending == true && window.location.href.includes("trending")) {
        chrome.runtime.sendMessage({redirect: "https://www.youtube.com/"});
    }
    if (hideSubs == true && window.location.href.includes("subscriptions")) {
        chrome.runtime.sendMessage({redirect: "https://www.youtube.com/"});
    }
});