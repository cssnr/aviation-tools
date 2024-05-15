// JS for metar.html

// import { parseMetar } from '../dist/metar.js'

document.addEventListener('DOMContentLoaded', domContentLoaded)
// document
//     .querySelectorAll('[data-bs-toggle="tooltip"]')
//     .forEach((el) => new bootstrap.Tooltip(el))

const metarForm = document.getElementById('metar-form')
const metarInput = document.getElementById('metar-input')
const metarTable = document.getElementById('metar-table')

metarForm.addEventListener('submit', processMetar)
metarInput.addEventListener('input', processMetar)

document
    .getElementById('clear')
    .addEventListener('click', () => (metarInput.value = ''))

/**
 * DOMContentLoaded
 * @function domContentLoaded
 */
async function domContentLoaded() {
    console.debug('domContentLoaded')
    // const { options } = await chrome.storage.sync.get(['options'])
    // console.debug('options:', options)
    const searchParams = new URLSearchParams(window.location.search)
    const metar = searchParams.get('metar')
    console.debug('searchParams: metar:', metar)
    if (metar && !metarInput.value) {
        metarInput.value = metar
    }
    processMetar()
    metarInput.focus()
    metarInput.select()
}

function processMetar(event) {
    console.debug('processMetar:', event)
    event?.preventDefault()
    const metar = parseMetar(metarInput.value)
    console.log('metar:', metar)
    if (!metar || typeof metar !== 'object') {
        return console.info('no metar')
    }
    for (const [key, value] of Object.entries(metar)) {
        console.debug(`${key}:`, value)
        if (key === 'clouds') {
            const element = metarTable.querySelector('[data-type="clouds"]')
            element.innerHTML = ''
            for (const cloud of value) {
                const span = document.createElement('span')
                span.innerHTML = `<strong>${cloud.code}</strong> at <strong>${cloud.base}</strong>`
                element.appendChild(span)
                element.appendChild(document.createTextNode(' and '))
            }
            element.removeChild(element.lastChild)
        } else if (typeof value === 'object') {
            for (const [subKey, subValue] of Object.entries(value)) {
                updateTable(subKey, subValue)
            }
        } else {
            updateTable(key, value)
        }
    }
}

function updateTable(key, value) {
    const element = metarTable.querySelector(`[data-type="${key}"]`)
    if (element) {
        element.textContent = value.toString()
    }
}
