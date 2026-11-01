# youtube-rabbit-hole
Chrome extension to remove YouTube recommendations, comments, and more so you don't go down the rabbit hole again!

## Usage

The old Chrome Web Store release uses Manifest V2 and no longer runs in current
Chrome (see [issue #6](https://github.com/anthonyftwang/youtube-rabbit-hole/issues/6)).
Until the maintainer publishes the updated version to the
[Chrome Web Store listing](https://chrome.google.com/webstore/detail/youtube-rabbit-hole/nlddakjbmpidooplakalfoogdincflfh/),
load this Manifest V3 version manually using the steps below. It lets you reduce
distractions while browsing YouTube in the following ways:

- Replace suggested content with cute bunnies!
- Hide comments (including livestream chats)
- Disable the trending and subscriptions pages
- Simplify the navigation drawer
- Disabling the wall of suggestions following a video
- Hiding banner-style ads to maintain a clean and distraction free environment

Click the extension icon in the toolbar to edit preferences. Changes apply to
open YouTube tabs immediately, including restoring content when a setting is disabled.

## Development

To load this Manifest V3 version locally, open `chrome://extensions`, enable
Developer mode, click **Load unpacked**, and select this repository. Reload any
open YouTube tabs after loading or updating the extension.

Run the logic checks with Node.js 18 or later (no dependencies required):

```sh
node --test tests/manifest-v3.test.cjs
```

For the installed-extension browser test, use Node.js 20 or later:

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

This launches an isolated Chrome profile and serves a local YouTube-shaped fixture
at intercepted YouTube URLs. It checks actual extension loading, CSS and bunny
resources, late-arriving content, reversible settings, popup keyboard controls,
page navigation, and redirects after stopping the worker. It does not depend on
YouTube's network availability or modify your normal browser profile.

For a live browser smoke test, check the home and watch pages, then navigate between
them and search results without reloading. Check that trending and subscriptions
redirect only when their settings are enabled, and that redirects still work
after stopping the extension's service worker in Chrome's developer tools.

## Architecture

The extension has no runtime dependencies or build step. `manifest.json` loads
shared defaults, one content controller, and a stylesheet on top-level YouTube
pages. The controller updates page classes when navigation or synced preferences
change. CSS hides content without deleting it and covers elements added later;
there are no polling timers. Navigation links are matched by destination rather
than their position or translated text. The popup shares the same defaults and
reads settings in one request. The service worker initializes missing defaults
on install and handles the single allowed redirect, with listeners registered at
the top level so they survive worker restarts.

YouTube can change its markup independently. Home/watch selectors were checked
against the public signed-out site during this update; signed-in layouts, live
streams, and YouTube experiments still need manual testing before a store release.
Chrome 105 or newer is required for CSS `:has()`. Version 1.3 is ready for the
maintainer's release testing; this repository does not publish to the store.

## Roadmap
- [X] Implement user preferences using chrome.storage.sync API (currently basic framework in place for testing)
- [X] Deployment to Chrome Web Store
- [X] Replace destructive polling with reversible, event-driven page styling
- [ ] Internationalization

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
