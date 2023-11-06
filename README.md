[![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/cjjhackeogffajjndfhemgniokonimin?label=chrome&logo=googlechrome)](https://chrome.google.com/webstore/detail/aviation-tools/cjjhackeogffajjndfhemgniokonimin)
[![Manifest Version](https://img.shields.io/github/manifest-json/v/cssnr/aviation-tools?filename=manifest.json&logo=json&label=manifest)](https://github.com/cssnr/aviation-tools/blob/master/manifest.json)
[![GitHub Release Version](https://img.shields.io/github/v/release/cssnr/aviation-tools?logo=github)](https://github.com/cssnr/aviation-tools/releases/latest)
[![Build](https://github.com/cssnr/aviation-tools/actions/workflows/build.yaml/badge.svg)](https://github.com/cssnr/aviation-tools/actions/workflows/build.yaml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=cssnr_aviation-tools&metric=alert_status&label=quality)](https://sonarcloud.io/summary/overall?id=cssnr_aviation-tools)
# Aviation Tools

Upcoming Web Extension with various Aviation Tools...

*   [Download](#download)
*   [Features](#features)
*   [Configuration](#configuration)
*   [Development](#development)
    -   [Chrome Setup](#chrome-setup)
    -   [Firefox Setup](#firefox-setup)

# Download

<a href="https://chrome.google.com/webstore/detail/aviation-tools/cjjhackeogffajjndfhemgniokonimin" target="_blank">
    <img alt="Chrome" src="https://raw.githubusercontent.com/raivo-otp/issuer-icons/master/vectors/google.com/google-chrome.svg" width="42" height="42" /></a>
<a href="https://github.com/cssnr/aviation-tools/releases/latest/download/aviation_tools-firefox.xpi" target="_blank">
    <img alt="Firefox" src="https://raw.githubusercontent.com/raivo-otp/issuer-icons/master/vectors/firefox.com/firefox.svg" width="42" height="42" /></a>
<a href="https://chrome.google.com/webstore/detail/aviation-tools/cjjhackeogffajjndfhemgniokonimin" target="_blank">
    <img alt="Edge" src="https://raw.githubusercontent.com/raivo-otp/issuer-icons/master/vectors/microsoft.com/microsoft-edge.svg" width="42" height="42" /></a>
<a href="https://chrome.google.com/webstore/detail/aviation-tools/cjjhackeogffajjndfhemgniokonimin" target="_blank">
    <img alt="Opera" src="https://raw.githubusercontent.com/raivo-otp/issuer-icons/master/vectors/opera.com/opera.svg" width="42" height="42" /></a>
<a href="https://chrome.google.com/webstore/detail/aviation-tools/cjjhackeogffajjndfhemgniokonimin" target="_blank">
    <img alt="Brave" src="https://raw.githubusercontent.com/raivo-otp/issuer-icons/master/vectors/brave.com/brave.svg" width="42" height="42" /></a>
<a href="https://chrome.google.com/webstore/detail/aviation-tools/cjjhackeogffajjndfhemgniokonimin" target="_blank">
    <img alt="Vivaldi" src="https://raw.githubusercontent.com/raivo-otp/issuer-icons/master/vectors/vivaldi.com/vivaldi.svg" width="42" height="42" /></a>
  

*   Download a [Chrome Release](https://github.com/cssnr/aviation-tools/releases/latest/download/aviation_tools-chrome.crx) from GitHub
*   Download a [Firefox Release](https://github.com/cssnr/aviation-tools/releases/latest/download/aviation_tools-firefox.xpi) from GitHub

_Note: Firefox is currently only available from GitHub._

# Features

*   Quick Search Registration, Flight Numbers, and Airports
*   Search by Highlighting Text or Opening Popup Action
*   Add Saved Bookmarks and Open All Bookmarks

# Configuration

You can pin the Addon by clicking the `Puzzle Piece`, find the Aviation Tools (A) icon, then;  
**Firefox**, click the `Settings Wheel` and `Pin to Toolbar`.  
**Chrome**, click the `Pin` icon.  

To open the options, click on the icon (from above) then click `Open Options`.

# Development

To install and run chrome or firefox with web-ext.
```shell
npm isntall
npm run chrome
npm run firefox
```

To Load Unpacked/Temporary Add-on make a `manifest.json` first.
```shell
npm run manifest:chrome
npm run manifest:firefox
```

For more information on web-ext, [read this documentation](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/).  
To pass additional arguments to an `npm run` command, use `--`.  
Example: `npm run chrome -- --chromium-binary=...`  

See [gulpfile.js](gulpfile.js) for more information on `postinstall`.  
For more information on building, see the scripts in the [package.json](package.json) file.  

## Chrome Setup

1.  Build or Download a [Release](https://github.com/cssnr/aviation-tools/releases).
1.  Unzip the archive, place the folder where it must remain and note its location for later.
1.  Open Chrome, click the `3 dots` in the top right, click `Extensions`, click `Manage Extensions`.
1.  In the top right, click `Developer Mode` then on the top left click `Load unpacked`.
1.  Navigate to the folder you extracted in step #3 then click `Select Folder`.

## Firefox Setup

Note: Firefox Temporary addon's will **not** remain after restarting Firefox, therefore;
it is very useful to keep addon storage after uninstall/restart with `keepStorageOnUninstall`.

1.  Build or Download a [Release](https://github.com/cssnr/aviation-tools/releases).
1.  Unzip the archive, place the folder where it must remain and note its location for later.
1.  Go to `about:debugging#/runtime/this-firefox` and click `Load Temporary Add-on...`
1.  Navigate to the folder you extracted earlier, select `manifest.json` then click `Select File`.
1.  Open `about:config` search for `extensions.webextensions.keepStorageOnUninstall` and set to `true`.

If you need to test a restart, you must pack the addon. This only works in ESR, Development, or Nightly.

1.  Run `npm run build:firefox` then use `web-ext-artifacts/link_extractor-firefox-0.1.0.zip`.
1.  Open `about:config` search for `xpinstall.signatures.required` and set to `false`.
1.  Open `about:addons` and drag the zip file to the page or choose Install from File from the Settings wheel.
