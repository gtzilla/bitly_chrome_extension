function getSelected() {
    
    
    // inject into a content page, phone this home
    var selection = window.getSelection() || document.getSelection() || document.selection.createRange().text;
    if(!selection) {
        selection = ''
    }
    console.log(selection, "a selection")
    
    chrome.extension.sendRequest({'action' : 'page_selection', 'selection' : selection.focusNode.data || "" }, success)
    //return selection    
    
}

function success( jo ) {
    console.log("response, if any", jo)
}

getSelected();