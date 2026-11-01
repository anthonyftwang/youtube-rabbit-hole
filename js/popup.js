document.addEventListener("DOMContentLoaded", function () {
  const toggles = document.querySelectorAll("input[data-preference]");
  chrome.storage.sync.get(DEFAULT_PREFS, function (preferences) {
    for (const toggle of toggles) {
      const key = toggle.dataset.preference;
      toggle.checked = preferences[key] === true;
      toggle.disabled = false;
      toggle.addEventListener("change", function () {
        chrome.storage.sync.set({ [key]: toggle.checked });
      });
    }
  });
});
