// JS for popup.html

jQuery('html').hide().fadeIn('slow')

document.addEventListener('DOMContentLoaded', initPopup)

document.querySelectorAll('[data-href]').forEach((el) => {
    el.addEventListener('click', popupLink)
})

document.getElementsByName('searchType').forEach((el) => {
    el.addEventListener('change', saveSearchRadio)
})

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

    console.log(bookmarks)
    if (bookmarks?.length) {
        document.getElementById('no-bookmarks').remove()
        bookmarks.forEach(function (value, i) {
            createBookmarkLink(i.toString(), value)
        })
    }
}

/**
 * Add Bookmark Links
 * @function createBookmarkLink
 * @param {String} number
 * @param {String} value
 */
function createBookmarkLink(number, value = '') {
    const ul = document.getElementById('bookmarks')
    const li = document.createElement('li')
    ul.appendChild(li)
    const a = document.createElement('a')
    a.textContent = value.substring(8, 50)
    a.dataset.title = value
    a.dataset.href = value
    a.href = '#'
    a.classList.add('dropdown-item', 'small')
    a.addEventListener('click', popupLink)
    li.appendChild(a)
}

/**
 * Popup Links Callback
 * because firefox needs us to call window.close() from the popup
 * @function popupLink
 * @param {MouseEvent} event
 */
async function popupLink(event) {
    console.log(event)
    const url = chrome.runtime.getURL(event.target.dataset.href)
    console.log(`url: ${url}`)
    await chrome.tabs.create({ active: true, url })
    window.close()
}

/**
 * Save Default Radio on Change Callback
 * @function defaultSearchChange
 * @param {onchange} event
 */
async function saveSearchRadio(event) {
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
    console.log(event)
    const { options } = await chrome.storage.sync.get(['options'])
    console.log(options)
    let search
    if (event.submitter?.dataset?.search) {
        search = event.submitter.dataset.search
    } else {
        search = document.querySelector(
            'input[name="searchType"]:checked'
        ).value
    }
    console.log(`search: ${search}`)
    console.log(options[search])
    const searchTerm = document.getElementById('search-term')
    console.log(`searchTerm.value: ${searchTerm.value}`)
    if (!searchTerm.value) {
        searchTerm.focus()
        return
    }
    for (const [key, value] of Object.entries(options[search])) {
        console.log(`${key}: ${value}`)
        if (value) {
            const url = getLinkUrl(search, key, searchTerm.value)
            console.log(`url: ${url}`)
            await chrome.tabs.create({ active: true, url })
        }
    }
    window.close()
}

function getLinkUrl(subkey, key, value) {
    console.log(`${subkey}: ${key}: ${value}`)
    const links = {
        registration: {
            flightaware: 'https://flightaware.com/resources/registration/',
            flightradar: 'https://www.flightradar24.com/data/aircraft/',
            airfleets: 'https://www.airfleets.net/recherche/?key=',
            avherald:
                'https://avherald.com/h?opt=0&dosearch=1&search.x=0&search.y=0&search_term=',
            asn: 'https://aviation-safety.net/wikibase/dblist2.php?re=',
            jetphotos: 'https://www.jetphotos.com/registration/',
        },
        flight: {
            flightaware: 'https://flightaware.com/live/flight/',
            flightradar: 'https://www.flightradar24.com/data/flights/',
        },
        airport: {
            airnav: 'https://www.airnav.com/airport/',
            liveatc: 'https://www.liveatc.net/search/?icao=',
        },
    }
    const link = links[subkey][key] + value.trim()
    console.log(`link: ${link}`)
    return link
}

/**
 * Open All Bookmarks Callback
 * @function openAllBookmarks
 */
async function openAllBookmarks() {
    console.log('openAllBookmarks')
    const { bookmarks } = await chrome.storage.sync.get(['bookmarks'])
    console.log(bookmarks)
    // bookmarks.forEach(async function (url) {
    //     console.log(`url: ${url}`)
    //     await chrome.tabs.create({ active: true, url })
    // })
    if (!bookmarks?.length) {
        await chrome.tabs.create({
            active: true,
            url: chrome.runtime.getURL('html/options.html'),
        })
    }
    for (const url of bookmarks) {
        console.log(`url: ${url}`)
        await chrome.tabs.create({ active: true, url })
    }
    window.close()
}
