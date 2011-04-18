(function() {

    function getSelected() {
        // inject into a content page, phone this home
        var selection = window.getSelection() || document.getSelection() || document.selection.createRange().text;
        if(!selection) { selection = ''; }
        chrome.extension.sendRequest({'action' : 'page_selection', 'selection' : selection.toString() }, success)
    }

    function success( jo ) {
        //console.log("response, if any", jo)
    }
    try {
        getSelected();
    } catch(e) {

    }

    
})();


