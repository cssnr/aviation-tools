// JS Background Service Worker

import {
    links,
    clipboardWrite,
    createContextMenus,
    openOptionsFor,
} from './exports.js'

chrome.runtime.onInstalled.addListener(onInstalled)
chrome.contextMenus.onClicked.addListener(onClicked)

const ghUrl = 'https://github.com/cssnr/aviation-tools'

/**
 * Installed Callback
 * @function onInstalled
 * @param {InstalledDetails} details
 */
async function onInstalled(details) {
    console.log('onInstalled:', details)
    let { options } = await chrome.storage.sync.get(['options'])
    options = await setNestedDefaults(options, links)
    console.log('options:', options)

    if (options.contextMenu) {
        createContextMenus()
    }
    if (details.reason === 'install') {
        const url = chrome.runtime.getURL('/html/options.html')
        await chrome.tabs.create({ active: true, url })
    } else if (options.showUpdate && details.reason === 'update') {
        const manifest = chrome.runtime.getManifest()
        if (manifest.version !== details.previousVersion) {
            const url = `${ghUrl}/releases/tag/${manifest.version}`
            console.log(`url: ${url}`)
            await chrome.tabs.create({ active: true, url })
        }
    }
    chrome.runtime.setUninstallURL(`${ghUrl}/issues`)
}

/**
 * Context Menu Click Callback
 * @function onClicked
 * @param {OnClickData} ctx
 * @param {Tab} tab
 */
async function onClicked(ctx, tab) {
    console.log('contextMenuClick:', ctx, tab)
    console.log(`ctx.menuItemId: ${ctx.menuItemId}`)

    if (['options'].includes(ctx.menuItemId)) {
        const url = chrome.runtime.getURL('/html/options.html')
        await chrome.tabs.create({ active: true, url })
    } else {
        const term = await openOptionsFor(ctx.menuItemId, ctx.selectionText)
        if (!term) {
            const url = chrome.runtime.getURL('html/options.html')
            console.log(`url: ${url}`)
            await chrome.tabs.create({ active: true, url })
        }
        console.log(`navigator.clipboard.writeText: term: ${term}`)
        await clipboardWrite(term)
    }
}

/**
 * Sets all Nested Keys to true
 * TODO: This only works on first install and will not update new options
 * @function setNestedDefaults
 * @param {Object} options
 * @param {Object} defaults
 * @return {Object}
 */
async function setNestedDefaults(options, defaults) {
    if (options) {
        return options
    }
    options = {
        contextMenu: true,
        showUpdate: true,
    }
    for (const [key, value] of Object.entries(defaults)) {
        // console.log(`${key}: ${value}`)
        if (!options[key]) {
            options[key] = {}
        }
        for (const [name] of Object.entries(value)) {
            // console.log(`${name}: ${url}`)
            options[key][name] = true
        }
    }
    console.log('options:', options)
    await chrome.storage.sync.set({ options: options })
    return options
}
