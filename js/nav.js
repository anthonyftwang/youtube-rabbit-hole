chrome.storage.sync.get("hideNav", function(result) {
    var hideNav = result.hideNav;
    if (hideNav == true) {
        window.setInterval(function() {
            hideNavDrawer();
        }, 100);
    }
});

function hideNavDrawer() {
    /* ~~ buggy implementation ~~
    var nav = document.querySelector("ytd-guide-renderer");
    if (nav) {
        nav.innerHTML = "";
    }*/
    var miniNav = document.querySelector("ytd-mini-guide-renderer");
    if (miniNav) {
        miniNav.innerHTML = "";
    }

    // hide selected components, but keep some
    var trendingMainNav = document.querySelector("#items > ytd-guide-entry-renderer:nth-child(2)");
    if (trendingMainNav) {
        trendingMainNav.innerHTML = "";
    }
    var subsMainNav = document.querySelector("#items > ytd-guide-entry-renderer:nth-child(3)");
    if (subsMainNav) {
        subsMainNav.innerHTML = "";
    }
    var laterNav = document.querySelector("#section-items > ytd-guide-entry-renderer:nth-child(2)");
    if (laterNav) {
        laterNav.innerHTML = "";
    }
    var purchasesNav = document.querySelector("#section-items > ytd-guide-entry-renderer:nth-child(3)");
    if (purchasesNav) {
        purchasesNav.innerHTML = "";
    }
    var likedNav = document.querySelector("#section-items > ytd-guide-entry-renderer:nth-child(4)");
    if (likedNav) {
        likedNav.innerHTML = "";
    }
    var collapsibleNav = document.querySelector("#section-items > ytd-guide-collapsible-entry-renderer");
    if (collapsibleNav) {
        collapsibleNav.innerHTML = "";
    }
    var subsNav = document.querySelector("#sections > ytd-guide-section-renderer:nth-child(2)");
    if (subsNav) {
        subsNav.innerHTML = "";
    }
    var moreNav = document.querySelector("#sections > ytd-guide-section-renderer:nth-child(3)");
    if (moreNav) {
        moreNav.innerHTML = "";
    }
}