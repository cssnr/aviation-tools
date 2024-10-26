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
    .getElementById('bookmark-current')
    .addEventListener('click', bookmarkToggle)
document
    .getElementById('all-bookmarks')
    .addEventListener('click', openAllBookmarks)
document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el))

const searchTerm = document.getElementById('searchTerm')
const bookmarkCurrent = document.getElementById('bookmark-current')

/**
 * Initialize Popup
 * @function initPopup
 */
async function initPopup() {
    console.debug('initPopup')
    searchTerm.focus()
    // noinspection ES6MissingAwait
    updateManifest()

    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true })
    // console.debug(`tab: ${tab.id}`, tab)
    console.debug('tab.url:', tab.url)

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
        updateBookmarks(items.bookmarks)
        if (items.bookmarks.includes(tab.url)) {
            bookmarkCurrent.classList.replace(
                bookmarkCurrent.dataset.disabled,
                bookmarkCurrent.dataset.enabled
            )
            bookmarkCurrent.textContent = 'Remove'
        }
    })

    console.debug('searchLinks:', searchLinks)
    for (const [key, value] of Object.entries(searchLinks)) {
        // console.debug(`${key}: ${value}`)
        const ul = document.getElementById(key)
        if (!ul) {
            // console.debug('skipping key:', key)
            continue
        }
        for (const [name, url] of Object.entries(value)) {
            // console.debug(`${name}: ${url}`)
            createSearchLink(ul, url, name)
        }
    }
}

function updateBookmarks(bookmarks) {
    console.debug('updateBookmarks:', bookmarks)
    const ul = document.getElementById('bookmarks')
    ul.innerHTML = ''
    if (bookmarks?.length) {
        bookmarks.forEach((value) => {
            createBookmarkLink(ul, value)
        })
    } else {
        const li = document.createElement('li')
        li.id = 'no-bookmarks'
        const a = document.createElement('a')
        a.classList.add('dropdown-item')
        a.href = '/html/options.html'
        a.textContent = 'No Saved Bookmarks'
        a.addEventListener('click', (e) => linkClick(e, true))
        li.appendChild(a)
        ul.appendChild(li)
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
    const a = document.createElement('a')
    a.textContent = url.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')
    // .substring(0, 60)
    a.href = url
    a.title = url
    a.classList.add('dropdown-item', 'small', 'text-ellipsis')
    a.addEventListener('click', (e) => linkClick(e, true))
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

/**
 * Toggle Current Site Bookmark Callback
 * @function bookmarkToggle
 * @param {UIEvent} event
 */
async function bookmarkToggle(event) {
    console.debug('bookmarkToggle:', event)
    const { bookmarks } = await chrome.storage.sync.get(['bookmarks'])
    console.debug('bookmarks:', bookmarks)
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true })
    // console.debug(`tab: ${tab.id}`, tab)
    console.debug('tab.url:', tab.url)
    if (!bookmarks.includes(tab.url)) {
        bookmarks.push(tab.url)
        bookmarkCurrent.classList.replace(
            event.target.dataset.disabled,
            event.target.dataset.enabled
        )
        bookmarkCurrent.textContent = 'Remove'
    } else {
        bookmarks.splice(bookmarks.indexOf(tab.url), 1)
        bookmarkCurrent.classList.replace(
            event.target.dataset.enabled,
            event.target.dataset.disabled
        )
        bookmarkCurrent.textContent = 'Add'
    }
    // console.debug('bookmarks:', bookmarks)
    updateBookmarks(bookmarks)
    await chrome.storage.sync.set({ bookmarks })
    // initPopup()
}
