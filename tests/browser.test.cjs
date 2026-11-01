const assert = require("node:assert/strict");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { resolve, join } = require("node:path");
const { test } = require("node:test");
const { chromium } = require("playwright");

const fixture = `<!doctype html><html><body>
<ytd-browse page-subtype="home"><div id="home">Home recommendations</div></ytd-browse>
<ytd-browse page-subtype="channels"><div id="channel">Channel content</div></ytd-browse>
<ytd-watch-flexy>
  <video id="player"></video><button id="play">Play</button>
  <div id="related"><ytd-watch-next-secondary-results-renderer>
    <div id="recommendation">Recommendation</div>
  </ytd-watch-next-secondary-results-renderer></div>
  <ytd-comments id="comments">Comments</ytd-comments>
  <div class="ytp-endscreen-content" id="endscreen">More videos</div>
</ytd-watch-flexy>
<ytd-guide-entry-renderer id="keep"><a href="/">Home</a></ytd-guide-entry-renderer>
<ytd-guide-entry-renderer id="hide"><a href="/feed/subscriptions">Subscriptions</a></ytd-guide-entry-renderer>
</body></html>`;

test("loaded MV3 extension: reversible styles, navigation, popup, and worker restart", { timeout: 60000 }, async () => {
  const profile = mkdtempSync(join(tmpdir(), "rabbit-hole-test-"));
  const extension = resolve(__dirname, "..");
  const context = await chromium.launchPersistentContext(profile, {
    channel: "chromium",
    headless: true,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    context.setDefaultTimeout(10000);
    const errors = [];
    context.on("page", (page) => page.on("pageerror", (error) => errors.push(error.message)));
    const worker = context.serviceWorkers()[0] || await context.waitForEvent("serviceworker");
    const id = new URL(worker.url()).host;
    await context.route("https://www.youtube.com/**", (route) => route.fulfill({
      contentType: "text/html", body: fixture,
    }));
    const page = await context.newPage();
    await page.goto("https://www.youtube.com/");
    await page.waitForFunction(() => document.documentElement.dataset.rhPage === "home");
    const visible = (selector) => page.locator(selector).isVisible();
    assert.equal(await visible("#home"), false);
    assert.equal(await visible("#keep"), true);
    assert.equal(await visible("#hide"), false);
    // The source nodes survive hiding, including nodes inserted after initialization.
    await page.evaluate(() => {
      document.querySelector('ytd-browse[page-subtype="home"]').insertAdjacentHTML("beforeend", '<div id="late">Late recommendation</div>');
    });
    assert.equal(await visible("#late"), false);
    const imageURL = await page.locator('ytd-browse[page-subtype="home"]').evaluate((el) =>
      getComputedStyle(el, "::before").backgroundImage.match(/url\("?(.*?)"?\)/)[1]);
    assert.ok(imageURL.startsWith(`chrome-extension://${id}/`));
    assert.equal(await page.evaluate(async (url) => (await fetch(url)).ok, imageURL), true);

    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${id}/popup.html`);
    const homeToggle = popup.getByRole("checkbox", { name: "Hide homepage", exact: true });
    await homeToggle.waitFor({ state: "attached" });
    await popup.waitForFunction(() => !document.querySelector("input").disabled);
    await homeToggle.focus();
    await popup.keyboard.press("Space");
    await page.waitForFunction(() => !document.documentElement.classList.contains("rh-hideHomePage"));
    assert.equal(await visible("#home"), true);
    assert.equal(await visible("#late"), true);
    assert.equal(await page.locator("#home").textContent(), "Home recommendations");

    async function navigate(path) {
      await page.evaluate((path) => {
        history.pushState({}, "", path);
        document.dispatchEvent(new Event("yt-navigate-finish"));
      }, path);
    }
    await navigate("/watch?v=test");
    assert.equal(await visible("#comments"), false);
    assert.equal(await visible("#recommendation"), false);
    assert.equal(await visible("#endscreen"), false);
    assert.equal(await visible("#player"), true);
    assert.equal(await visible("#play"), true);
    await popup.locator('label[for="hidecomments"]').click();
    await page.waitForFunction(() => !document.documentElement.classList.contains("rh-hideComments"));
    assert.equal(await visible("#comments"), true);
    await navigate("/results?search_query=trending");
    assert.equal(await visible("#recommendation"), true);
    assert.equal(await visible("#channel"), true);

    await navigate("/watch?v=live");
    await popup.locator('label[for="hidecomments"]').click();
    await page.waitForFunction(() => document.documentElement.classList.contains("rh-hideComments"));
    await page.evaluate(() => {
      document.querySelector("ytd-watch-flexy").insertAdjacentHTML("beforeend", '<ytd-live-chat-frame><iframe id="chat" title="Live chat"></iframe></ytd-live-chat-frame>');
    });
    assert.equal(await visible("#chat"), false);
    await popup.locator('label[for="hidecomments"]').click();
    await page.waitForFunction(() => !document.documentElement.classList.contains("rh-hideComments"));
    assert.equal(await visible("#chat"), true);

    // Stop the worker, then trigger the real content-script message to wake it again.
    const session = await context.newCDPSession(page);
    await session.send("ServiceWorker.enable");
    await session.send("ServiceWorker.stopAllWorkers");
    await navigate("/feed/subscriptions");
    await page.waitForURL("https://www.youtube.com/");
    await page.waitForFunction(() => document.documentElement.dataset.rhPage === "home");
    assert.equal(await visible("#home"), true); // saved popup choice survives navigation/restart
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
    rmSync(profile, { recursive: true, force: true });
  }
});
