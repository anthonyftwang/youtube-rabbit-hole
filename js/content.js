(() => {
  let preferences = { ...DEFAULT_PREFS };
  const root = document.documentElement;
  root.style.setProperty("--rh-rabbit", `url("${chrome.runtime.getURL("images/rabbithole.png")}")`);
  root.style.setProperty("--rh-magic", `url("${chrome.runtime.getURL("images/magicbunny.png")}")`);
  const quotes = [
    '"There is magic, but you have to be the magician. You have to make the magic happen."',
    '"Real magic is not about gaining power over others: it is about gaining power over yourself."',
    '"The world is full of magic things, patiently waiting for our senses to grow sharper."',
  ];
  root.style.setProperty("--rh-quote", JSON.stringify(quotes[Math.floor(Math.random() * quotes.length)]));

  function applyPreferences() {
    const path = window.location.pathname;
    root.dataset.rhPage = path === "/" ? "home" : path === "/watch" ? "watch" : "other";
    for (const key of Object.keys(DEFAULT_PREFS)) {
      root.classList.toggle(`rh-${key}`, preferences[key] === true);
    }
    if (
      (preferences.hideTrending && /^\/feed\/trending\/?$/.test(path)) ||
      (preferences.hideSubs && /^\/feed\/subscriptions\/?$/.test(path))
    ) {
      chrome.runtime.sendMessage({ redirect: "https://www.youtube.com/" });
    }
  }

  // CSS also covers elements YouTube inserts later, without polling or deleting them.
  document.addEventListener("yt-navigate-finish", applyPreferences);
  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area !== "sync") return;
    for (const key of Object.keys(DEFAULT_PREFS)) {
      if (key in changes) preferences[key] = changes[key].newValue ?? DEFAULT_PREFS[key];
    }
    applyPreferences();
  });
  chrome.storage.sync.get(DEFAULT_PREFS, function (saved) {
    preferences = saved;
    applyPreferences();
  });
})();
