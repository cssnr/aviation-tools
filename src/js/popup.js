// JS for popup.html

import { links, getLinkUrl, openOptionsFor } from './exports.js'

document.addEventListener('DOMContentLoaded', initPopup)

const popupLinks = document.querySelectorAll('[data-href]')
popupLinks.forEach((el) => el.addEventListener('click', popLinks))

const searchTypes = document.getElementsByName('searchType')
searchTypes.forEach((el) => el.addEventListener('change', updateSearchType))

document
    .getElementById('all-bookmarks')
    .addEventListener('click', openAllBookmarks)

document.getElementById('search-form').addEventListener('submit', searchForm)
document.getElementById('search-term').focus()

/**
 * Initialize Popup
 * @function initPopup
 */
async function initPopup() {
    console.log('initPopup')
    // await chrome.storage.sync.clear()
    jQuery('html').hide().fadeIn('slow')
    const { popup, bookmarks } = await chrome.storage.sync.get([
        'popup',
        'bookmarks',
    ])
    console.log(popup)
    const radio = document.getElementById(
        popup?.searchType || 'searchRegistration'
    )
    console.log(`popup.searchType: ${popup?.searchType}`)
    radio.checked = true

    console.log(links)
    for (const [key, value] of Object.entries(links)) {
        // console.log(`${key}: ${value}`)
        const ul = document.getElementById(key)
        for (const [name, url] of Object.entries(value)) {
            // console.log(`${name}: ${url}`)
            createSearchLink(ul, url, name)
        }
    }

    console.log(bookmarks)
    if (bookmarks?.length) {
        document.getElementById('no-bookmarks').remove()
        const ul = document.getElementById('bookmarks')
        bookmarks.forEach(function (value) {
            createBookmarkLink(ul, value)
        })
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
    a.addEventListener('click', popLinks)
    li.appendChild(a)
}

/**
 * Popup Links Callback
 * because firefox needs us to call window.close() from the popup
 * @function popLinks
 * @param {MouseEvent} event
 */
async function popLinks(event) {
    console.log('popLinks:', event)
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
    console.log('url:', url)
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
    console.log('defaultSearchChange')
    console.log(event)
    // let { popup } = await chrome.storage.sync.get(['popup'])
    const popup = {}
    popup.searchType = event.target.id
    console.log(`${popup.searchType}: ${event.target.id}`)
    await chrome.storage.sync.set({ popup })
    await searchForm(event)
}

/**
 * Search Form Submit Callback
 * @function saveOptions
 * @param {SubmitEvent} event
 */
async function searchForm(event) {
    event.preventDefault()
    console.log('searchForm:', event)
    console.log('event.submitter:', event.submitter)
    const searchTerm = document.getElementById('search-term')
    console.log(`searchTerm.value: ${searchTerm.value}`)
    const { options } = await chrome.storage.sync.get(['options'])
    console.log(options)
    if (!options) {
        console.log('no options')
        return chrome.runtime.openOptionsPage()
    }
    let search
    if (event.target.classList.contains('dropdown-item')) {
        let category = event.target.parentNode.parentNode.id
        console.log(`category: ${category}`)
        let key = event.target.textContent
        console.log(`key: ${key}`)
        const url = getLinkUrl(category, key, searchTerm.value)
        console.log(`url: ${url}`)
        await chrome.tabs.create({ active: true, url })
        return
    } else if (event.submitter?.dataset?.search) {
        search = event.submitter.dataset.search
    } else {
        search = document.querySelector(
            'input[name="searchType"]:checked'
        ).value
    }
    console.log(`search: ${search}`)
    console.log(options[search])
    if (!searchTerm.value) {
        console.log('no searchTerm.value')
        searchTerm.focus()
        return
    }
    const resp = await openOptionsFor(search, searchTerm.value)
    console.log(`resp: ${resp}`)
    if (!resp) {
        console.log(`no options set for: ${search}`)
        chrome.runtime.openOptionsPage()
    }
    window.close()
}

/**
 * Open All Bookmarks Callback
 * @function openAllBookmarks
 */
async function openAllBookmarks() {
    console.log('openAllBookmarks')
    const { bookmarks } = await chrome.storage.sync.get(['bookmarks'])
    console.log(bookmarks)
    if (!bookmarks?.length) {
        chrome.runtime.openOptionsPage()
    }
    for (const url of bookmarks) {
        console.log(`url: ${url}`)
        await chrome.tabs.create({ active: true, url })
    }
    window.close()
}
