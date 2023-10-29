// JS for options.html and popup.html

new ClipboardJS('.clip')

document.querySelectorAll('.version').forEach((el) => {
    const manifest = chrome.runtime.getManifest()
    el.innerText = manifest.version
})
