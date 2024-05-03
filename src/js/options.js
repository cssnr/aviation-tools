// JS for options.html

import { showToast, saveOptions, updateOptions } from './exports.js'

chrome.storage.onChanged.addListener(onChanged)

document.addEventListener('DOMContentLoaded', initOptions)
document
    .querySelectorAll('#options-form input,select')
    .forEach((el) => el.addEventListener('change', saveOptions))

document
    .getElementById('bookmarks-form')
    .addEventListener('submit', addBookmark)
document
    .getElementById('export-bookmarks')
    .addEventListener('click', exportBookmarks)
document
    .getElementById('import-bookmarks')
    .addEventListener('click', importBookmarks)

const bookmarksTable = document.getElementById('bookmarks-table')
const bookmarksInput = document.getElementById('bookmarks-input')

bookmarksInput.addEventListener('change', inputBookmarks)

/**
 * Options Page Init
 * @function initOptions
 */
async function initOptions() {
    console.log('initOptions')

    const manifest = chrome.runtime.getManifest()
    document.querySelector('.version').textContent = manifest.version
    document.querySelector('[href="homepage_url"]').href = manifest.homepage_url

    const { options, bookmarks } = await chrome.storage.sync.get([
        'options',
        'bookmarks',
    ])
    console.log(options)
    updateOptions(options)
    updateBookmarks(bookmarks)

    await setShortcuts({
        mainKey: '_execute_action',
    })
}

/**
 * Update Filters Table
 * @function updateBookmarks
 * @param {Array} data
 */
function updateBookmarks(data) {
    console.debug('updateBookmarks:', data)
    const tbody = bookmarksTable.querySelector('tbody')
    tbody.innerHTML = ''
    const trashCan = document.querySelector('.fa-regular.fa-trash-can')
    data.forEach((value) => {
        const row = tbody.insertRow()
        const button = document.createElement('a')
        const svg = trashCan.cloneNode(true)
        button.appendChild(svg)
        button.title = 'Delete'
        button.dataset.value = value
        button.classList.add('link-danger')
        button.setAttribute('role', 'button')
        button.addEventListener('click', deleteBookmark)
        const cell1 = row.insertCell()
        cell1.classList.add('text-center', 'align-middle')
        // cell1.dataset.idx = i.toString()
        cell1.appendChild(button)

        const link = document.createElement('a')
        // link.dataset.idx = idx
        link.text = value
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
        cell2.setAttribute('role', 'button')
        cell2.appendChild(link)
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
    console.debug('inputBookmarks:', event, bookmarksInput)
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
    for (const [key, { newValue }] of Object.entries(changes)) {
        if (namespace === 'sync') {
            if (key === 'options') {
                updateOptions(newValue)
            } else if (key === 'bookmarks') {
                updateBookmarks(newValue)
            }
        }
    }
}

/**
 * Set Keyboard Shortcuts
 * @function setShortcuts
 * @param {Object} mapping { elementID: name }
 */
async function setShortcuts(mapping) {
    const commands = await chrome.commands.getAll()
    for (const [elementID, name] of Object.entries(mapping)) {
        // console.debug(`${elementID}: ${name}`)
        const command = commands.find((x) => x.name === name)
        if (command?.shortcut) {
            // console.debug(`${elementID}: ${command.shortcut}`)
            const el = document.getElementById(elementID)
            if (el) {
                el.textContent = command.shortcut
            }
        }
    }
}

// /**
//  * @function saveOptions
//  * @param {MouseEvent} event
//  */
// async function saveOptions(event) {
//     console.log('oldSaveOptions:', event)
//     event.preventDefault()
//     const { options } = await chrome.storage.sync.get(['options'])
//     let bookmarks = []
//
//     Array.from(event.target.elements).forEach((input) => {
//         if (input.type === 'checkbox') {
//             const subkey = input.id.split('-')[0]
//             const key = input.id.split('-')[1]
//             // console.log(`${subkey}: ${key}: ${input.checked}`)
//             if (options[subkey] === undefined) {
//                 options[subkey] = {}
//             }
//             options[subkey][key] = input.checked
//         }
//
//         if (input.classList.contains('bookmark-link') && input.value) {
//             bookmarks.push(input.value)
//         }
//     })
//     console.log(bookmarks)
//
//     options.contextMenu = document.getElementById('contextMenu').checked
//     options.showUpdate = document.getElementById('showUpdate').checked
//     // if (options.contextMenu) {
//     //     chrome.contextMenus.removeAll()
//     //     createContextMenus()
//     // } else {
//     //     chrome.contextMenus.removeAll()
//     // }
//     console.log(options)
//
//     await chrome.storage.sync.set({ options, bookmarks })
//     showToast('Options Saved')
// }

// /**
//  * Add Form Input for a Filter
//  * @function createBookmarkInput
//  * @param {String} number
//  * @param {String} value
//  */
// function createBookmarkInput(number, value = '') {
//     const el = document.getElementById('bookmarks')
//     const input = document.createElement('input')
//     input.id = `bookmark-${number}`
//     input.value = value
//     input.classList.add('form-control', 'mb-0', 'bookmark-link')
//     const a = document.createElement('a')
//     a.textContent = 'Remove'
//     a.href = '#'
//     a.dataset.id = number
//     a.classList.add('small')
//     a.addEventListener('click', deleteBookmark)
//
//     el.appendChild(a)
//     el.appendChild(input)
// }
//
// /**
//  * Add Bookmark Click Callback
//  * @function addBookmark
//  * @param {MouseEvent} event
//  */
// function addBookmark(event) {
//     console.log('addBookmark:', event)
//     event.preventDefault()
//     const el = document.getElementById('bookmarks')
//     const next = (parseInt(el.lastChild.dataset.id) + 1).toString()
//     createBookmarkInput(next)
// }
//
// /**
//  * Delete Filter Click Callback
//  * @function deleteBookmark
//  * @param {MouseEvent} event
//  */
// function deleteBookmark(event) {
//     console.log('deleteBookmark: event, this:', event, this)
//     event.preventDefault()
//     const inputs = document.querySelectorAll('#bookmarks input').length
//     // const inputs = document
//     //     .getElementById('bookmarks')
//     //     .getElementsByTagName('input').length
//     console.log(`inputs: ${inputs}`)
//     if (inputs > 1) {
//         const input = document.getElementById(`bookmark-${this.dataset.id}`)
//         this.parentNode.removeChild(input)
//         this.parentNode.removeChild(this)
//     }
// }
