// JS Exported Functions

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
 * WARNING: DUPLICATED CODE BLOCK from popup.js
 * @function openOptionsFor
 * @param {String} category - registration, flight, airport
 * @param {String} searchTerm
 */
export async function openOptionsFor(category, searchTerm) {
    const { options } = await chrome.storage.sync.get(['options'])
    for (const [key, value] of Object.entries(options[category])) {
        console.log(`${key}: ${value}`)
        if (value) {
            const url = getLinkUrl(category, key, searchTerm)
            console.log(`url: ${url}`)
            await chrome.tabs.create({ active: true, url })
        }
    }
}

/**
 * Open Options for Category
 * WARNING: DUPLICATED CODE BLOCK from popup.js
 * @function getLinkUrl
 * @param {string} subkey
 * @param {string} key
 * @param {string} value
 * @return {string}
 */
export function getLinkUrl(subkey, key, value) {
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
