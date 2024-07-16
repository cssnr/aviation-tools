// JS for options.html

import {
    showToast,
    saveOptions,
    updateManifest,
    updateOptions,
} from './exports.js'

chrome.storage.onChanged.addListener(onChanged)
document.addEventListener('DOMContentLoaded', initOptions)
document.getElementById('copy-support').addEventListener('click', copySupport)
document
    .getElementById('reset-background')
    .addEventListener('click', resetBackground)
document
    .querySelectorAll('.options-form input,select')
    .forEach((el) => el.addEventListener('change', saveOptions))
document
    .querySelectorAll('.options-form')
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
    console.log('initOptions')

    updateManifest()
    await setShortcuts()

    const { options, bookmarks } = await chrome.storage.sync.get([
        'options',
        'bookmarks',
    ])
    // console.debug('options, bookmarks:', options, bookmarks)
    updateOptions(options)
    setBackground(options)
    updateBookmarks(bookmarks)
}

/**
 * Update Filters Table
 * @function updateBookmarks
 * @param {Array} data
 */
function updateBookmarks(data) {
    console.debug('updateBookmarks:', data)
    const tbody = document
        .getElementById('bookmarks-table')
        .querySelector('tbody')
    tbody.innerHTML = ''
    const trashCan = document.querySelector('.fa-regular.fa-trash-can')
    data.forEach((value) => {
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
        const text = value
            .replace(/(^\w+:|^)\/\//, '')
            .replace(/\/$/, '')
            .substring(0, 50)
        link.textContent = text
        link.title = value
        link.classList.add(
            'link-body-emphasis',
            'link-underline',
            'link-underline-opacity-0'
        )
        link.target = '_blank'
        link.href = value
        link.setAttribute('role', 'button')

        const cell2 = row.insertCell()
        // cell2.id = `td-${i}`
        // cell2.dataset.idx = i.toString()
        cell2.classList.add('text-break')
        // cell2.setAttribute('role', 'button')
        cell2.appendChild(link)
    })
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
 * Add Bookmark Submit Callback
 * @function addBookmark
 * @param {SubmitEvent} event
 */
async function addBookmark(event) {
    console.debug('addBookmark:', event)
    event.preventDefault()
    const input = document.getElementById('add-bookmark')
    const value = event.target[0].value
    console.log('value:', value)
    let url
    try {
        url = new URL(value)
    } catch (e) {
        console.debug(e)
        showToast('You must provide a valid URL.', 'danger')
        input.focus()
        return
    }
    const { bookmarks } = await chrome.storage.sync.get(['bookmarks'])
    if (!bookmarks.includes(url.href)) {
        bookmarks.push(url.href)
        console.debug('bookmarks:', bookmarks)
        await chrome.storage.sync.set({ bookmarks })
        updateBookmarks(bookmarks)
        showToast(`Added Bookmark.`, 'success')
    } else {
        showToast(`Bookmark Already Added.`, 'warning')
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
 */
async function setShortcuts(selector = '#keyboard-shortcuts') {
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
 * Copy Support/Debugging Information
 * @function copySupport
 * @param {MouseEvent} event
 */
async function copySupport(event) {
    console.debug('copySupport:', event)
    event.preventDefault()
    const manifest = chrome.runtime.getManifest()
    const { options } = await chrome.storage.sync.get(['options'])
    const result = [
        `${manifest.name} - ${manifest.version}`,
        navigator.userAgent,
        `options: ${JSON.stringify(options)}`,
    ]
    await navigator.clipboard.writeText(result.join('\n'))
    showToast('Support Information Copied.')
}
