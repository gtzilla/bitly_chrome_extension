function dispatch_callback(jo) {
    //
}

function init() {
    chrome.extension.sendRequest({'action' : 'page_loaded' }, dispatch_callback)     
}

init();