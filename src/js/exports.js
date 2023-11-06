// JS Exported Functions

export const links = {
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
        flightaware: 'https://flightaware.com/resources/airport/',
        flightradar: 'https://www.flightradar24.com/data/airports/',
        airnav: 'https://www.airnav.com/airport/',
        liveatc: 'https://www.liveatc.net/search/?icao=',
    },
}

/**
 * Create Context Menus
 * @function createContextMenus
 */
export async function createContextMenus() {
    const contexts = [
        // [['link'], 'link', 'Link Menu'],
        [['selection'], 'registration', 'Registration Search'],
        [['selection'], 'flight', 'Flight # Search'],
        [['selection'], 'airport', 'Airport Search'],
        // [['audio'], 'audio', 'Audio Menu'],
        // [['image'], 'image', 'Image Menu'],
        // [['video'], 'video', 'Video Menu'],
        [['selection'], 'separator', 'separator-1'],
        [['page', 'link', 'image', 'selection'], 'options', 'Open Options'],
    ]
    for (const context of contexts) {
        if (context[1] === 'separator') {
            chrome.contextMenus.create({
                type: context[1],
                contexts: context[0],
                id: context[2],
            })
        } else {
            chrome.contextMenus.create({
                title: context[2],
                contexts: context[0],
                id: context[1],
            })
        }
    }
}

/**
 * Show Bootstrap Toast
 * Requires: jQuery
 * @function showToast
 * @param {String} message
 * @param {String} bsClass
 */
export function showToast(message, bsClass = 'success') {
    // TODO: Remove jQuery Dependency
    const toastEl = $(
        '<div class="toast align-items-center border-0 my-3" role="alert" aria-live="assertive" aria-atomic="true">\n' +
            '    <div class="d-flex">\n' +
            '        <div class="toast-body">Options Saved</div>\n' +
            '        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>\n' +
            '    </div>\n' +
            '</div>'
    )
    toastEl.find('.toast-body').text(message)
    toastEl.addClass('text-bg-' + bsClass)
    $('#toast-container').append(toastEl)
    const toast = new bootstrap.Toast(toastEl)
    toast.show()
}

/**
 * Open Options for Category
 * @function openOptionsFor
 * @param {String} category - registration, flight, airport
 * @param {String} searchTerm
 * @return {String}
 */
export async function openOptionsFor(category, searchTerm) {
    searchTerm = searchTerm.trim()
    if (category === 'flight') {
        searchTerm = searchTerm.toLowerCase().replace(/[\s-]+/g, '')
    } else if (category === 'registration') {
        searchTerm = searchTerm.toUpperCase()
    }
    let resp = null
    const { options } = await chrome.storage.sync.get(['options'])
    if (!options) {
        return null
    }
    for (const [key, value] of Object.entries(options[category])) {
        console.log(`${key}: ${value}`)
        if (value) {
            const url = getLinkUrl(category, key, searchTerm)
            console.log(`url: ${url}`)
            await chrome.tabs.create({ active: true, url })
            resp = searchTerm
        }
    }
    return resp
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
    const link = links[subkey][key] + value.trim()
    console.log(`link: ${link}`)
    return link
}

/**
 * Write value to Clipboard for Firefox and Chrome
 * @function clipboardWrite
 * @param {string} value
 */
export async function clipboardWrite(value) {
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
            type: 'copy-data-to-clipboard',
            target: 'offscreen-doc',
            data: value,
        })
    }
}
