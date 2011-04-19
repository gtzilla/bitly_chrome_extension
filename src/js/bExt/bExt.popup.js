// 
//  bExt.popup.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-04-19.
//  Copyright 2011 the public domain. All rights reserved.
// 
// dependencies: jQuery

(function(window, undefined){

var document=window.document;

window.bExt.popup={
    // settings
    'settings' : {
        'url_clipboard' : null
    },

    
    
    // Entry Point Function. main
    open : function( settings ) {
        console.log("i am open");
        bExt.popup.settings=$.extend( true, {}, bExt.popup.settings, settings ) 
        copy_to_clipboard("america is cool")
    },

    init : function() {

    }
}   


/*
    Private
*/ 

// function _id() {
//     return document.getElementById(arguments[0])
// }

function copy_to_clipboard( short_url ) {
    // todo, use dom
    $(bExt.popup.settings.url_clipboard).select();
    document.execCommand("copy", false, null);
}
    
    
})(window);

