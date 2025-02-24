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
    .forEach((el) => el.addEventListener('click', hideShowCallback))
document
    .querySelectorAll('[data-reset-input]')
    .forEach((el) => el.addEventListener('click', resetInput))
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

document.getElementById('chrome-shortcuts').addEventListener('click', () => {
    // noinspection JSIgnoredPromiseFromCall
    chrome.tabs.update({ url: 'chrome://extensions/shortcuts' })
})

const bookmarksInput = document.getElementById('bookmarks-input')
bookmarksInput.addEventListener('change', inputBookmarks)

window.addEventListener('hashchange', (event) => {
    // Keep Options URL Clean as to not break runtime.openOptionsPage()
    console.log('hashchange:', event)
    event.preventDefault()
    const url = window.location.origin + window.location.pathname
    console.log('url:', url)
    history.pushState(null, '', url)
})

const filtersTbody = document.querySelector('#bookmarks-table tbody')

/**
 * Options Page Init
 * @function initOptions
 */
async function initOptions() {
    console.debug('initOptions')
    // noinspection ES6MissingAwait
    hideSections()
    // noinspection ES6MissingAwait
    updateManifest()
    // noinspection ES6MissingAwait
    updateBrowser()
    // noinspection ES6MissingAwait
    setShortcuts()
    // noinspection ES6MissingAwait
    checkInstall()

    chrome.storage.sync.get(['options', 'bookmarks']).then((items) => {
        // console.debug('options:', items.options)
        updateOptions(items.options)
        setBackground(items.options)
        updateBookmarks(items.bookmarks)
    })
}

async function hideSections() {
    // console.debug('hideSections')
    /** @type {String[]} sections **/
    const sections = JSON.parse(localStorage.getItem('sections') || '[]')
    console.debug('sections:', sections)
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
    event.preventDefault()
    const hash = event.currentTarget.hash
    console.debug('hash:', hash)
    // $(hash).show('fast')
    hideShowSection(hash.substring(1), true)
    const jq = $(hash)
    const top = jq.offset().top - 30
    $('html, body').animate({ scrollTop: top }, 'fast', 'swing', () => {
        jq.css('outline', '#00c800 dashed 2px')
        setTimeout(() => jq.css('outline', ''), 1800)
    })
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
        console.debug('storage:', '[]')
        localStorage.setItem('sections', '[]')
    } else {
        console.debug('storage:', storage)
        localStorage.setItem('sections', JSON.stringify(storage))
    }
}

function hideShowCallback(event) {
    console.debug('hideShowCallback:', event)
    const section = event.currentTarget.dataset.section
    console.debug('section:', section)
    const show =
        document.querySelector(`[data-section="${section}"]`).textContent ===
        'show'
    console.debug('show:', show)
    hideShowSection(section, show)
    // const el = document.getElementById(section)
    // // console.debug('el:', el)
    // const sections = JSON.parse(localStorage.getItem('sections') || '[]')
    // // console.debug('sections:', sections)
    // const shown = !sections.includes(section)
    // // console.debug('shown:', shown)
    // if (shown) {
    //     console.debug('%c HIDE Section', 'color: OrangeRed')
    //     $(el).hide('fast')
    //     sections.push(section)
    //     document.querySelector(`[data-section="${section}"]`).textContent =
    //         'show'
    // } else {
    //     console.debug('%c SHOW Section', 'color: Lime')
    //     $(el).show('fast')
    //     const idx = sections.indexOf(section)
    //     sections.splice(idx, 1)
    //     document.querySelector(`[data-section="${section}"]`).textContent =
    //         'hide'
    // }
    // // console.debug('sections:', sections)
    // localStorage.setItem('sections', JSON.stringify(sections))
}

function hideShowSection(section, show = false) {
    console.debug(`hideShowSection: ${section}:`, show)
    const jq = $(`#${section}`)
    console.debug('jq:', jq)
    const sections = JSON.parse(localStorage.getItem('sections') || '[]')
    // console.debug('sections:', sections)
    if (!show) {
        console.debug('%c HIDE Section', 'color: OrangeRed')
        jq.hide('fast')
        if (!sections.includes(section)) {
            sections.push(section)
        }
        document.querySelector(`[data-section="${section}"]`).textContent =
            'show'
    } else {
        console.debug('%c SHOW Section', 'color: Lime')
        jq.show('fast')
        const idx = sections.indexOf(section)
        if (idx !== -1) {
            sections.splice(idx, 1)
        }
        document.querySelector(`[data-section="${section}"]`).textContent =
            'hide'
    }
    console.debug('sections:', sections)
    localStorage.setItem('sections', JSON.stringify(sections))
}

async function checkInstall() {
    // const searchParams = new URLSearchParams(window.location.search)
    // const install = searchParams.get('install')
    // if (install) {
    if (window.location.search.includes('?install=new')) {
        console.log('%c New Install Detected...', 'color: Lime')
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
    filtersTbody.innerHTML = ''
    const trashCan = document.querySelector('#clones > .fa-trash-can')
    const faGrip = document.querySelector('#clones > .fa-grip')
    const faCopy = document.querySelector('#clones > .fa-copy')
    bookmarks.forEach((value, i) => {
        const row = filtersTbody.insertRow()
        row.id = i.toString()

        // DELETE
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

        // BOOKMARK
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

        // GRIP
        const cell3 = row.insertCell()
        cell3.classList.add('text-center', 'align-middle', 'link-body-emphasis')
        cell3.setAttribute('role', 'button')
        const grip = faGrip.cloneNode(true)
        grip.title = 'Drag'
        cell3.appendChild(grip)
        cell3.setAttribute('draggable', 'true')
        cell3.addEventListener('dragstart', dragStart)

        // COPY
        const copyLink = document.createElement('a')
        copyLink.appendChild(faCopy.cloneNode(true))
        copyLink.title = 'Copy'
        copyLink.dataset.clipboardText = value
        copyLink.classList.add('link-info')
        copyLink.setAttribute('role', 'button')
        const cell4 = row.insertCell()
        cell4.classList.add('text-center')
        cell4.appendChild(copyLink)
    })
    filtersTbody.addEventListener('dragover', dragOver)
    filtersTbody.addEventListener('dragleave', dragEnd)
    filtersTbody.addEventListener('dragend', dragEnd)
    filtersTbody.addEventListener('drop', drop)
}

let row
let last = -1

/**
 * Drag Start Event Callback
 * Trigger filterClick to prevent dragging while editing
 * @function dragStart
 * @param {MouseEvent} event
 */
async function dragStart(event) {
    console.debug('%cdragStart:', 'color: Aqua', event)
    // editing = false
    // await filterClick(event)
    row = event.target.closest('tr')
}

/**
 * Drag Over Event Callback
 * @function dragOver
 * @param {MouseEvent} event
 */
function dragOver(event) {
    // console.debug('dragOver:', event)
    // if (event.target.tagName === 'INPUT') {
    //     return
    // }
    event.preventDefault()
    if (!row) {
        return // row not set on dragStart, so not a row being dragged
    }
    const tr = event.target.closest('tr')
    // console.debug('tr:', tr)
    if (tr?.id && tr.id !== last) {
        const el = document.getElementById(last)
        el?.classList.remove('table-group-divider')
        tr.classList.add('table-group-divider')
        last = tr.id
    }
}

function dragEnd() {
    // console.debug('dragEnd:', event)
    const el = document.getElementById(last)
    el?.classList.remove('table-group-divider')
    last = -1
}

async function drop(event) {
    console.debug('%cdrop:', 'color: Lime', event)
    // if (event.target.tagName === 'INPUT') {
    //     return
    // }
    event.preventDefault()
    const tr = event.target.closest('tr')
    if (!row || !tr) {
        row = null
        return console.debug('%crow or tr undefined', 'color: Yellow')
    }
    tr.classList?.remove('table-group-divider')
    last = -1
    // console.debug(`row.id: ${row.id} - tr.id: ${tr.id}`)
    if (row.id === tr.id) {
        row = null
        return console.debug('%creturn on same row drop', 'color: Yellow')
    }
    filtersTbody.removeChild(row)
    filtersTbody.insertBefore(row, tr)
    const { bookmarks } = await chrome.storage.sync.get(['bookmarks'])
    // console.debug('patterns:', patterns)
    let source = parseInt(row.id)
    let target = parseInt(tr.id)
    if (source < target) {
        target -= 1
    }
    // console.debug(`Source: ${source} - Target: ${target}`)
    array_move(bookmarks, source, target)
    // console.debug('patterns:', patterns)
    await chrome.storage.sync.set({ bookmarks })
    row = null
}

/**
 * Note: Copied from Stack Overflow
 * @param {Array} arr
 * @param {Number} old_index
 * @param {Number} new_index
 */
function array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        let k = new_index - arr.length + 1
        while (k--) {
            arr.push(undefined)
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0])
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
    // noinspection JSUnresolvedReference
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
        const result = JSON.parse(fileReader.result.toString()) // NOSONAR
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
 * Reset Title Input Callback
 * @function resetInput
 * @param {InputEvent} event
 */
async function resetInput(event) {
    console.debug('resetInput:', event)
    const target = event.currentTarget
    console.debug('target:', target)
    event.preventDefault()
    const input = document.getElementById(target.dataset.resetInput)
    console.debug('input:', input)
    input.value = target.dataset.value
    input.classList.remove('is-invalid')
    input.focus()
    const changeEvent = new Event('change')
    input.dispatchEvent(changeEvent)
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
