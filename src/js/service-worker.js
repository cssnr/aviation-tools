// JS Background Service Worker

import { searchLinks, clipboardWrite, openOptionsFor } from './exports.js'

chrome.runtime.onInstalled.addListener(onInstalled)
chrome.contextMenus.onClicked.addListener(onClicked)
chrome.storage.onChanged.addListener(onChanged)

/**
 * Installed Callback
 * @function onInstalled
 * @param {InstalledDetails} details
 */
async function onInstalled(details) {
    console.log('onInstalled:', details)
    const githubURL = 'https://github.com/cssnr/aviation-tools'
    let { options } = await chrome.storage.sync.get(['options'])
    options = await Promise.resolve(setNestedDefaults(options, searchLinks))
    console.log('options:', options)
    if (options.contextMenu) {
        createContextMenus()
    }
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.runtime.openOptionsPage()
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        if (options.showUpdate) {
            const manifest = chrome.runtime.getManifest()
            if (manifest.version !== details.previousVersion) {
                const url = `${githubURL}/releases/tag/${manifest.version}`
                await chrome.tabs.create({ url, active: false })
            }
        }
    }
    await chrome.runtime.setUninstallURL(`${githubURL}/issues`)
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
    if (ctx.menuItemId === 'options') {
        chrome.runtime.openOptionsPage()
    } else {
        const term = await openOptionsFor(ctx.menuItemId, ctx.selectionText)
        if (!term) {
            chrome.runtime.openOptionsPage()
        }
        console.log(`navigator.clipboard.writeText: term: ${term}`)
        await clipboardWrite(term)
    }
}

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
function onChanged(changes, namespace) {
    // console.log('onChanged:', changes, namespace)
    for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (namespace === 'sync' && key === 'options' && oldValue && newValue) {
            if (oldValue.contextMenu !== newValue.contextMenu) {
                if (newValue?.contextMenu) {
                    console.log('Enabled contextMenu...')
                    createContextMenus()
                } else {
                    console.log('Disabled contextMenu...')
                    chrome.contextMenus.removeAll()
                }
            }
        }
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

/**
 * Create Context Menus
 * @function createContextMenus
 */
export function createContextMenus() {
    console.log('createContextMenus')
    chrome.contextMenus.removeAll()
    const contexts = [
        [['selection'], 'registration', 'normal', 'Registration Search'],
        [['selection'], 'flight', 'normal', 'Flight # Search'],
        [['selection'], 'airport', 'normal', 'Airport Search'],
        [['selection'], 'separator-1', 'separator', 'separator'],
        [['all'], 'options', 'normal', 'Open Options'],
    ]
    contexts.forEach((context) => {
        chrome.contextMenus.create({
            contexts: context[0],
            id: context[1],
            type: context[2],
            title: context[3],
        })
    })
}
