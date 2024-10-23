// JS for popup.html

import {
    searchLinks,
    getLinkUrl,
    linkClick,
    openAllBookmarks,
    openOptionsFor,
    saveOptions,
    updateOptions,
    updateManifest,
} from './exports.js'

document.addEventListener('DOMContentLoaded', initPopup)
// noinspection JSCheckFunctionSignatures
document
    .querySelectorAll('a[href]')
    .forEach((el) => el.addEventListener('click', (e) => linkClick(e, true)))
document
    .querySelectorAll('form.options input,select')
    .forEach((el) => el.addEventListener('change', saveOptions))
document
    .getElementsByName('searchType')
    .forEach((el) => el.addEventListener('change', updateSearchType))
document
    .getElementById('search-form')
    .addEventListener('submit', searchFormSubmit)
document
    .getElementById('all-bookmarks')
    .addEventListener('click', openAllBookmarks)
document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el))

const searchTerm = document.getElementById('searchTerm')

/**
 * Initialize Popup
 * @function initPopup
 */
async function initPopup() {
    console.debug('initPopup')
    searchTerm.focus()
    // noinspection ES6MissingAwait
    updateManifest()

    chrome.storage.sync.get(['options']).then((items) => {
        console.debug('options:', items.options)
        updateOptions(items.options)
        searchTerm.placeholder = items.options.searchType
        document.querySelector(
            `input[name="searchType"][value="${items.options.searchType}"]`
        ).checked = true
    })

    chrome.storage.sync.get(['bookmarks']).then((items) => {
        console.debug('bookmarks:', items.bookmarks)
        if (items.bookmarks?.length) {
            document.getElementById('no-bookmarks').remove()
            const ul = document.getElementById('bookmarks')
            items.bookmarks.forEach(function (value) {
                createBookmarkLink(ul, value)
            })
        }
    })

    console.debug('searchLinks:', searchLinks)
    for (const [key, value] of Object.entries(searchLinks)) {
        // console.debug(`${key}: ${value}`)
        const ul = document.getElementById(key)
        if (!ul) {
            console.debug('skipping key:', key)
            continue
        }
        for (const [name, url] of Object.entries(value)) {
            // console.debug(`${name}: ${url}`)
            createSearchLink(ul, url, name)
        }
    }
}

/**
 * Add Bookmark Links
 * @function createBookmarkLink
 * @param {HTMLElement} ul
 * @param {String} url
 * @param {String} name
 */
function createSearchLink(ul, url, name = null) {
    // console.debug('createSearchLink:', url, name)
    const li = document.createElement('li')
    ul.appendChild(li)
    const a = document.createElement('a')
    a.textContent = name || url.substring(8, 50)
    a.dataset.href = url
    a.title = url
    a.href = '#'
    a.classList.add('dropdown-item', 'small')
    a.addEventListener('click', searchFormSubmit)
    li.appendChild(a)
}

/**
 * Add Bookmark Links
 * @function createBookmarkLink
 * @param {HTMLElement} ul
 * @param {String} url
 */
function createBookmarkLink(ul, url) {
    const li = document.createElement('li')
    // li.classList.add('text-ellipsis')
    ul.appendChild(li)
    // ul.classList.add('text-ellipsis')
    const a = document.createElement('a')
    a.textContent = url.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')
    a.href = url
    a.title = url
    a.classList.add('dropdown-item', 'small')
    a.addEventListener('click', linkClick)
    li.appendChild(a)
}

// /**
//  * Popup Links Click Callback
//  * Firefox requires a call to window.close()
//  * @function popupLinks
//  * @param {MouseEvent} event
//  */
// async function popupLinks(event) {
//     console.debug('popupLinks:', event)
//     event.preventDefault()
//     const anchor = event.target.closest('a')
//     const href = anchor.getAttribute('href').replace(/^\.+/g, '')
//     console.debug('href:', href)
//     let url
//     if (href.endsWith('html/options.html')) {
//         chrome.runtime.openOptionsPage()
//         return window.close()
//     } else if (href.startsWith('http')) {
//         url = href
//     } else {
//         url = chrome.runtime.getURL(href)
//     }
//     console.log('url:', url)
//     await chrome.tabs.create({ active: true, url })
//     window.close()
// }

/**
 * Save Search Type Radio on Change Callback
 * @function updateSearchType
 * @param {SubmitEvent} event
 */
async function updateSearchType(event) {
    console.debug('defaultSearchChange', event)
    let { options } = await chrome.storage.sync.get(['options'])
    options.searchType = event.target.value
    console.debug(`options.searchType: ${event.target.value}`)
    await chrome.storage.sync.set({ options })
    searchTerm.placeholder = options.searchType
    await searchFormSubmit(event)
}

/**
 * Search Form Submit Callback
 * @function searchFormSubmit
 * @param {SubmitEvent} event
 */
async function searchFormSubmit(event) {
    console.debug('searchFormSubmit:', event)
    event.preventDefault()
    const value = searchTerm.value.trim()
    if (!value) {
        console.debug('no searchTerm.value')
        return searchTerm.focus()
    }
    if (value.startsWith('METAR')) {
        const href = chrome.runtime.getURL('/html/metar.html')
        const url = new URL(href)
        url.searchParams.append('metar', value)
        await chrome.tabs.create({ active: true, url: url.href })
    } else if (event.target.classList.contains('dropdown-item')) {
        // noinspection JSUnresolvedReference
        let category = event.target.parentNode.parentNode.id
        let key = event.target.textContent
        const url = getLinkUrl(category, key, value)
        await chrome.tabs.create({ active: true, url })
    } else if (event.submitter?.dataset?.search) {
        const category = event.submitter.dataset.search
        await openOptionsFor(category, value)
    } else {
        const category = document.querySelector(
            'input[name="searchType"]:checked'
        ).value
        await openOptionsFor(category, value)
    }
    window.close()
}
