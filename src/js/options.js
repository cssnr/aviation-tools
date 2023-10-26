// JS for options.html

document.addEventListener('DOMContentLoaded', initOptions)
document.getElementById('options-form').addEventListener('submit', saveOptions)
document.getElementById('add-bookmark').addEventListener('click', addBookmark)

/**
 * Options Page Init
 * @function initOptions
 */
async function initOptions() {
    console.log('initOptions')
    const { options, bookmarks } = await chrome.storage.sync.get([
        'options',
        'bookmarks',
    ])
    console.log(options)
    for (let subkey in options) {
        for (let key in options[subkey]) {
            console.log(`${subkey}: ${key}: ${options[subkey][key]}`)
            document.getElementById(`${subkey}-${key}`).checked =
                options[subkey][key]
        }
    }

    console.log(bookmarks)
    if (bookmarks?.length) {
        bookmarks.forEach(function (value, i) {
            createBookmarkInput(i.toString(), value)
        })
    } else {
        createBookmarkInput('0', '')
    }
}

/**
 * Save Options Click Callback
 * @function saveOptions
 * @param {MouseEvent} event
 */
async function saveOptions(event) {
    event.preventDefault()
    console.log('saveOptions')
    console.log(event)

    let options = {}
    let bookmarks = []
    Array.from(event.target.elements).forEach((input) => {
        if (input.type === 'checkbox') {
            const subkey = input.id.split('-')[0]
            const key = input.id.split('-')[1]
            // console.log(`${subkey}: ${key}: ${input.checked}`)
            if (options[subkey] === undefined) {
                options[subkey] = {}
            }
            options[subkey][key] = input.checked
        }

        if (input.classList.contains('bookmark-link') && input.value) {
            bookmarks.push(input.value)
        }
    })
    console.log(options)
    console.log(bookmarks)
    await chrome.storage.sync.set({ options, bookmarks })
    showToast('Options Saved')
}

/**
 * Add Form Input for a Filter
 * @function createBookmarkInput
 * @param {String} number
 * @param {String} value
 */
function createBookmarkInput(number, value = '') {
    const el = document.getElementById('bookmarks')
    const input = document.createElement('input')
    input.id = `bookmark-${number}`
    input.value = value
    input.classList.add('form-control', 'mb-0', 'bookmark-link')
    const a = document.createElement('a')
    a.textContent = 'Remove'
    a.href = '#'
    a.dataset.id = number
    a.classList.add('small')
    a.addEventListener('click', deleteBookmark)

    el.appendChild(a)
    el.appendChild(input)
}

/**
 * Add Bookmark Click Callback
 * @function addBookmark
 * @param {MouseEvent} event
 */
function addBookmark(event) {
    event.preventDefault()
    console.log(event)
    const el = document.getElementById('bookmarks')
    const next = (parseInt(el.lastChild.dataset.id) + 1).toString()
    createBookmarkInput(next)
}

/**
 * Delete Filter Click Callback
 * @function deleteBookmark
 * @param {MouseEvent} event
 */
function deleteBookmark(event) {
    event.preventDefault()
    console.log(event)
    const inputs = document
        .getElementById('bookmarks')
        .getElementsByTagName('input').length
    console.log(`inputs: ${inputs}`)
    if (inputs > 1) {
        const input = document.getElementById(`bookmark-${this.dataset.id}`)
        this.parentNode.removeChild(input)
        this.parentNode.removeChild(this)
    }
}
