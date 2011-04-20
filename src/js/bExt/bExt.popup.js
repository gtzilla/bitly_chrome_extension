// 
//  bExt.popup.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-04-19.
//  Copyright 2011 the public domain. All rights reserved.
// 
// dependencies: jQuery, fastFrag, bExt

(function(window, undefined){

var document=window.document, 
    settings={
        'url_clipboard' : null,
        'share_box' : null
    }, active_stash;

window.bExt.popup={
    // Entry Point Function. main
    open : function( curr_tab ) {
        console.log("chrome get tabs calls")
        bExt.popup._chrome_open(curr_tab);
    },
    _chrome_open : function( curr_tab ) {
        active_stash=bExt.popup.stash( curr_tab.id ) || new bExt.popup.Stash(curr_tab);
        console.log(active_stash);
    },
    
    stash : function(key, value) {
        var stash, all_stash=bExt.info.get("stash");
        if(arguments.length > 1) {
            // Perform a Set
            all_stash[ key ]=value || {};
            bExt.info.set("stash", all_stash );
            stash=value;                
        } else {
            all_stash = bExt.info.get("stash") || {};
            stash=all_stash&&all_stash[key];
        }
        return stash;
    },

    init : function( user_settings ) {
        settings=$.extend( true, settings, user_settings ) 
        // copy_to_clipboard("america is cool")
        var stash = bExt.info.get("stash") || {};
        
        // listeners
        addEventListener("unload", bExt.popup.evt_unload );        
    },
    
    
    // Events
    evt_unload : function(e) {
        e.preventDefault();
        console.log("grab the text", $(settings.share_box).val())
        active_stash.update({
            text : $(settings.share_box).val(),
            timestamp : (new Date()).getTime()
        });
        bExt.popup.stash( active_stash && active_stash.id, active_stash );
    }
}

bExt.popup.Stash = function( curr_tab ) {
    this.__m = { 'tab_id' : curr_tab.id, 
                 'long_url':  curr_tab.url, 
                 'text' : '',
                 'short_url' : '',
                 'title' : curr_tab.title,
                 'timestamp' : (new Date()).getTime() };
    this.id=curr_tab.id;
}
bExt.popup.Stash.prototype = {
    // do a better dump
    toString : function() {
        return JSON.stringify(this.__m);
    },
    
    update : function( meta_update  ) {
        // pull the latest data into this.__m
        $.extend( this.__m, meta_update );
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
    $(settings.url_clipboard).select();
    document.execCommand("copy", false, null);
}
    
    
})(window);

