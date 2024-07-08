[![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/cjjhackeogffajjndfhemgniokonimin?label=chrome&logo=googlechrome)](https://chrome.google.com/webstore/detail/aviation-tools/cjjhackeogffajjndfhemgniokonimin)
[![GitHub Release Version](https://img.shields.io/github/v/release/cssnr/aviation-tools?logo=github)](https://github.com/cssnr/aviation-tools/releases/latest)
[![Build](https://img.shields.io/github/actions/workflow/status/cssnr/aviation-tools/build.yaml?logo=github&logoColor=white&label=build)](https://github.com/cssnr/aviation-tools/actions/workflows/build.yaml)
[![Test](https://img.shields.io/github/actions/workflow/status/cssnr/aviation-tools/test.yaml?logo=github&logoColor=white&label=test)](https://github.com/cssnr/aviation-tools/actions/workflows/test.yaml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=cssnr_aviation-tools&metric=alert_status&label=quality)](https://sonarcloud.io/summary/overall?id=cssnr_aviation-tools)
[![Discord](https://img.shields.io/discord/899171661457293343?logo=discord&logoColor=white&label=discord&color=7289da)](https://discord.gg/wXy6m2X8wY)
# Aviation Tools

Upcoming Web Extension with various Aviation Tools...

*   [Download](#download)
*   [Features](#features)
*   [Configuration](#configuration)
*   [Support](#support)
*   [Development](#development)
    -   [Chrome Setup](#chrome-setup)
    -   [Firefox Setup](#firefox-setup)

# Download

[![Chrome](https://raw.githubusercontent.com/smashedr/logo-icons/master/browsers/chrome_48.png)](https://chromewebstore.google.com/detail/aviation-tools/cjjhackeogffajjndfhemgniokonimin)
[![Firefox](https://raw.githubusercontent.com/smashedr/logo-icons/master/browsers/firefox_48.png)](https://github.com/cssnr/aviation-tools/releases/latest/download/aviation_tools-firefox.xpi)
[![Edge](https://raw.githubusercontent.com/smashedr/logo-icons/master/browsers/edge_48.png)](https://chromewebstore.google.com/detail/aviation-tools/cjjhackeogffajjndfhemgniokonimin)
[![Brave](https://raw.githubusercontent.com/smashedr/logo-icons/master/browsers/brave_48.png)](https://chromewebstore.google.com/detail/aviation-tools/cjjhackeogffajjndfhemgniokonimin)
[![Opera](https://raw.githubusercontent.com/smashedr/logo-icons/master/browsers/opera_48.png)](https://chromewebstore.google.com/detail/aviation-tools/cjjhackeogffajjndfhemgniokonimin)
[![Chromium](https://raw.githubusercontent.com/smashedr/logo-icons/master/browsers/chromium_48.png)](https://chromewebstore.google.com/detail/aviation-tools/cjjhackeogffajjndfhemgniokonimin)

All **Chromium** Based Browsers can install the extension from the
[Chrome Web Store](https://chromewebstore.google.com/detail/aviation-tools/cjjhackeogffajjndfhemgniokonimin).

*   Download a [Chrome Release](https://github.com/cssnr/aviation-tools/releases/latest/download/aviation_tools-chrome.crx) from GitHub
*   Download a [Firefox Release](https://github.com/cssnr/aviation-tools/releases/latest/download/aviation_tools-firefox.xpi) from GitHub

> [!IMPORTANT]  
> Firefox is currently only available from a [GitHub Release](https://github.com/cssnr/aviation-tools/releases/latest/download/aviation_tools-firefox.xpi).

# Features

*   Quick Search Registration, Flight Numbers, and Airports
*   Search by Highlighting Text or Opening Popup Action
*   Add Saved Bookmarks and Open All Bookmarks

Please submit a [Feature Request](https://github.com/cssnr/aviation-tools/discussions/new?category=feature-requests) for new features.   
For any issues, bugs or concerns; please [Open an Issue](https://github.com/cssnr/aviation-tools/issues/new).

# Configuration

You can pin the Addon by clicking the `Puzzle Piece`, find the Aviation Tools (A) icon, then;  
**Chrome**, click the `Pin` icon.  
**Firefox**, click the `Settings Wheel` and `Pin to Toolbar`.  

To open the options, click on the icon (from above) then click `Open Options`.

# Support

For help using the web extension, utilize any these resources:

- Q&A Discussion: https://github.com/cssnr/aviation-tools/discussions/categories/q-a
- Request a Feature: https://github.com/cssnr/aviation-tools/discussions/categories/feature-requests

If you are experiencing an issue/bug or getting unexpected results, use:

- Report an Issue: https://github.com/cssnr/aviation-tools/issues
- Chat with us on Discord: https://discord.gg/wXy6m2X8wY
- Provide Anonymous Feedback: https://cssnr.github.io/feedback

Logs can be found inspecting the page (Ctrl+Shift+I), clicking on the Console, and;
Firefox: toggling Debug logs, Chrome: toggling Verbose from levels dropdown.

Note: When providing anonymous feedback there is no way to follow up and get more information unless you provide a contact method.

# Development

**Quick Start**

First, clone (or download) this repository and change into the directory.

Second, install the dependencies:
```shell
npm install
```

Finally, to run Chrome or Firefox with web-ext, run one of the following:
```shell
npm run chrome
npm run firefox
```

Additionally, to Load Unpacked/Temporary Add-on make a `manifest.json` and run from the [src](src) folder, run one of the following:
```shell
npm run manifest:chrome
npm run manifest:firefox
```

Chrome: [https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)  
Firefox: [https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)

For more information on web-ext, [read this documentation](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/).  
To pass additional arguments to an `npm run` command, use `--`.  
Example: `npm run chrome -- --chromium-binary=...`

## Building

Install the requirements and copy libraries into the `src/dist` directory by running `npm install`.
See [gulpfile.js](gulpfile.js) for more information on `postinstall`.
```shell
npm install
```

To create a `.zip` archive of the [src](src) directory for the desired browser run one of the following:
```shell
npm run build
npm run build:chrome
npm run build:firefox
```

For more information on building, see the scripts section in the [package.json](package.json) file.

## Chrome Setup

1.  Build or Download a [Release](https://github.com/cssnr/aviation-tools/releases).
1.  Unzip the archive, place the folder where it must remain and note its location for later.
1.  Open Chrome, click the `3 dots` in the top right, click `Extensions`, click `Manage Extensions`.
1.  In the top right, click `Developer Mode` then on the top left click `Load unpacked`.
1.  Navigate to the folder you extracted in step #3 then click `Select Folder`.

## Firefox Setup

1.  Build or Download a [Release](https://github.com/cssnr/aviation-tools/releases).
1.  Unzip the archive, place the folder where it must remain and note its location for later.
1.  Go to `about:debugging#/runtime/this-firefox` and click `Load Temporary Add-on...`
1.  Navigate to the folder you extracted earlier, select `manifest.json` then click `Select File`.
1.  Optional: open `about:config` search for `extensions.webextensions.keepStorageOnUninstall` and set to `true`.

If you need to test a restart, you must pack the addon. This only works in ESR, Development, or Nightly.
You may also use an Unbranded Build: [https://wiki.mozilla.org/Add-ons/Extension_Signing#Unbranded_Builds](https://wiki.mozilla.org/Add-ons/Extension_Signing#Unbranded_Builds)

1.  Run `npm run build:firefox` then use `web-ext-artifacts/{name}-firefox-{version}.zip`.
1.  Open `about:config` search for `xpinstall.signatures.required` and set to `false`.
1.  Open `about:addons` and drag the zip file to the page or choose Install from File from the Settings wheel.
