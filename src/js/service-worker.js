// Background Service Worker JS

import { links, clipboardWrite, openOptionsFor } from './exports.js'

chrome.runtime.onInstalled.addListener(async function () {
    const contexts = [
        // [['link'], 'link', 'Link Menu'],
        [['page'], 'page', 'Page Menu'],
        [['selection'], 'registration', 'Registration Search'],
        [['selection'], 'flight', 'Flight # Search'],
        [['selection'], 'airport', 'Airport Search'],
        // [['audio'], 'audio', 'Audio Menu'],
        // [['image'], 'image', 'Image Menu'],
        // [['video'], 'video', 'Video Menu'],
    ]
    for (const context of contexts) {
        chrome.contextMenus.create({
            title: context[2],
            contexts: context[0],
            id: context[1],
        })
    }
    console.log('chrome.runtime.onInstalled')
    let { options } = (await chrome.storage.sync.get(['options'])) || {}
    console.log('options:', options)
    // Set All Options to true if !options
    if (!options) {
        await setNestedDefaults(links)
    }
})

chrome.contextMenus.onClicked.addListener(async function (ctx) {
    console.log('ctx:', ctx)
    console.log('ctx.menuItemId: ' + ctx.menuItemId)
    const searchTerm = await openOptionsFor(ctx.menuItemId, ctx.selectionText)
    if (!searchTerm) {
        const url = chrome.runtime.getURL('html/options.html')
        console.log(`url: ${url}`)
        await chrome.tabs.create({ active: true, url })
    }
    console.log(`navigator.clipboard.writeText: searchTerm: ${searchTerm}`)
    await clipboardWrite(searchTerm)
})

chrome.notifications.onClicked.addListener((notificationId) => {
    console.log(`notifications.onClicked: ${notificationId}`)
    chrome.notifications.clear(notificationId)
})

/**
 * Sets all Nested Keys to true
 * @function setNestedDefaults
 * @param {Object} defaults
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
    console.log('options:', options)
    await chrome.storage.sync.set({ options: options })
}
