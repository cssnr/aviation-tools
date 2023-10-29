// Background Service Worker JS

import { openOptionsFor } from './exports.js'

chrome.runtime.onInstalled.addListener(function () {
    const contexts = [
        // ['link', 'Link Menu'],
        // ['page', 'Page Menu'],
        ['selection', 'registration', 'Registration Search'],
        ['selection', 'flight', 'Flight # Search'],
        ['selection', 'airport', 'Airport Search'],
        // ['audio', 'Audio Menu'],
        // ['image', 'Image Menu'],
        // ['video', 'Video Menu'],
    ]
    for (const context of contexts) {
        chrome.contextMenus.create({
            title: context[2],
            contexts: [context[0]],
            id: context[1],
        })
    }
})

chrome.contextMenus.onClicked.addListener(async function (ctx) {
    console.log('ctx:', ctx)
    console.log('ctx.menuItemId: ' + ctx.menuItemId)
    await openOptionsFor(ctx.menuItemId, ctx.selectionText)
})

// chrome.notifications.onClicked.addListener((notificationId) => {
//     console.log(`notifications.onClicked: ${notificationId}`)
// })
