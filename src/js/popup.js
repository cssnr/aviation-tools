// JS for popup.html

import { searchLinks, getLinkUrl, openOptionsFor } from './exports.js'

document.addEventListener('DOMContentLoaded', initPopup)
document.getElementById('search-form').addEventListener('submit', searchForm)
document
    .querySelectorAll('[data-href]')
    .forEach((el) => el.addEventListener('click', popupLinks))
document
    .getElementsByName('searchType')
    .forEach((el) => el.addEventListener('change', updateSearchType))
document
    .getElementById('all-bookmarks')
    .addEventListener('click', openAllBookmarks)

/**
 * Initialize Popup
 * @function initPopup
 */
async function initPopup() {
    console.debug('initPopup')
    const manifest = chrome.runtime.getManifest()
    document.querySelector('.version').textContent = manifest.version
    document.querySelector('[href="homepage_url"]').href = manifest.homepage_url

    const { popup, bookmarks } = await chrome.storage.sync.get([
        'popup',
        'bookmarks',
    ])
    console.debug('popup, bookmarks:', popup, bookmarks)
    const radio = document.getElementById(
        popup?.searchType || 'searchRegistration'
    )
    // console.debug(`popup.searchType: ${popup?.searchType}`)
    radio.checked = true

    console.debug('searchLinks:', searchLinks)
    for (const [key, value] of Object.entries(searchLinks)) {
        // console.debug(`${key}: ${value}`)
        const ul = document.getElementById(key)
        for (const [name, url] of Object.entries(value)) {
            // console.debug(`${name}: ${url}`)
            createSearchLink(ul, url, name)
        }
    }

    console.debug('bookmarks:', bookmarks)
    if (bookmarks?.length) {
        document.getElementById('no-bookmarks').remove()
        const ul = document.getElementById('bookmarks')
        bookmarks.forEach(function (value) {
            createBookmarkLink(ul, value)
        })
    }

    document.getElementById('search-term').focus()
}

/**
 * Add Bookmark Links
 * @function createBookmarkLink
 * @param {HTMLElement} ul
 * @param {String} url
 * @param {String} name
 */
function createSearchLink(ul, url, name = null) {
    const li = document.createElement('li')
    ul.appendChild(li)
    const a = document.createElement('a')
    a.textContent = name || url.substring(8, 50)
    a.dataset.href = url
    a.title = url
    a.href = '#'
    a.classList.add('dropdown-item', 'small')
    a.addEventListener('click', searchForm)
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
    ul.appendChild(li)
    const a = document.createElement('a')
    a.textContent = url.substring(8, 50)
    a.dataset.href = url
    a.title = url
    a.href = '#'
    a.classList.add('dropdown-item', 'small')
    a.addEventListener('click', popupLinks)
    li.appendChild(a)
}

/**
 * Popup Links Callback
 * because firefox needs us to call window.close() from the popup
 * @function popupLinks
 * @param {MouseEvent} event
 */
async function popupLinks(event) {
    console.debug('popupLinks:', event)
    event.preventDefault()
    const anchor = event.target.closest('a')
    let url
    if (anchor?.dataset?.href.startsWith('http')) {
        url = anchor.dataset.href
    } else if (anchor?.dataset?.href === 'homepage') {
        url = chrome.runtime.getManifest().homepage_url
    } else if (anchor?.dataset?.href === 'options') {
        chrome.runtime.openOptionsPage()
        return window.close()
    } else if (anchor?.dataset?.href) {
        url = chrome.runtime.getURL(anchor.dataset.href)
    }
    console.debug('url:', url)
    if (!url) {
        return console.error('No dataset.href for anchor:', anchor)
    }
    await chrome.tabs.create({ active: true, url })
    return window.close()
}

/**
 * Save Search Type Radio on Change Callback
 * @function updateSearchType
 * @param {SubmitEvent} event
 */
async function updateSearchType(event) {
    console.debug('defaultSearchChange', event)
    // let { popup } = await chrome.storage.sync.get(['popup'])
    const popup = {}
    popup.searchType = event.target.id
    console.debug(`${popup.searchType}: ${event.target.id}`)
    await chrome.storage.sync.set({ popup })
    await searchForm(event)
}

/**
 * Search Form Submit Callback
 * @function saveOptions
 * @param {SubmitEvent} event
 */
async function searchForm(event) {
    console.debug('searchForm:', event)
    event.preventDefault()
    const searchTerm = document.getElementById('search-term')
    console.debug(`searchTerm.value: ${searchTerm.value}`)
    const { options } = await chrome.storage.sync.get(['options'])
    let search
    if (event.target.classList.contains('dropdown-item')) {
        let category = event.target.parentNode.parentNode.id
        console.debug(`category: ${category}`)
        let key = event.target.textContent
        console.debug(`key: ${key}`)
        const url = getLinkUrl(category, key, searchTerm.value)
        console.debug(`url: ${url}`)
        await chrome.tabs.create({ active: true, url })
        return
    } else if (event.submitter?.dataset?.search) {
        search = event.submitter.dataset.search
    } else {
        search = document.querySelector(
            'input[name="searchType"]:checked'
        ).value
    }
    console.debug(`search: ${search}`, options[search])
    if (!searchTerm.value) {
        console.debug('no searchTerm.value')
        searchTerm.focus()
        return
    }
    const resp = await openOptionsFor(search, searchTerm.value)
    console.debug(`resp: ${resp}`)
    if (!resp) {
        console.debug(`no options set for: ${search}`)
        chrome.runtime.openOptionsPage()
    }
    window.close()
}

/**
 * Open All Bookmarks Callback
 * @function openAllBookmarks
 */
async function openAllBookmarks() {
    console.debug('openAllBookmarks')
    const { bookmarks } = await chrome.storage.sync.get(['bookmarks'])
    console.debug(bookmarks)
    if (!bookmarks?.length) {
        chrome.runtime.openOptionsPage()
    }
    for (const url of bookmarks) {
        console.debug(`url: ${url}`)
        await chrome.tabs.create({ active: true, url })
    }
    window.close()
}
