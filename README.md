# Aviation Tools

Modern Chrome and Firefox Web Extension to easily search and lookup Aviation related things on the internet,
including Aircraft Registration, Flight #'s, and Airports, custom bookmarks with open all function, and much more...

> **Warning**
>
> This extension is currently **under development**. Many features may not function properly or at all...  
> Until a release is uploaded, see the [Chrome](#chrome) or [Firefox](#firefox) development instructions.  

*   [Download](#download)
*   [Features](#features)
*   [Configuration](#configuration)
*   [Development](#development)
    -   [Chrome](#chrome)
    -   [Firefox](#firefox)

# Download

_Coming Soon..._

*   Firefox: https://addons.mozilla.org/addon/
*   Chrome: https://chrome.google.com/webstore/detail/

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

To build locally, clone the repository then run `npm install`.
You can then run the addon from the [src](src) directory as normal.

The extension is automatically built on every release which uploads the artifacts to that release.
See [build.yaml](.github/workflows/build.yaml) for more information.

## Chrome

1.  Download (or clone) the repo.
1.  Unzip the archive, place the folder where it must remain and note its location for later.
1.  Open Chrome, click the `3 dots` in the top right, click `Extensions`, click `Manage Extensions`.
1.  In the top right, click `Developer Mode` then on the top left click `Load unpacked`.
1.  Navigate to the folder you extracted in step #3 then click `Select Folder`.

## Firefox

> **Note**
>
> This **does not** work on Release Firefox!
> You must use [ESR](https://www.mozilla.org/en-CA/firefox/all/#product-desktop-esr), Development, or Nightly.

1.  Download (or clone) the repo.
1.  Open `about:config` search for `xpinstall.signatures.required` and set to `false`.
1.  Open `about:addons` and drag the zip file to the page or choose Install from File from the Settings wheel.
1.  You may also load temporary from: `about:debugging#/runtime/this-firefox`
