// JS for metar.html

import { parseMetar } from '../dist/metar-taf-parser/metar-taf-parser.js'

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
    let metar
    try {
        metar = parseMetar(metarInput.value)
    } catch (e) {
        console.log(e)
        return
    }
    console.log('metar:', metar)
    if (!metar || typeof metar !== 'object') {
        return console.info('no metar')
    }
    for (const [key, value] of Object.entries(metar)) {
        console.debug(`${key}:`, value)
        if (key === 'clouds') {
            processClouds(value)
        } else if (typeof value === 'object') {
            for (const [subKey, subValue] of Object.entries(value)) {
                const sk = `${key}-${subKey}`
                updateElement(sk, subValue)
            }
        } else {
            updateElement(key, value)
        }
    }
}

function updateElement(key, value) {
    const element = metarTable.querySelector(`[data-type="${key}"]`)
    if (element) {
        element.textContent = value.toString()
    }
}

function processClouds(clouds) {
    const element = metarTable.querySelector('[data-type="clouds"]')
    element.innerHTML = ''
    if (!clouds.length) {
        return console.debug('no clouds')
    }
    const seen = []
    for (const cloud of clouds) {
        if (seen.includes(`${cloud.quantity}-${cloud.height}`)) {
            continue
        }
        seen.push(`${cloud.quantity}-${cloud.height}`)
        const span = document.createElement('span')
        span.innerHTML = `<strong>${cloud.quantity}</strong> at <strong>${cloud.height}</strong>`
        element.appendChild(span)
        element.appendChild(document.createTextNode(' - '))
    }
    element.removeChild(element.lastChild)
}
