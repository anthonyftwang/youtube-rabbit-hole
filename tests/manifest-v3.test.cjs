const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const { resolve } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const root = resolve(__dirname, "..");
const manifest = JSON.parse(readFileSync(resolve(root, "manifest.json")));

function load(file, prefs = {}, path = "/") {
  const listeners = {};
  const writes = [];
  const redirects = [];
  const classes = new Set();
  const html = {
    dataset: {},
    style: { setProperty() {} },
    classList: { toggle: (key, enabled) => enabled ? classes.add(key) : classes.delete(key) },
  };
  const context = vm.createContext({
    chrome: {
      runtime: {
        onInstalled: { addListener: (fn) => (listeners.install = fn) },
        onMessage: { addListener: (fn) => (listeners.message = fn) },
        sendMessage: (message) => redirects.push(message.redirect),
        getURL: (path) => `chrome-extension://test/${path}`,
      },
      storage: {
        sync: {
          get: (defaults, fn) => fn({ ...defaults, ...prefs }),
          set: (values) => writes.push(values),
        },
        onChanged: { addListener: (fn) => (listeners.storage = fn) },
      },
      tabs: { update: (id, options) => redirects.push([id, options.url]) },
    },
    window: { location: new URL(`https://www.youtube.com${path}`) },
    document: {
      documentElement: html,
      addEventListener: (name, fn) => (listeners[name] = fn),
    },
  });
  const run = (file) => vm.runInContext(readFileSync(resolve(root, file), "utf8"), context);
  context.importScripts = (file) => run(`js/${file}`);
  if (file !== "js/background.js") run("js/preferences.js");
  run(file);
  return { context, listeners, writes, redirects, classes, html };
}

test("MV3 registers one static controller and CSS, restricted to YouTube", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.background.service_worker, "js/background.js");
  assert.ok(manifest.action.default_popup);
  assert.deepEqual(manifest.permissions, ["storage"]);
  assert.equal(manifest.content_scripts.length, 1);
  const entry = manifest.content_scripts[0];
  assert.deepEqual(entry.matches, ["*://www.youtube.com/*"]);
  assert.deepEqual(entry.js, ["js/preferences.js", "js/content.js"]);
  assert.deepEqual(entry.css, ["content.css"]);
  assert.ok(!entry.all_frames);
  for (const file of [...entry.js, ...entry.css]) assert.ok(existsSync(resolve(root, file)));
  for (const entry of manifest.web_accessible_resources) {
    assert.deepEqual(entry.matches, ["*://www.youtube.com/*"]);
    for (const file of entry.resources) assert.ok(existsSync(resolve(root, file)));
  }
});

test("redirect listener works on worker restart, without installation", () => {
  const worker = load("js/background.js");
  worker.listeners.message({ redirect: "https://www.youtube.com/" }, { tab: { id: 7 } });
  assert.deepEqual(worker.redirects, [[7, "https://www.youtube.com/"]]);
});

test("fresh install preserves synced choices and updates don't reset preferences", () => {
  const worker = load("js/background.js", { hideHomePage: false });
  worker.listeners.install({ reason: "update" });
  assert.equal(worker.writes.length, 0);
  worker.listeners.install({ reason: "install" });
  assert.equal(worker.writes.length, 1);
  assert.equal(worker.writes[0].hideHomePage, false);
  assert.equal(worker.writes[0].hideComments, true);
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

test("controller follows home/watch/search/channel navigation without timers or DOM deletion", () => {
  const page = load("js/content.js");
  for (const [path, expected] of [["/", "home"], ["/watch?v=test", "watch"],
    ["/results?search_query=test", "other"], ["/@channel", "other"], ["/?gl=NO", "home"]]) {
    page.context.window.location = new URL(`https://www.youtube.com${path}`);
    page.listeners["yt-navigate-finish"]();
    assert.equal(page.html.dataset.rhPage, expected);
  }
  assert.ok(page.classes.has("rh-hideComments"));
  assert.equal(page.classes.size, 7);
});

test("settings update live, ignore local storage, and restore defaults after deletion", () => {
  const page = load("js/content.js", { hideHomePage: false });
  assert.ok(!page.classes.has("rh-hideHomePage"));
  page.listeners.storage({ hideHomePage: { newValue: true } }, "local");
  assert.ok(!page.classes.has("rh-hideHomePage"));
  page.listeners.storage({ hideHomePage: { newValue: true }, hideComments: { newValue: false } }, "sync");
  assert.ok(page.classes.has("rh-hideHomePage"));
  assert.ok(!page.classes.has("rh-hideComments"));
  page.listeners.storage({ hideComments: {} }, "sync");
  assert.ok(page.classes.has("rh-hideComments"));
});

test("feed redirects work initially, after navigation, and when enabled live", () => {
  const page = load("js/content.js", {}, "/feed/trending");
  assert.deepEqual(page.redirects, ["https://www.youtube.com/"]);
  page.context.window.location = new URL("https://www.youtube.com/feed/subscriptions");
  page.listeners["yt-navigate-finish"]();
  assert.equal(page.redirects.length, 2);
  for (const path of ["/results?search_query=trending", "/@subscriptions", "/feed/trending-fake"]) {
    page.context.window.location = new URL(`https://www.youtube.com${path}`);
    page.listeners["yt-navigate-finish"]();
  }
  assert.equal(page.redirects.length, 2);
  const disabled = load("js/content.js", { hideSubs: false }, "/feed/subscriptions");
  assert.deepEqual(disabled.redirects, []);
  disabled.listeners.storage({ hideSubs: { newValue: true } }, "sync");
  assert.deepEqual(disabled.redirects, ["https://www.youtube.com/"]);
});
