// JS Background Service Worker

import { searchLinks, clipboardWrite, openOptionsFor } from './exports.js'

chrome.runtime.onStartup.addListener(onStartup)
chrome.runtime.onInstalled.addListener(onInstalled)
chrome.contextMenus.onClicked.addListener(onClicked)
chrome.storage.onChanged.addListener(onChanged)

/**
 * On Startup Callback
 * @function onStartup
 */
async function onStartup() {
    console.log('onStartup')
    if (typeof browser !== 'undefined') {
        console.log('Firefox CTX Menu Workaround')
        const { options } = await chrome.storage.sync.get(['options'])
        console.debug('options:', options)
        if (options.contextMenu) {
            createContextMenus()
        }
    }
}

/**
 * Installed Callback
 * @function onInstalled
 * @param {InstalledDetails} details
 */
async function onInstalled(details) {
    console.log('onInstalled:', details)
    const githubURL = 'https://github.com/cssnr/aviation-tools'
    const options = await Promise.resolve(
        setDefaultOptions({
            searchType: 'registration',
            contextMenu: true,
            showUpdate: false,
        })
    )
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
                await chrome.tabs.create({ active: false, url })
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
    console.debug('onClicked:', ctx, tab)
    if (ctx.menuItemId === 'options') {
        chrome.runtime.openOptionsPage()
    } else {
        console.log(`ctx.menuItemId: ${ctx.menuItemId}`)
        const term = await openOptionsFor(ctx.menuItemId, ctx.selectionText)
        if (!term) {
            chrome.runtime.openOptionsPage()
        }
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
                    console.info('Enabled contextMenu...')
                    createContextMenus()
                } else {
                    console.info('Disabled contextMenu...')
                    chrome.contextMenus.removeAll()
                }
            }
        }
    }
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

/**
 * Set Default Options
 * @function setDefaultOptions
 * @param {Object} defaultOptions
 * @return {Object}
 */
async function setDefaultOptions(defaultOptions) {
    console.log('setDefaultOptions', defaultOptions)
    let { bookmarks, options } = await chrome.storage.sync.get([
        'bookmarks',
        'options',
    ])
    if (!bookmarks) {
        bookmarks = []
        await chrome.storage.sync.set({ bookmarks })
    }
    options = options || {}
    console.debug('options', options)
    let changed = false
    for (const [key, value] of Object.entries(defaultOptions)) {
        // console.log(`${key}: default: ${value} current: ${options[key]}`)
        if (options[key] === undefined) {
            changed = true
            options[key] = value
            console.log(`Set ${key}:`, value)
        }
    }
    const nestedChanges = await Promise.resolve(
        setNestedDefaults(options, searchLinks)
    )
    changed = changed || nestedChanges
    console.debug('changed', changed)
    if (changed) {
        await chrome.storage.sync.set({ options })
        console.log('changed:', options)
    }
    return options
}

/**
 * Sets all Nested Keys to true
 * TODO: Make a function and combine with above function
 * @function setNestedDefaults
 * @param {Object} options
 * @param {Object} defaults
 * @return {Boolean}
 */
function setNestedDefaults(options, defaults) {
    console.log('setNestedDefaults:', options, defaults)
    let changed = false
    for (const [key, value] of Object.entries(defaults)) {
        console.log(`Nested: ${key}`, value)
        if (!options[key]) {
            options[key] = {}
        }
        for (const [subkey] of Object.entries(value)) {
            if (typeof options[key][subkey] === 'undefined') {
                options[key][subkey] = true
                changed = true
            }
        }
    }
    return changed
}
