[![Build](https://github.com/cssnr/aviation-tools/actions/workflows/build.yaml/badge.svg)](https://github.com/cssnr/aviation-tools/actions/workflows/build.yaml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=cssnr_aviation-tools&metric=alert_status&label=quality)](https://sonarcloud.io/summary/overall?id=cssnr_aviation-tools)
[![Manifest Version](https://img.shields.io/github/manifest-json/v/cssnr/aviation-tools?filename=src%2Fmanifest.json&logo=json&label=manifest)](https://github.com/cssnr/aviation-tools/blob/master/src/manifest.json)
[![GitHub Release Version](https://img.shields.io/github/v/release/cssnr/aviation-tools?logo=github)](https://github.com/cssnr/aviation-tools/releases/latest)
[![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/XXXXXX?label=chrome&logo=googlechrome)](https://chrome.google.com/webstore/detail/aviation-tools/XXXXXX)
[![Mozilla Add-on Version](https://img.shields.io/amo/v/aviation-tools?label=firefox&logo=firefox)](https://addons.mozilla.org/addon/aviation-tools)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/XXXXXX?logo=google&logoColor=white&label=google%20users)](https://chrome.google.com/webstore/detail/aviation-tools/XXXXXX)
[![Mozilla Add-on Users](https://img.shields.io/amo/users/aviation-tools?logo=mozilla&label=mozilla%20users)](https://addons.mozilla.org/addon/aviation-tools)
# Aviation Tools

Modern Chrome and Firefox Web Extension to easily search and lookup Aviation related things on the internet,
including Aircraft Registration, Flight #'s, and Airports, custom bookmarks with open all function, and much more...

*   [Download](#download)
*   [Features](#features)
*   [Configuration](#configuration)
*   [Development](#development)
    -   [Chrome Setup](#chrome-setup)
    -   [Firefox Setup](#firefox-setup)

# Download

_Coming Soon..._

*   Chrome: https://chrome.google.com/webstore/detail/aviation-tools/XXXXXX
*   Firefox: https://addons.mozilla.org/addon/aviation-tools

# Features

*   Meta Search for Registration, Flight #'s and Airports
*   Choose Default Search Engines for each Search Type
*   Save Bookmarks and Open them Individually or All at Once
*   Select Text such as a Registration and Right-Click to Search

# Configuration

You can pin the Addon by clicking the `Puzzle Piece`, find the Aviation Tools (A) icon, then;  
**Firefox**, click the `Settings Wheel` and `Pin to Toolbar`.  
**Chrome**, click the `Pin` icon.  

To open the options, click on the icon (from above) then click `Open Options`.

# Development

To build locally or run from source, clone the repository then run `npm install`.
You can then run the addon from the [src](src) directory as normal.

NPM is only used to manage dependency versions and copy files to `src/dist`.
Files are copied automatically after `npm install`. See [gulpfile.js](gulpfile.js) for more information.

The extension is automatically built on new releases then automatically uploaded to that release.
See [build.yaml](.github/workflows/build.yaml) for more information.

## Chrome Setup

1.  Download a [Release](https://github.com/cssnr/aviation-tools/releases).
1.  Unzip the archive, place the folder where it must remain and note its location for later.
1.  Open Chrome, click the `3 dots` in the top right, click `Extensions`, click `Manage Extensions`.
1.  In the top right, click `Developer Mode` then on the top left click `Load unpacked`.
1.  Navigate to the folder you extracted in step #3 then click `Select Folder`.

## Firefox Setup

For development, you can and should load unpacked in Firefox as a temporary addon.
This will **not** remain after restarting Firefox. It is also useful to keep data after removing an extension.

1.  Download a [Release](https://github.com/cssnr/aviation-tools/releases).
1.  Load temporary from: `about:debugging#/runtime/this-firefox`
1.  Open `about:config` search for `extensions.webextensions.keepStorageOnUninstall` and set to `true`.

> **Note**
>
> This method **does not** work on Release Firefox and is NOT recommended for development.
> You must use [ESR](https://www.mozilla.org/en-CA/firefox/all/#product-desktop-esr), Development, or Nightly.

1.  Open `about:config` search for `xpinstall.signatures.required` and set to `false`.
1.  Open `about:addons` and drag the zip file to the page or choose Install from File from the Settings wheel.
