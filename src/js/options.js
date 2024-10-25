// JS for options.html

import {
    showToast,
    saveOptions,
    updateBrowser,
    updateManifest,
    updateOptions,
} from './exports.js'

chrome.storage.onChanged.addListener(onChanged)
document.addEventListener('DOMContentLoaded', initOptions)
document.getElementById('copy-support').addEventListener('click', copySupport)
document
    .querySelectorAll('#jump-list > a')
    .forEach((el) => el.addEventListener('click', jumpClick))
document
    .querySelectorAll('[data-controls]')
    .forEach((el) => el.addEventListener('click', hideShowAll))
document
    .querySelectorAll('[data-section]')
    .forEach((el) => el.addEventListener('click', hideShowSection))
document
    .getElementById('reset-background')
    .addEventListener('click', resetBackground)
document
    .querySelectorAll('form.options input,select')
    .forEach((el) => el.addEventListener('change', saveOptions))
document
    .querySelectorAll('form.options')
    .forEach((el) => el.addEventListener('submit', (e) => e.preventDefault()))
document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el))
document
    .getElementById('bookmarks-form')
    .addEventListener('submit', addBookmark)
document
    .getElementById('export-bookmarks')
    .addEventListener('click', exportBookmarks)
document
    .getElementById('import-bookmarks')
    .addEventListener('click', importBookmarks)

const bookmarksInput = document.getElementById('bookmarks-input')
bookmarksInput.addEventListener('change', inputBookmarks)

/**
 * Options Page Init
 * @function initOptions
 */
async function initOptions() {
    console.debug('initOptions')
    // noinspection ES6MissingAwait
    hideSections()
    // noinspection ES6MissingAwait
    updateBrowser()
    // noinspection ES6MissingAwait
    checkInstall()
    // noinspection ES6MissingAwait
    updateManifest()
    // noinspection ES6MissingAwait
    setShortcuts()

    chrome.storage.sync.get(['options', 'bookmarks']).then((items) => {
        // console.debug('options:', items.options)
        updateOptions(items.options)
        setBackground(items.options)
        updateBookmarks(items.bookmarks)
    })
}

async function hideSections() {
    // console.debug('hideSections')
    const sections = JSON.parse(localStorage.getItem('sections') || '[]')
    // console.debug('sections:', sections)
    for (const section of sections) {
        // console.debug('section:', section)
        const el = document.getElementById(section)
        // console.debug('el:', el)
        el.style.display = 'none'
        document.querySelector(`[data-section="${section}"]`).textContent =
            'show'
    }
}

function jumpClick(event) {
    console.debug('jumpClick:', event)
    const hash = event.currentTarget.hash
    console.debug('hash:', hash)
    $(hash).show('fast')
    document.querySelector(
        `[data-section="${hash.substring(1)}"]`
    ).textContent = 'hide'
}

function hideShowAll(event) {
    console.debug('hideShowAll:', event)
    const action = event.currentTarget.dataset.controls
    console.debug('action:', action)
    const sections = document.querySelectorAll('section')
    const storage = []
    for (const section of sections) {
        // console.debug('section:', section)
        if (action === 'expand') {
            // console.debug('%c SHOW Section', 'color: Lime')
            $(section).show('fast')
            document.querySelector(
                `[data-section="${section.id}"]`
            ).textContent = 'hide'
        } else {
            // console.debug('%c HIDE Section', 'color: OrangeRed')
            $(section).hide('fast')
            storage.push(section.id)
            document.querySelector(
                `[data-section="${section.id}"]`
            ).textContent = 'show'
        }
    }
    if (action === 'expand') {
        // console.debug('storage:', '[]')
        localStorage.setItem('sections', '[]')
    } else {
        // console.debug('storage:', storage)
        localStorage.setItem('sections', JSON.stringify(storage))
    }
}

function hideShowSection(event) {
    console.debug('hideShowSection:', event)
    const section = event.currentTarget.dataset.section
    console.debug('section:', section)
    const el = document.getElementById(section)
    // console.debug('el:', el)
    const sections = JSON.parse(localStorage.getItem('sections') || '[]')
    // console.debug('sections:', sections)
    const shown = !sections.includes(section)
    // console.debug('shown:', shown)
    if (shown) {
        console.debug('%c HIDE Section', 'color: OrangeRed')
        $(el).hide('fast')
        sections.push(section)
        document.querySelector(`[data-section="${section}"]`).textContent =
            'show'
    } else {
        console.debug('%c SHOW Section', 'color: Lime')
        $(el).show('fast')
        const idx = sections.indexOf(section)
        sections.splice(idx, 1)
        document.querySelector(`[data-section="${section}"]`).textContent =
            'hide'
    }
    // console.debug('sections:', sections)
    localStorage.setItem('sections', JSON.stringify(sections))
}

async function checkInstall() {
    // const searchParams = new URLSearchParams(window.location.search)
    // const install = searchParams.get('install')
    // if (install) {
    if (window.location.search.includes('?install=new')) {
        history.pushState(null, '', location.href.split('?')[0])
        const userSettings = await chrome.action.getUserSettings()
        if (userSettings.isOnToolbar) {
            return console.log('%c Toolbar Icon Already Pinned!', 'color: Aqua')
        }
        const pin = document.getElementById('pin-notice')
        pin.addEventListener('click', pinClick)
        setTimeout(pinClick, 10000)
        pin.classList.remove('d-none')
        if (navigator.userAgent.includes('Firefox/')) {
            console.log('Firefox')
            pin.querySelector('.firefox').classList.remove('d-none')
        } else if (navigator.userAgent.includes('Edg/')) {
            console.log('Edge')
            pin.querySelector('.edge').classList.remove('d-none')
        } else {
            console.log('Chromium/Other')
            pin.querySelector('.chromium').classList.remove('d-none')
        }
    }
}

/**
 * Set Background
 * @function setBackground
 * @param {Object} options
 */
function setBackground(options) {
    console.debug('setBackground:', options.radioBackground, options.pictureURL)
    if (options.radioBackground === 'bgPicture') {
        const url = options.pictureURL || 'https://images.cssnr.com/aviation'
        document.body.style.background = `url('${url}') no-repeat center fixed`
        document.body.style.backgroundSize = 'cover'
    } else {
        document.body.style.cssText = ''
    }
}

/**
 * Update Filters Table
 * @function updateBookmarks
 * @param {String[]} bookmarks
 */
function updateBookmarks(bookmarks) {
    console.debug('updateBookmarks:', bookmarks)
    const tbody = document
        .getElementById('bookmarks-table')
        .querySelector('tbody')
    tbody.innerHTML = ''
    const trashCan = document.querySelector('#clones > .fa-trash-can')
    const faCopy = document.querySelector('#clones > .fa-copy')
    bookmarks.forEach((value) => {
        const row = tbody.insertRow()
        const delBtn = document.createElement('a')
        const svg = trashCan.cloneNode(true)
        delBtn.appendChild(svg)
        delBtn.title = 'Delete'
        delBtn.dataset.value = value
        delBtn.classList.add('link-danger')
        delBtn.setAttribute('role', 'button')
        delBtn.addEventListener('click', deleteBookmark)
        const cell1 = row.insertCell()
        cell1.classList.add('text-center', 'align-middle')
        // cell1.dataset.idx = i.toString()
        cell1.appendChild(delBtn)

        const link = document.createElement('a')
        // link.dataset.idx = idx
        link.textContent = value.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')
        // .substring(0, 100) // TODO: Add text-ellipsis
        link.title = value
        link.classList.add(
            'link-body-emphasis',
            'link-underline',
            'link-underline-opacity-0',
            'text-break'
        )
        link.target = '_blank'
        link.href = value
        link.setAttribute('role', 'button')
        const cell2 = row.insertCell()
        // cell2.id = `td-${i}`
        // cell2.dataset.idx = i.toString()
        // cell2.classList.add('text-break')
        // cell2.setAttribute('role', 'button')
        cell2.appendChild(link)

        const copyLink = document.createElement('a')
        copyLink.appendChild(faCopy.cloneNode(true))
        copyLink.title = 'Copy'
        copyLink.dataset.clipboardText = value
        copyLink.classList.add('link-info')
        copyLink.setAttribute('role', 'button')
        const cell3 = row.insertCell()
        cell3.classList.add('text-center')
        cell3.appendChild(copyLink)
    })
}

/**
 * Add Bookmark Submit Callback
 * @function addBookmark
 * @param {SubmitEvent} event
 */
async function addBookmark(event) {
    console.debug('addBookmark:', event)
    event.preventDefault()
    const input = document.getElementById('newBookmark')
    const value = event.target.elements.newBookmark.value.trim()
    console.log('value:', value)
    let url
    try {
        url = new URL(value)
    } catch (e) {
        console.log(e)
        showToast(`Error: ${e.message}`, 'danger')
        return input.focus()
    }
    const { bookmarks } = await chrome.storage.sync.get(['bookmarks'])
    if (!bookmarks.includes(url.href)) {
        bookmarks.push(url.href)
        console.debug('bookmarks:', bookmarks)
        await chrome.storage.sync.set({ bookmarks })
        updateBookmarks(bookmarks)
        showToast('Added Bookmark.', 'success')
    } else {
        showToast('Bookmark Already Added.', 'warning')
    }
    input.value = ''
    input.focus()
}

/**
 * Delete Bookmark Click Callback
 * @function deleteBookmark
 * @param {MouseEvent} event
 */
async function deleteBookmark(event) {
    console.debug('deleteBookmark:', event)
    event.preventDefault()
    const { bookmarks } = await chrome.storage.sync.get(['bookmarks'])
    const anchor = event.target.closest('a')
    console.debug('anchor:', anchor)
    const href = anchor?.dataset?.value
    console.debug(`href: ${href}`)
    let index
    if (href && bookmarks.includes(href)) {
        index = bookmarks.indexOf(href)
    }
    console.debug(`index: ${index}`)
    if (index !== undefined) {
        bookmarks.splice(index, 1)
        await chrome.storage.sync.set({ bookmarks })
        showToast(`Removed Bookmark.`, 'success')
    } else {
        showToast(`Bookmark Not Found.`, 'warning')
    }
}

/**
 * Export Bookmark Click Callback
 * @function exportBookmarks
 * @param {MouseEvent} event
 */
async function exportBookmarks(event) {
    console.debug('exportBookmarks:', event)
    event.preventDefault()
    const { bookmarks } = await chrome.storage.sync.get(['bookmarks'])
    console.debug('bookmarks:', bookmarks)
    if (!bookmarks) {
        return showToast('No Bookmarks Found!', 'warning')
    }
    const json = JSON.stringify(bookmarks)
    textFileDownload('bookmarks.txt', json)
}

/**
 * Import Bookmark Click Callback
 * @function importBookmarks
 * @param {MouseEvent} event
 */
async function importBookmarks(event) {
    console.debug('importBookmarks:', event)
    event.preventDefault()
    bookmarksInput.click()
}

/**
 * Bookmark Input Change Callback
 * @function inputBookmarks
 * @param {InputEvent} event
 */
async function inputBookmarks(event) {
    console.debug('inputBookmarks:', event)
    event.preventDefault()
    const fileReader = new FileReader()
    fileReader.onload = async function doImport() {
        const result = JSON.parse(fileReader.result.toString())
        console.debug('result:', result)
        const { bookmarks } = await chrome.storage.sync.get(['bookmarks'])
        let count = 0
        for (const pid of result) {
            if (!bookmarks.includes(pid)) {
                bookmarks.push(pid)
                count += 1
            }
        }
        showToast(`Imported ${count}/${result.length} Bookmarks.`, 'success')
        await chrome.storage.sync.set({ bookmarks })
    }
    fileReader.readAsText(bookmarksInput.files[0])
}

/**
 * Text File Download
 * @function textFileDownload
 * @param {String} filename
 * @param {String} text
 */
function textFileDownload(filename, text) {
    console.debug(`textFileDownload: ${filename}`)
    const element = document.createElement('a')
    element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    )
    element.setAttribute('download', filename)
    element.classList.add('d-none')
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
}

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
function onChanged(changes, namespace) {
    console.debug('onChanged:', changes, namespace)
    for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (namespace === 'sync') {
            if (key === 'options') {
                updateOptions(newValue)
                if (oldValue.radioBackground !== newValue.radioBackground) {
                    setBackground(newValue)
                }
                // noinspection JSUnresolvedReference
                if (
                    oldValue.pictureURL !== newValue.pictureURL ||
                    oldValue.videoURL !== newValue.videoURL
                ) {
                    setBackground(newValue)
                }
            } else if (key === 'bookmarks') {
                updateBookmarks(newValue)
            }
        }
    }
}

/**
 * Set Keyboard Shortcuts
 * @function setShortcuts
 * @param {String} selector
 * @param {Boolean} action
 */
async function setShortcuts(selector = '#keyboard-shortcuts', action = true) {
    const table = document.querySelector(selector)
    const tbody = table.querySelector('tbody')
    const source = table.querySelector('tfoot > tr').cloneNode(true)
    const commands = await chrome.commands.getAll()
    for (const command of commands) {
        // console.debug('command:', command)
        const row = source.cloneNode(true)
        // TODO: Chrome does not parse the description for _execute_action in manifest.json
        let description = command.description
        if (!description && command.name === '_execute_action') {
            description = 'Show Popup'
        }
        row.querySelector('.description').textContent = description
        row.querySelector('kbd').textContent = command.shortcut || 'Not Set'
        tbody.appendChild(row)
    }

    if (action) {
        try {
            const userSettings = await chrome.action.getUserSettings()
            const row = source.cloneNode(true)
            row.querySelector('i').className = 'fa-solid fa-puzzle-piece me-1'
            row.querySelector('.description').textContent =
                'Toolbar Icon Pinned'
            row.querySelector('kbd').textContent = userSettings.isOnToolbar
                ? 'Yes'
                : 'No'
            tbody.appendChild(row)
        } catch (e) {
            console.log('Error adding pinned setting:', e)
        }
    }
}

/**
 * Reset Background Option Callback
 * @function resetBackground
 * @param {InputEvent} event
 */
async function resetBackground(event) {
    console.log('resetBackground:', event)
    event.preventDefault()
    const pictureURL = document.getElementById('pictureURL')
    pictureURL.value = 'https://images.cssnr.com/aviation'
    pictureURL.focus()
    // const form = document.getElementById('options-form')
    // form.submit()
    await saveOptions(event)
    showToast('Background Image URL Reset.')
}

/**
 * Pin Animation Click Callback
 * @function pinClick
 * @param {MouseEvent} event
 */
function pinClick(event) {
    console.debug('pinClick:', event)
    document.getElementById('pin-notice').classList.add('d-none')
}

/**
 * Copy Support/Debugging Information
 * @function copySupport
 * @param {MouseEvent} event
 */
async function copySupport(event) {
    console.debug('copySupport:', event)
    event.preventDefault()
    const manifest = chrome.runtime.getManifest()
    const { options } = await chrome.storage.sync.get(['options'])
    const userSettings = await chrome.action.getUserSettings()
    const result = [
        `${manifest.name} - ${manifest.version}`,
        navigator.userAgent,
        `options: ${JSON.stringify(options)}`,
        `pinned: ${userSettings.isOnToolbar ? 'yes' : 'no'}`,
    ]
    await navigator.clipboard.writeText(result.join('\n'))
    showToast('Support Information Copied.')
}
