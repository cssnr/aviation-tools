// JS for offscreen.html

chrome.runtime.onMessage.addListener(onMessage)

/**
 * On Message Callback
 * @function onMessage
 * @param {Object} message
 */
function onMessage(message) {
    console.log('%c onMessage:', 'color: Lime', message)
    try {
        // Check target
        if (message?.target !== 'offscreen') {
            return console.debug('Not Offscreen message')
        }
        // Check type
        if (message?.type === 'clipboard') {
            handleClipboardWrite(message.data)
        } else {
            console.warn('Unknown Message:', message)
        }
    } catch (e) {
        console.error(e.message)
    } finally {
        console.debug('window.close')
        window.close()
    }
}

function handleClipboardWrite(data) {
    console.debug('handleClipboardWrite:', data)
    if (typeof data !== 'string') {
        throw new TypeError(`Value must be "string" got: "${typeof data}"`)
    }
    const textEl = document.createElement('textarea')
    document.body.appendChild(textEl)
    textEl.value = data
    textEl.select()
    // noinspection JSDeprecatedSymbols
    document.execCommand('copy') // NOSONAR
    console.debug('%c handleClipboardWrite: SUCCESS', 'color: Lime')
}
