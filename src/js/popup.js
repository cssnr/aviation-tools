// JS for popup.html

import {
    searchLinks,
    getLinkUrl,
    openAllBookmarks,
    openOptionsFor,
    saveOptions,
    updateOptions,
} from './exports.js'

document.addEventListener('DOMContentLoaded', initPopup)
document
    .querySelectorAll('a[href]')
    .forEach((el) => el.addEventListener('click', popupLinks))
document
    .querySelectorAll('#options-form input,select')
    .forEach((el) => el.addEventListener('change', saveOptions))
document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el))
document
    .getElementsByName('searchType')
    .forEach((el) => el.addEventListener('change', updateSearchType))
document
    .getElementById('all-bookmarks')
    .addEventListener('click', openAllBookmarks)

const searchForm = document.getElementById('search-form')
const searchTerm = document.getElementById('searchTerm')

searchForm.addEventListener('submit', searchFormSubmit)

/**
 * Initialize Popup
 * @function initPopup
 */
async function initPopup() {
    console.debug('initPopup')
    const manifest = chrome.runtime.getManifest()
    document.querySelector('.version').textContent = manifest.version
    document.querySelector('[href="homepage_url"]').href = manifest.homepage_url

    const { options, bookmarks } = await chrome.storage.sync.get([
        'options',
        'bookmarks',
    ])
    console.debug('options, bookmarks:', options, bookmarks)
    updateOptions(options)

    console.debug(`options.searchType:`, options.searchType)
    searchTerm.placeholder = options.searchType
    document.querySelector(
        `input[name="searchType"][value="${options.searchType}"]`
    ).checked = true

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

    searchTerm.focus()
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
    ul.appendChild(li)
    const a = document.createElement('a')
    a.textContent = url.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')
    a.href = url
    a.title = url
    a.classList.add('dropdown-item', 'small')
    a.addEventListener('click', popupLinks)
    li.appendChild(a)
}

/**
 * Popup Links Click Callback
 * Firefox requires a call to window.close()
 * @function popupLinks
 * @param {MouseEvent} event
 */
async function popupLinks(event) {
    console.debug('popupLinks:', event)
    event.preventDefault()
    const anchor = event.target.closest('a')
    console.debug(`anchor.href: ${anchor.href}`, anchor)
    let url
    if (anchor.href.endsWith('html/options.html')) {
        chrome.runtime.openOptionsPage()
        return window.close()
    } else if (
        anchor.href.startsWith('http') ||
        anchor.href.startsWith('chrome-extension')
    ) {
        // console.debug(`http or chrome-extension`)
        url = anchor.href
    } else {
        // console.debug(`else chrome.runtime.getURL`)
        url = chrome.runtime.getURL(anchor.href)
    }
    console.log('url:', url)
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
    // const searchTerm = document.getElementById('searchTerm')
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
