// JS Background Service Worker

import {
    githubURL,
    searchLinks,
    clipboardWrite,
    openAllBookmarks,
    openOptionsFor,
} from './exports.js'

chrome.runtime.onStartup.addListener(onStartup)
chrome.runtime.onInstalled.addListener(onInstalled)
chrome.contextMenus.onClicked.addListener(onClicked)
chrome.commands.onCommand.addListener(onCommand)
chrome.storage.onChanged.addListener(onChanged)
chrome.omnibox.onInputChanged.addListener(onInputChanged)
chrome.omnibox.onInputCancelled.addListener(onInputCancelled)
chrome.omnibox.onInputEntered.addListener(onInputEntered)

const omniboxDefault = 'Aviation Tools - airport, flight, registration'

/**
 * On Startup Callback
 * @function onStartup
 */
async function onStartup() {
    console.log('onStartup')
    // noinspection JSUnresolvedReference
    if (typeof browser !== 'undefined') {
        console.log('Firefox CTX Menu Workaround')
        const { bookmarks, options } = await chrome.storage.sync.get([
            'bookmarks',
            'options',
        ])
        console.debug('options:', options)
        if (options.contextMenu) {
            createContextMenus(options, bookmarks)
        }
        await chrome.runtime.setUninstallURL(`${githubURL}/issues`)
    }
}

/**
 * Installed Callback
 * @function onInstalled
 * @param {InstalledDetails} details
 */
async function onInstalled(details) {
    console.log('onInstalled:', details)
    const options = await setDefaultOptions({
        searchType: 'registration',
        radioBackground: 'bgPicture',
        pictureURL: 'https://images.cssnr.com/aviation',
        contextMenu: true,
        showUpdate: false,
    })
    console.log('options:', options)
    const { bookmarks } = await chrome.storage.sync.get(['bookmarks'])
    console.log('bookmarks:', bookmarks)
    if (options.contextMenu) {
        createContextMenus(options, bookmarks)
    }
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        // chrome.runtime.openOptionsPage()
        const url = chrome.runtime.getURL('/html/options.html') + '?install=new'
        console.log(`INSTALL url: ${url}`)
        await chrome.tabs.create({ active: true, url })
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        if (options.showUpdate) {
            const manifest = chrome.runtime.getManifest()
            if (manifest.version !== details.previousVersion) {
                const url = `${githubURL}/releases/tag/${manifest.version}`
                await chrome.tabs.create({ active: false, url })
            }
        }
    }
    chrome.omnibox.setDefaultSuggestion({
        description: omniboxDefault,
    })
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
    console.log(`ctx.menuItemId: %c${ctx.menuItemId}`, 'color: HotPink')
    if (ctx.menuItemId === 'options') {
        console.debug('options')
        chrome.runtime.openOptionsPage()
    } else if (ctx.menuItemId === 'openPopup') {
        await chrome.action.openPopup()
    } else if (ctx.menuItemId.startsWith('tools')) {
        if (ctx.menuItemId === 'tools') {
            return chrome.runtime.openOptionsPage()
        }
        const key = ctx.menuItemId.split('-')[1]
        console.debug('key:', key)
        const url = searchLinks.tools[key]
        console.debug('url:', url)
        await chrome.tabs.create({ active: true, url })
    } else if (ctx.menuItemId.startsWith('bookmark')) {
        console.debug('bookmark')
        const { bookmarks } = await chrome.storage.sync.get(['bookmarks'])
        if (ctx.menuItemId === 'bookmark-add') {
            if (!bookmarks.includes(ctx.pageUrl)) {
                bookmarks.push(ctx.pageUrl)
                await chrome.storage.sync.set({ bookmarks })
            }
            return
        }
        if (!bookmarks.length) {
            chrome.runtime.openOptionsPage()
        } else if (ctx.menuItemId === 'bookmark-all') {
            await openAllBookmarks()
        } else {
            const idx = parseInt(ctx.menuItemId.split('-')[1])
            // console.debug('idx:', idx)
            const url = bookmarks[idx]
            // console.debug('url:', url)
            await chrome.tabs.create({ active: true, url })
        }
    } else if (ctx.menuItemId.startsWith('metar')) {
        const href = chrome.runtime.getURL('/html/metar.html')
        const url = new URL(href)
        url.searchParams.append('metar', ctx.selectionText)
        await chrome.tabs.create({ active: true, url: url.href })
    } else {
        const term = await openOptionsFor(ctx.menuItemId, ctx.selectionText)
        await clipboardWrite(term)
    }
}

/**
 * On Command Callback
 * @function onCommand
 * @param {String} command
 */
async function onCommand(command) {
    console.debug('onCommand:', command)
    if (command === 'openBookmarks') {
        await openAllBookmarks()
    } else {
        console.warn('Unknown command:', command)
    }
}

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
async function onChanged(changes, namespace) {
    // console.log('onChanged:', changes, namespace)
    for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
        // console.log(`key: ${key}:`, oldValue, newValue)
        if (namespace === 'sync' && key === 'options' && oldValue && newValue) {
            // if (oldValue?.contextMenu !== newValue?.contextMenu) {
            if (newValue?.contextMenu) {
                console.log('%c Enabled contextMenu...', 'color: Lime')
                // chrome.storage.sync.get(['bookmarks']).then((items) => {
                //     createContextMenus(newValue, items.bookmarks)
                // })
                const { bookmarks } = await chrome.storage.sync.get([
                    'bookmarks',
                ])
                createContextMenus(newValue, bookmarks)
            } else {
                console.log('%c Disabled contextMenu...', 'color: BlueViolet')
                chrome.contextMenus.removeAll()
            }
            // }
        } else if (namespace === 'sync' && key === 'bookmarks') {
            // chrome.storage.sync.get(['options']).then((items) => {
            //     createContextMenus(items.options, newValue)
            // })
            const { options } = await chrome.storage.sync.get(['options'])
            if (options?.contextMenu) {
                console.log(`Updating CTX Menu: ${key}`, 'color: Aqua')
                createContextMenus(options, newValue)
            }
        }
    }
}

async function parseInput(text) {
    console.debug('parseInput:', text)
    text = text.trim()
    const split = text.split(' ')
    const length = split.length
    let command = split.shift().toLowerCase()
    let search = split.join('')
    if (length === 1) {
        command = ''
        search = text
    }
    console.debug('command:', command)
    if (command.startsWith('r') && 'registration'.includes(command)) {
        return ['registration', search]
    } else if (command.startsWith('f') && 'flight'.includes(command)) {
        return ['flight', search]
    } else if (command.startsWith('a') && 'airport'.includes(command)) {
        return ['airport', search]
    } else {
        search = text.replace(/ /g, '')
        let { options } = await chrome.storage.sync.get(['options'])
        return [options.searchType, search]
    }
}

/**
 * Omnibox Input Changed Callback
 * @function onInputChanged
 * @param {String} text
 * @param {Function} suggest
 */
// noinspection JSUnusedLocalSymbols
async function onInputChanged(text, suggest) {
    console.debug('onInputChanged:', text)
    text = text.trim()
    const split = text.split(' ')
    // console.debug('split:', split)
    if (split.length) {
        let command = split.shift().toLowerCase()
        // console.debug('command:', command)
        let search = split.join('')
        console.debug('search:', search)
        if (command.startsWith('r') && 'registration'.includes(command)) {
            chrome.omnibox.setDefaultSuggestion({
                description: 'Aviation Tools - Registration Search',
            })
        } else if (command.startsWith('f') && 'flight'.includes(command)) {
            chrome.omnibox.setDefaultSuggestion({
                description: 'Aviation Tools - Flight Search',
            })
        } else if (command.startsWith('a') && 'airport'.includes(command)) {
            chrome.omnibox.setDefaultSuggestion({
                description: 'Aviation Tools - Airport Search',
            })
        } else {
            let { options } = await chrome.storage.sync.get(['options'])
            // search = text.replace(/\s/g, '')
            const type =
                options.searchType.charAt(0).toUpperCase() +
                options.searchType.slice(1)
            chrome.omnibox.setDefaultSuggestion({
                description: `Aviation Tools - ${type} Search`,
            })
        }
    }
}

/**
 * Omnibox Input Cancelled Callback
 * @function onInputCancelled
 */
async function onInputCancelled() {
    console.debug('onInputCancelled')
    chrome.omnibox.setDefaultSuggestion({
        description: omniboxDefault,
    })
}

/**
 * Omnibox Input Entered Callback
 * @function onInputEntered
 * @param {String} text
 */
async function onInputEntered(text) {
    console.debug('onInputEntered:', text)
    text = text.trim()
    // console.debug('text:', text)
    let [type, search] = await parseInput(text)
    console.debug('type:', type)
    console.debug('search:', search)
    // noinspection ES6MissingAwait
    openOptionsFor(type, search)
}

/**
 * Create Context Menus
 * Note: A newer version of createContextMenus exists that sets nested.
 * @function createContextMenus
 * @param {Object} options
 * @param {Array} bookmarks
 */
export function createContextMenus(options, bookmarks) {
    console.log('createContextMenus:', options, bookmarks)
    chrome.contextMenus.removeAll()
    const contexts = [
        [['selection'], 'search', 'normal', 'Search'],
        [['selection'], 'decode', 'normal', 'Decode'],
        [['selection'], 'sep-1', 'separator', 'separator'],
        [['selection'], 'sep-2', 'separator', 'separator'],
        [['all'], 'tools', 'normal', 'Tools'],
        [['all'], 'bookmarks', 'normal', 'Bookmarks'],
        [['all'], 'sep-3', 'separator', 'separator'],
        [['all'], 'openPopup', 'normal', 'Open Popup'],
        [['all'], 'options', 'normal', 'Open Options'],
    ]
    contexts.forEach((context) => {
        chrome.contextMenus.create({
            contexts: context[0],
            id: context[1],
            title: context[3],
            type: context[2],
        })
    })
    const search = [
        [['selection'], 'registration', 'normal', 'Registration Search'],
        [['selection'], 'flight', 'normal', 'Flight Search'],
        [['selection'], 'airport', 'normal', 'Airport Search'],
    ]
    search.forEach((ctx) => {
        chrome.contextMenus.create({
            contexts: ctx[0],
            id: ctx[1],
            parentId: 'search',
            title: ctx[3],
        })
    })
    const decode = [[['selection'], 'metar', 'normal', 'METAR Decode']]
    decode.forEach((ctx) => {
        chrome.contextMenus.create({
            contexts: ctx[0],
            id: ctx[1],
            parentId: 'decode',
            title: ctx[3],
        })
    })
    for (const key of Object.keys(searchLinks.tools)) {
        // console.log('key:', key)
        if (options.tools[key]) {
            chrome.contextMenus.create({
                contexts: ['all'],
                id: `tools-${key}`,
                parentId: 'tools',
                title: key.charAt(0).toUpperCase() + key.slice(1),
            })
        }
    }
    chrome.contextMenus.create({
        contexts: ['all'],
        id: `bookmark-add`,
        parentId: 'bookmarks',
        title: 'Bookmark Current URL',
    })
    if (bookmarks.length) {
        chrome.contextMenus.create({
            contexts: ['all'],
            id: `bookmark-all`,
            parentId: 'bookmarks',
            title: 'Open All Bookmarks',
        })
        chrome.contextMenus.create({
            contexts: ['all'],
            id: `bookmark-sep`,
            parentId: 'bookmarks',
            type: 'separator',
        })
        bookmarks.forEach((url, i) => {
            // console.log(`pattern: ${i}: ${pattern}`)
            const title = url
                .replace(/(^\w+:|^)\/\//, '')
                .replace(/\/$/, '')
                .substring(0, 50)
            chrome.contextMenus.create({
                contexts: ['all'],
                id: `bookmark-${i}`,
                parentId: 'bookmarks',
                title: title,
            })
        })
    }
}

/**
 * Set Default Options
 * Note: A newer version of setDefaultOptions exists that sets nested.
 * @function setDefaultOptions
 * @param {Object} defaultOptions
 * @return {Promise<*|Object>}
 */
async function setDefaultOptions(defaultOptions) {
    console.log('setDefaultOptions', defaultOptions)
    let { bookmarks, options } = await chrome.storage.sync.get([
        'bookmarks',
        'options',
    ])
    if (!bookmarks) {
        console.log('Initialize empty bookmarks sync storage array.')
        await chrome.storage.sync.set({ bookmarks: [] })
    }
    options = options || {}
    console.debug('options:', options)
    let changed = false
    for (const [key, value] of Object.entries(defaultOptions)) {
        // console.log(`${key}: default: ${value} current: ${options[key]}`)
        if (options[key] === undefined) {
            changed = true
            options[key] = value
            console.log(`Set %c${key}:`, 'color: LightSalmon', value)
        }
    }
    const linksChanges = setNestedDefaults(options, searchLinks)
    changed = changed || linksChanges
    if (changed) {
        await chrome.storage.sync.set({ options })
        console.log('changed options:', options)
    }
    return options
}

/**
 * Sets all Nested Keys to true
 * Note: A newer version of setDefaultOptions exists that sets nested.
 * @function setNestedDefaults
 * @param {Object} options
 * @param {Object} defaults
 * @return {Boolean}
 */
function setNestedDefaults(options, defaults) {
    console.log('setNestedDefaults:', options, defaults)
    let changed = false
    for (const [key, value] of Object.entries(defaults)) {
        console.log(`Nested: %c${key}`, 'color: Khaki', value)
        if (!options[key]) {
            options[key] = {}
        }
        for (const [subkey] of Object.entries(value)) {
            if (typeof options[key][subkey] === 'undefined') {
                changed = true
                options[key][subkey] = true
                console.log(`Set %c${key}:`, 'color: LightSalmon', value)
            }
        }
    }
    return changed
}
