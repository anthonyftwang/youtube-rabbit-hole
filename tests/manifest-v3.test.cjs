const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const { resolve } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const root = resolve(__dirname, "..");
const manifest = JSON.parse(readFileSync(resolve(root, "manifest.json")));

function load(file, prefs = {}, url = "https://www.youtube.com/") {
  const listeners = {};
  const intervals = [];
  const writes = [];
  const redirects = [];
  const queries = [];
  const context = vm.createContext({
    chrome: {
      runtime: {
        onInstalled: { addListener: (fn) => (listeners.install = fn) },
        onMessage: { addListener: (fn) => (listeners.message = fn) },
        sendMessage: (message) => redirects.push(message.redirect),
        getURL: (path) => `chrome-extension://test/${path}`,
      },
      storage: { sync: {
        get: (_keys, fn) => fn(prefs),
        set: (values) => writes.push(values),
      } },
      tabs: { update: (id, options) => redirects.push([id, options.url]) },
    },
    window: {
      location: new URL(url),
      setInterval: (fn) => intervals.push(fn),
    },
    document: {
      addEventListener: (name, fn) => (listeners[name] = fn),
      querySelector: (selector) => { queries.push(selector); return null; },
      createElement: () => ({ style: {}, appendChild() {} }),
    },
  });
  vm.runInContext(readFileSync(resolve(root, file), "utf8"), context);
  return { context, listeners, intervals, writes, redirects, queries };
}

test("MV3 statically loads all features, with page-specific scripts in the top frame", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.background.service_worker, "js/background.js");
  assert.ok(manifest.action.default_popup);
  assert.ok(!manifest.permissions.includes("declarativeContent"));
  for (const file of ["js/home.js", "js/video.js", "js/others.js"]) {
    const entry = manifest.content_scripts.find((entry) => entry.js.includes(file));
    assert.ok(entry, `${file} must be statically registered`);
    assert.ok(entry.matches.includes("*://www.youtube.com/*"));
    assert.ok(!entry.all_frames);
  }
  for (const entry of manifest.content_scripts) {
    for (const file of entry.js) assert.ok(existsSync(resolve(root, file)));
  }
  for (const entry of manifest.web_accessible_resources) {
    assert.deepEqual(entry.matches, ["*://www.youtube.com/*"]);
    for (const file of entry.resources) assert.ok(existsSync(resolve(root, file)));
  }
});

test("redirect listener works on worker startup without an install event", () => {
  const worker = load("js/background.js");
  assert.equal(typeof worker.listeners.message, "function");
  worker.listeners.message({ redirect: "https://www.youtube.com/" }, { tab: { id: 7 } });
  assert.deepEqual(worker.redirects, [[7, "https://www.youtube.com/"]]);
});

test("install initializes defaults without old APIs; updates preserve preferences", () => {
  const worker = load("js/background.js");
  worker.listeners.install({ reason: "update" });
  assert.equal(worker.writes.length, 0);
  worker.listeners.install({ reason: "install" });
  assert.equal(worker.writes.length, 1);
  assert.equal(worker.writes[0].hideHomePage, true);
  assert.equal(Object.keys(worker.writes[0]).length, 7);
});

test("redirect handler ignores unrelated messages and missing tabs", () => {
  const worker = load("js/background.js");
  for (const message of [null, {}, { redirect: "https://example.com/" }]) {
    worker.listeners.message(message, { tab: { id: 7 } });
  }
  worker.listeners.message({ redirect: "https://www.youtube.com/" }, {});
  assert.deepEqual(worker.redirects, []);
});

for (const [file, path, prefs] of [
  ["js/home.js", "/", { hideHomePage: true }],
  ["js/video.js", "/watch?v=test", { hideSideBar: true, hideComments: true, hideEndWall: true }],
]) {
  test(`${file} follows navigation and leaves search/channel pages alone`, () => {
    const page = load(file, prefs, "https://www.youtube.com/results?search_query=test");
    const tick = () => page.intervals.forEach((fn) => fn());
    tick();
    assert.equal(page.queries.length, 0);
    page.context.window.location = new URL(`https://www.youtube.com${path}`);
    tick();
    assert.ok(page.queries.length > 0);
    page.queries.length = 0;
    page.context.window.location = new URL("https://www.youtube.com/@channel");
    tick();
    assert.equal(page.queries.length, 0);
  });
}

test("feed redirects work on initial load and YouTube navigation, respecting toggles", () => {
  const page = load("js/others.js", { hideTrending: true, hideSubs: true },
    "https://www.youtube.com/feed/trending");
  assert.deepEqual(page.redirects, ["https://www.youtube.com/"]);
  page.context.window.location = new URL("https://www.youtube.com/feed/subscriptions");
  page.listeners["yt-navigate-finish"]();
  assert.equal(page.redirects.length, 2);
  page.context.window.location = new URL("https://www.youtube.com/results?search_query=trending");
  page.listeners["yt-navigate-finish"]();
  assert.equal(page.redirects.length, 2);
  const disabled = load("js/others.js", {}, "https://www.youtube.com/feed/subscriptions");
  assert.deepEqual(disabled.redirects, []);
});
