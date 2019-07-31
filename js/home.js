chrome.storage.sync.get("hideHomePage", function(result) {
  const hideHomePage = result.hideHomePage;

  window.addEventListener(
    "load",
    () => {
      removeAds();

      if (hideHomePage === true) {
        removeHomePage();
      }
    },
    { once: true }
  );
});

function removeAds() {
  const frontAds = document.querySelectorAll("ytd-banner-promo-renderer");
  const frontVideoAds = document.querySelectorAll("ytd-video-masthead-ad-v3-renderer");

  frontAds.forEach(element => element.remove());
  frontVideoAds.forEach(element => element.remove());
}

function removeHomePage() {
  const randQuote = chooseQuote();
  const videoList = document.querySelector("ytd-section-list-renderer");
  const homeMenuEntries = document.querySelectorAll("a[title=Home]");

  try {
    homeMenuEntries.forEach(element => element.remove());

    const magicBunny = renderMagic();
    videoList.innerHTML = "";
    videoList.appendChild(magicBunny);
    videoList.appendChild(renderQuote(randQuote));
  } catch (error) {
    console.error("Error while trying to remove homepage", error);
  }
}

function chooseQuote() {
  const quotes = [
    '"There is magic, but you have to be the magician. You have to make the magic happen."',
    '"Real magic is not about gaining power over others: it is about gaining power over yourself."',
    '"The world is full of magic things, patiently waiting for our senses to grow sharper."',
  ];

  return quotes[Math.floor(Math.random() * quotes.length)];
}

function renderMagic() {
  const magic = document.createElement("img");
  magic.src = chrome.runtime.getURL("images/magicbunny.png");
  magic.width = 325;
  magic.height = 414;
  magic.style.display = "block";
  magic.style.marginLeft = "auto";
  magic.style.marginRight = "auto";
  magic.style.marginTop = "25px";

  return magic;
}

function renderQuote(quote) {
  const span = document.createElement("span");
  span.style.display = "block";
  span.style.marginLeft = "auto";
  span.style.marginRight = "auto";
  span.style.marginTop = "25px";
  span.style.color = "#282828";
  span.style.fontFamily = "Roboto, Arial, sans-serif";
  span.style.fontSize = "1.4rem";
  span.style.fontWeight = "400";
  span.style.lineHeight = "2.1rem";
  span.appendChild(document.createTextNode(quote));

  return span;
}
