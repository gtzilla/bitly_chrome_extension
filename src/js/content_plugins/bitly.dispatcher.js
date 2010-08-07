function dispatch_callback(jo) {
}

function init() {
    var home, homes=["bit.ly", "j.mp"], body,
        h = document.location && document.location.host;
    if(h && homes.indexOf(h) > -1 ) {
        body = document.getElementsByTagName("body")[0];
        // add listener in rev2
    } else if(h) {
        chrome.extension.sendRequest({'action' : 'page_loaded' }, dispatch_callback);
    }
    
}

init();