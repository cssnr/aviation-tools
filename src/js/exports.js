// JS Exported Functions

export const githubURL = 'https://github.com/cssnr/aviation-tools'

export const searchLinks = {
    registration: {
        flightaware: 'https://flightaware.com/resources/registration/',
        flightradar: 'https://www.flightradar24.com/data/aircraft/',
        adsbx: 'https://globe.adsbexchange.com/?reg=',
        avherald:
            'https://avherald.com/h?opt=0&dosearch=1&search.x=0&search.y=0&search_term=',
        asn: 'https://aviation-safety.net/wikibase/dblist2.php?re=',
        airfleets: 'https://www.airfleets.net/recherche/?key=',
        jetphotos: 'https://www.jetphotos.com/registration/',
    },
    flight: {
        flightaware: 'https://flightaware.com/live/flight/',
        flightradar: 'https://www.flightradar24.com/data/flights/',
    },
    airport: {
        flightaware: 'https://flightaware.com/resources/airport/',
        flightradar: 'https://www.flightradar24.com/data/airports/',
        airnav: 'https://www.airnav.com/airport/',
        liveatc: 'https://www.liveatc.net/search/?icao=',
    },
    tools: {
        weather: 'https://aviationweather.gov/',
        wind: 'https://e6bx.com/density-altitude/',
        density: 'https://e6bx.com/density-altitude/',
        flightplan: 'https://skyvector.com/',
        modes: 'https://www.avionictools.com/icao.php',
        adsb: 'https://globe.adsbexchange.com/',
    },
}

/**
 * Open Options for Category
 * @function openOptionsFor
 * @param {String} category - registration, flight, airport
 * @param {String} searchTerm
 * @return {Promise<*|String>}
 */
export async function openOptionsFor(category, searchTerm) {
    console.debug('openOptionsFor:', category, searchTerm)
    searchTerm = searchTerm.trim()
    if (category === 'flight') {
        searchTerm = searchTerm.toLowerCase().replace(/[\s-]+/g, '')
    } else if (category === 'registration') {
        searchTerm = searchTerm.toUpperCase()
    }
    const { options } = await chrome.storage.sync.get(['options'])
    let count = 0
    for (const [key, value] of Object.entries(options[category])) {
        // console.log(`${key}: ${value}`)
        if (value) {
            count += 1
            const url = getLinkUrl(category, key, searchTerm)
            console.log(`url: ${url}`)
            await chrome.tabs.create({ active: true, url })
        }
    }
    if (!count) {
        chrome.runtime.openOptionsPage()
    }
    return searchTerm
}

/**
 * Open Options for Category
 * @function getLinkUrl
 * @param {string} subkey
 * @param {string} key
 * @param {string} value
 * @return {string}
 */
export function getLinkUrl(subkey, key, value) {
    // if (subkey === 'flight') {
    //     value = value.toLowerCase().replace(/[\s-]+/g, '')
    // }
    console.log(`${subkey}: ${key}: ${value}`)
    const link = searchLinks[subkey][key] + value.trim()
    console.log(`link: ${link}`)
    return link
}

/**
 * Open All Bookmarks Callback
 * @function openAllBookmarks
 */
export async function openAllBookmarks() {
    console.debug('openAllBookmarks')
    const { bookmarks } = await chrome.storage.sync.get(['bookmarks'])
    console.debug(bookmarks)
    if (!bookmarks?.length) {
        chrome.runtime.openOptionsPage()
    }
    for (const url of bookmarks) {
        try {
            console.debug(`url: ${url}`)
            chrome.tabs.create({ active: true, url }).then()
        } catch (e) {
            console.error(e)
        }
    }
    window.close()
}

/**
 * Save Options Callback
 * @function saveOptions
 * @param {UIEvent} event
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
    } else if (key === 'reset-background') {
        key = 'pictureURL'
        value = 'https://images.cssnr.com/aviation'
    } else if (event.target.type === 'checkbox') {
        value = event.target.checked
        // } else if (event.target.type === 'number') {
        //     value = event.target.value.toString()
    } else {
        value = event.target.value
    }

    // Handle Object Subkeys
    if (key.includes('-')) {
        const subkey = key.split('-')[1]
        key = key.split('-')[0]
        console.log(`%cSet: ${key}.${subkey}:`, 'color: DeepSkyBlue', value)
        options[key][subkey] = value
    } else if (value !== undefined) {
        console.log(`Set %c${key}:`, 'color: Khaki', value)
        options[key] = value
    } else {
        console.warn('No Value for key:', key)
    }
    await chrome.storage.sync.set({ options })
}

/**
 * Update Options based on type
 * @function initOptions
 * @param {Object} options
 */
export function updateOptions(options) {
    console.debug('updateOptions:', options)
    for (let [key, value] of Object.entries(options)) {
        if (typeof value === 'undefined') {
            console.warn('Value undefined for key:', key)
            continue
        }
        if (key.startsWith('radio')) {
            key = value // NOSONAR
            value = true // NOSONAR
        }
        console.debug(`${key}:`, value)
        const el = document.getElementById(key)
        // Handle Object Subkeys
        if (typeof value === 'object') {
            for (const [subkey, checked] of Object.entries(value)) {
                // console.debug(`subkey: ${subkey}:`, value)
                const subEl = document.getElementById(`${key}-${subkey}`)
                if (subEl) {
                    subEl.checked = checked
                }
            }
            continue
        }
        if (!el) {
            console.debug('element not found for key:', key)
            continue
        }
        if (!['INPUT', 'SELECT'].includes(el.tagName)) {
            el.textContent = value.toString()
        } else if (['checkbox', 'radio'].includes(el.type)) {
            el.checked = value
        } else {
            el.value = value
        }
        if (el.dataset.related) {
            hideShowElement(`#${el.dataset.related}`, value)
        }
    }
}

/**
 * Not Currently Used as there is no data-related elements
 * @function updateManifest
 */
function hideShowElement(selector, show, speed = 'fast') {
    const element = $(`${selector}`)
    // console.debug('hideShowElement:', show, element)
    if (show) {
        element.show(speed)
    } else {
        element.hide(speed)
    }
}

/**
 * Link Click Callback
 * Note: Firefox popup requires a call to window.close()
 * @function linkClick
 * @param {MouseEvent} event
 * @param {Boolean} [close]
 */
export async function linkClick(event, close = false) {
    console.debug('linkClick:', close, event)
    event.preventDefault()
    const href = event.currentTarget.getAttribute('href').replace(/^\.+/g, '')
    console.debug('href:', href)
    let url
    if (href.startsWith('#')) {
        console.debug('return on anchor link')
        return
    } else if (href.endsWith('html/options.html')) {
        chrome.runtime.openOptionsPage()
        if (close) window.close()
        return
    } else if (href.startsWith('http')) {
        url = href
    } else {
        url = chrome.runtime.getURL(href)
    }
    console.debug('url:', url)
    // await activateOrOpen(url)
    await chrome.tabs.create({ active: true, url })
    if (close) window.close()
}

/**
 * Update DOM with Manifest Details
 * @function updateManifest
 */
export async function updateManifest() {
    const manifest = chrome.runtime.getManifest()
    document.querySelectorAll('.version').forEach((el) => {
        el.textContent = manifest.version
    })
    document.querySelectorAll('[href="homepage_url"]').forEach((el) => {
        el.href = manifest.homepage_url
    })
    document.querySelectorAll('[href="version_url"]').forEach((el) => {
        el.href = `${githubURL}/releases/tag/${manifest.version}`
    })
}

/**
 * @function updateBrowser
 * @return {Promise<void>}
 */
export async function updateBrowser() {
    let selector = '.chrome'
    // noinspection JSUnresolvedReference
    if (typeof browser !== 'undefined') {
        selector = '.firefox'
    }
    document
        .querySelectorAll(selector)
        .forEach((el) => el.classList.remove('d-none'))
}

/**
 * Show Bootstrap Toast
 * @function showToast
 * @param {String} message
 * @param {String} type
 */
export function showToast(message, type = 'success') {
    console.debug(`showToast: ${type}: ${message}`)
    const clone = document.querySelector('.d-none .toast')
    const container = document.getElementById('toast-container')
    if (!clone || !container) {
        return console.warn('Missing clone or container:', clone, container)
    }
    const element = clone.cloneNode(true)
    element.querySelector('.toast-body').innerHTML = message
    element.classList.add(`text-bg-${type}`)
    container.appendChild(element)
    const toast = new bootstrap.Toast(element)
    element.addEventListener('mousemove', () => toast.hide())
    toast.show()
}

/**
 * Write value to Clipboard for Firefox and Chrome
 * @function clipboardWrite
 * @param {string} value
 */
export async function clipboardWrite(value) {
    console.debug('clipboardWrite:', value)
    if (navigator.clipboard) {
        // Firefox
        await navigator.clipboard.writeText(value)
    } else {
        // Chrome
        await chrome.offscreen.createDocument({
            url: 'html/offscreen.html',
            reasons: [chrome.offscreen.Reason.CLIPBOARD],
            justification: 'Write text to the clipboard.',
        })
        await chrome.runtime.sendMessage({
            type: 'clipboard',
            target: 'offscreen',
            data: value,
        })
    }
}
