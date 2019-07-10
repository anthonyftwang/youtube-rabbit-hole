 // Restore prefs to update toggle state
 // Once restored, listen for new changes and save prefs
function restorePrefs() {
    chrome.storage.sync.get("hideHomePage", function(result) {
        var prefHomePage = document.getElementById("hidehomepage");
        prefHomePage.checked = result.hideHomePage;
        prefHomePage.addEventListener("change", function() {
            chrome.storage.sync.set({hideHomePage: this.checked})
        });
    });
    chrome.storage.sync.get("hideTrending", function(result) {
        var prefTrending = document.getElementById("hidetrending");
        prefTrending.checked = result.hideTrending;
        prefTrending.addEventListener("change", function() {
            chrome.storage.sync.set({hideTrending: this.checked})
        });
    });
    chrome.storage.sync.get("hideSubs", function(result) {
        var prefSubs = document.getElementById("hidesubs");
        prefSubs.checked = result.hideSubs;
        prefSubs.addEventListener("change", function() {
            chrome.storage.sync.set({hideSubs: this.checked})
        });
    });
    chrome.storage.sync.get("hideSideBar", function(result) {
        var prefSideBar = document.getElementById("hidesidebar");
        prefSideBar.checked = result.hideSideBar;
        prefSideBar.addEventListener("change", function() {
            chrome.storage.sync.set({hideSideBar: this.checked})
        });
    });
    chrome.storage.sync.get("hideComments", function(result) {
        var prefComments = document.getElementById("hidecomments");
        prefComments.checked = result.hideComments;
        prefComments.addEventListener("change", function() {
            chrome.storage.sync.set({hideComments: this.checked})
        });
    });
    chrome.storage.sync.get("hideNav", function(result) {
        var prefNav = document.getElementById("hidenav");
        prefNav.checked = result.hideNav;
        prefNav.addEventListener("change", function() {
            chrome.storage.sync.set({hideNav: this.checked})
        });
    });
}

document.addEventListener('DOMContentLoaded', restorePrefs);