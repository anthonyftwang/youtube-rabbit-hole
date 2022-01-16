chrome.storage.sync.get(
  ["hideSideBar", "hideComments", "hideEndWall"],
  function (result) {
    var hideSideBar = result.hideSideBar;
    var hideComments = result.hideComments;
    var hideEndWall = result.hideEndWall;
    window.setInterval(function () {
      var sideAd = document.querySelector(
        "ytd-player-legacy-desktop-watch-ads-renderer"
      );
      if (sideAd) {
        sideAd.innerHTML = "";
      }

      var safe = true; // TODO - improve handling of orphaned script -> chrome.runtime.getURL
      try {
        var rabbitHole = renderRabbit();
      } catch {
        safe = false;
      }

      if (hideSideBar == true) {
        var sideBar = document.querySelector(
          "ytd-watch-next-secondary-results-renderer"
        );
        if (sideBar && safe) {
          sideBar.innerHTML = "";
          if (checkIfLive() == false) {
            sideBar.appendChild(renderRabbit());
          }
        }
      }

      if (hideComments == true) {
        var comments = document.querySelector("ytd-comments");
        if (comments) {
          comments.innerHTML = "";
        }
        var chat = document.querySelector("ytd-live-chat-frame");
        if (chat && safe) {
          chat.innerHTML = "";
          if (checkIfLive() == true) {
            chat.appendChild(renderRabbit());
          }
        }
      }

      if (hideEndWall == true) {
        var endWall = document.querySelector(".ytp-endscreen-content");
        if (endWall) {
          endWall.innerHTML = "";
        }
      }
    }, 100);
  }
);

// check if video was streamed live
function checkIfLive() {
  var wasLive = false;
  var chat = document.querySelector("ytd-live-chat-frame");
  if (chat) {
    wasLive = true;
  }
  return wasLive;
}

function renderRabbit() {
  var rabbit = document.createElement("img");
  rabbit.src = chrome.runtime.getURL("images/rabbithole.png");
  rabbit.width = 325;
  rabbit.height = 310;
  rabbit.style.display = "block";
  rabbit.style.marginLeft = "auto";
  rabbit.style.marginRight = "auto";
  rabbit.style.marginTop = "50px";
  rabbit.style.marginBottom = "50px";
  return rabbit;
}
