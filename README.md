# youtube-rabbit-hole
Chrome extension to remove YouTube recommendations, comments, and more so you don't go down the rabbit hole again!

## Usage

To install, head over to the [listing on the Chrome Web Store](https://chrome.google.com/webstore/detail/youtube-rabbit-hole/nlddakjbmpidooplakalfoogdincflfh/) and click "Add to Chrome". Once added, the extension lets you reduce distractions while browsing YouTube in the following ways:

- Replace suggested content with cute bunnies!
- Hide comments (including livestream chats)
- Disable the trending and subscriptions pages
- Simplify the navigation drawer
- Disabling the wall of suggestions following a video
- Hiding banner-style ads to maintain a clean and distraction free environment

Click the browser action in the toolbar to view and edit preferences.

## Development

To load this Manifest V3 version locally, open `chrome://extensions`, enable
Developer mode, click **Load unpacked**, and select this repository. Reload any
open YouTube tabs after loading or updating the extension.

Run the regression checks with Node.js 18 or later (no dependencies required):

```sh
node --test tests/manifest-v3.test.cjs
```

For a browser smoke test, check the home and watch pages, then navigate between
them and search results without reloading. Check that trending and subscriptions
redirect only when their settings are enabled, and that redirects still work
after stopping the extension's service worker in Chrome's developer tools.

## Roadmap
- [X] Implement user preferences using chrome.storage.sync API (currently basic framework in place for testing)
- [X] Deployment to Chrome Web Store
- [ ] Performance tweaks/enhancements
- [ ] Internationalization

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
