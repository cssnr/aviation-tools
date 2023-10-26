// Background Service Worker JS

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

chrome.contextMenus.onClicked.addListener(function (ctx) {
    console.log('ctx.menuItemId: ' + ctx.menuItemId)
    console.log(ctx)
})

// chrome.notifications.onClicked.addListener((notificationId) => {
//     console.log(`notifications.onClicked: ${notificationId}`)
// })
