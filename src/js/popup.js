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

    searchTerm.placeholder = options.searchType
    document.querySelector(
        `input[name="searchType"][value="${options.searchType}"]`
    ).checked = true

    console.debug('searchLinks:', searchLinks)
    for (const [key, value] of Object.entries(searchLinks)) {
        // console.debug(`${key}: ${value}`)
        const ul = document.getElementById(key)
        if (!ul) {
            console.debug('skipping:', key)
            continue
        }
        for (const [name, url] of Object.entries(value)) {
            // console.debug(`${name}: ${url}`)
            createSearchLink(ul, url, name)
        }
    }

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
    const href = anchor.getAttribute('href').replace(/^\.+/g, '')
    console.debug('href:', href)
    let url
    if (href.endsWith('html/options.html')) {
        chrome.runtime.openOptionsPage()
        return window.close()
    } else if (href.startsWith('http')) {
        url = href
    } else {
        url = chrome.runtime.getURL(href)
    }
    console.log('url:', url)
    await chrome.tabs.create({ active: true, url })
    window.close()
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
