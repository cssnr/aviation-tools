// JS for options.html

import { showToast, updateOptions } from './exports.js'

chrome.storage.onChanged.addListener(onChanged)

document.addEventListener('DOMContentLoaded', initOptions)
document.getElementById('add-bookmark').addEventListener('click', addBookmark)
document
    .querySelectorAll('#options-form input,select')
    .forEach((el) => el.addEventListener('change', saveOptions))

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

    console.log(bookmarks)
    if (bookmarks?.length) {
        bookmarks.forEach(function (value, i) {
            createBookmarkInput(i.toString(), value)
        })
    } else {
        createBookmarkInput('0', '')
    }

    const commands = await chrome.commands.getAll()
    document.getElementById('mainKey').textContent =
        commands.find((x) => x.name === '_execute_action').shortcut || 'Not Set'
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
        if (namespace === 'sync' && key === 'options') {
            console.debug('newValue:', newValue)
            updateOptions(newValue)
        }
    }
}

/**
 * Save Options Callback
 * @function saveOptions
 * @param {InputEvent} event
 */
export async function saveOptions(event) {
    console.debug('saveOptions:', event)
    const { options } = await chrome.storage.sync.get(['options'])
    let key = event.target.id
    let value
    if (event.target.type === 'radio') {
        key = event.target.name
        const radios = document.getElementsByName(key)
        for (const input of radios) {
            if (input.checked) {
                value = input.id
                break
            }
        }
    } else if (event.target.type === 'checkbox') {
        value = event.target.checked
    } else if (event.target.type === 'number') {
        value = event.target.value.toString()
    } else {
        value = event.target.value?.trim()
    }
    if (value === undefined) {
        return console.warn('No Value for key:', key)
    }
    // Handle Object Subkeys
    if (key.includes('-')) {
        const subkey = key.split('-')[1]
        key = key.split('-')[0]
        console.info(`Set: ${key}: ${subkey}:`, value)
        options[key][subkey] = value
    } else {
        console.info(`Set: ${key}:`, value)
        options[key] = value
    }
    await chrome.storage.sync.set({ options })
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

/**
 * Add Form Input for a Filter
 * @function createBookmarkInput
 * @param {String} number
 * @param {String} value
 */
function createBookmarkInput(number, value = '') {
    const el = document.getElementById('bookmarks')
    const input = document.createElement('input')
    input.id = `bookmark-${number}`
    input.value = value
    input.classList.add('form-control', 'mb-0', 'bookmark-link')
    const a = document.createElement('a')
    a.textContent = 'Remove'
    a.href = '#'
    a.dataset.id = number
    a.classList.add('small')
    a.addEventListener('click', deleteBookmark)

    el.appendChild(a)
    el.appendChild(input)
}

/**
 * Add Bookmark Click Callback
 * @function addBookmark
 * @param {MouseEvent} event
 */
function addBookmark(event) {
    console.log('addBookmark:', event)
    event.preventDefault()
    const el = document.getElementById('bookmarks')
    const next = (parseInt(el.lastChild.dataset.id) + 1).toString()
    createBookmarkInput(next)
}

/**
 * Delete Filter Click Callback
 * @function deleteBookmark
 * @param {MouseEvent} event
 */
function deleteBookmark(event) {
    console.log('deleteBookmark: event, this:', event, this)
    event.preventDefault()
    const inputs = document.querySelectorAll('#bookmarks input').length
    // const inputs = document
    //     .getElementById('bookmarks')
    //     .getElementsByTagName('input').length
    console.log(`inputs: ${inputs}`)
    if (inputs > 1) {
        const input = document.getElementById(`bookmark-${this.dataset.id}`)
        this.parentNode.removeChild(input)
        this.parentNode.removeChild(this)
    }
}
