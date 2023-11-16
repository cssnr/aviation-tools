// JS Background Service Worker

import {
    links,
    clipboardWrite,
    createContextMenus,
    openOptionsFor,
} from './exports.js'

chrome.runtime.onInstalled.addListener(async function (details) {
    console.log('chrome.runtime.onInstalled: details:', details)
    // Set Default Options
    let { options } = (await chrome.storage.sync.get(['options'])) || {}
    console.log('options:', options)
    if (!options) {
        options = await setNestedDefaults(links)
    }
    // Create Context Menus if Enabled
    if (options.contextMenu) {
        await createContextMenus()
    }
    // Check if Updated and Show Release Notes
    if (details.reason === 'update') {
        const manifest = chrome.runtime.getManifest()
        if (manifest.version !== details.previousVersion) {
            const url = `https://github.com/cssnr/aviation-tools/releases/tag/${manifest.version}`
            console.log(`url: ${url}`)
            await chrome.tabs.create({ active: true, url })
        }
    }
    // Set Uninstall URL
    chrome.runtime.setUninstallURL(
        'https://github.com/cssnr/aviation-tools/issues'
    )
})

chrome.contextMenus.onClicked.addListener(async function (ctx) {
    console.log('ctx:', ctx)
    console.log('ctx.menuItemId: ' + ctx.menuItemId)

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
})

// chrome.notifications.onClicked.addListener((notificationId) => {
//     console.log(`notifications.onClicked: ${notificationId}`)
//     chrome.notifications.clear(notificationId)
// })

/**
 * Sets all Nested Keys to true
 * @function setNestedDefaults
 * @param {Object} defaults
 * @return {Object}
 */
async function setNestedDefaults(defaults) {
    let options = {}
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
    options.contextMenu = true
    console.log('options:', options)
    await chrome.storage.sync.set({ options: options })
    return options
}
