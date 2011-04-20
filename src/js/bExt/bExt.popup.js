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
        'share_box' : null,
        'is_chrome' : true
    }, active_stash;

window.bExt.popup={
    
    init : function( user_settings ) {
        settings=$.extend( true, settings, user_settings ) 
        // copy_to_clipboard("america is cool")
        var stash = bExt.info.get("stash") || {};
        
        // listeners
        addEventListener("unload", bExt.popup.evt_unload );        
    },    
    
    // Entry Point Function. main
    open : function( curr_tab ) {
        console.log("chrome get tabs calls", settings);
        if(settings.is_chrome) {
            bExt.popup._chrome_open(curr_tab);            
        } else {
            console.log("not chrome, implement");
        }

    },
    _chrome_open : function( curr_tab ) {
        active_stash=new bExt.popup.Stash(curr_tab);
        console.log(curr_tab, "curr_tab")
        active_stash.update( bExt.popup.stash( curr_tab.id ) || {} );
        bExt.popup.update_share( active_stash.get("text") );
        console.log("active_stash", active_stash, active_stash.get("url"), active_stash.get("id"))
        var s_url=active_stash.get("short_url");
        if(s_url && s_url !== "" ) {
            // get selected, fill out page
        } else {
            // shorten this link;
            console.log("shorten me please");            
            bExt.popup.phone({
                'action' : 'shorten_and_select',
                'long_url' : active_stash.get("url"),
                'tab_id' : active_stash.get("id")
            }, function(jo) {
                console.log("phone for short link")
                bExt.popup.chrome_shorten_callback(jo);
            });
        }
    },
    
    phone : function( message, callback ) {
        if(settings.is_chrome) {
            chrome.extension.sendRequest( message, callback );   
        } else {
            console.log("implement phone call to get short url back");
        }
    },
    
    
    // DOM
    update_share : function( txt ) {
        $(settings.share_box).val( $(settings.share_box).val() + " " +  txt);
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
    
    
    // Events
    evt_unload : function(e) {
        e.preventDefault();
        console.log("grab the text", $(settings.share_box).val())
        active_stash.update({
            text : $(settings.share_box).val(),
            timestamp : (new Date()).getTime()
        });
        bExt.popup.stash( active_stash && active_stash.id, active_stash );
    },
    
    chrome_shorten_callback : function(jo) {
        console.log("shorten complete", jo)
        active_stash.set("short_url", jo&&jo.url || "");
        console.log("the active stash internal value", active_stash);
        // do a display update event
    }
}


/*
    Represent Current Meta Data
        
        text
        long url
        short url
        id (tab)
*/
bExt.popup.Stash = function( curr_tab ) {
    this.__m = { 
        'id' : curr_tab && curr_tab.id, // tab id
        'url': curr_tab && curr_tab.url, 
        'text' : '',
        'short_url' : '',
        'title' : curr_tab && curr_tab.title,
        'timestamp' : (new Date()).getTime() 
    };
    this.id=curr_tab.id;
}
bExt.popup.Stash.prototype = {
    // do a better dump
    toString : function() {
        return JSON.stringify(this.__m);
    },
    get : function(name) {
        return this.__m[name] || null;
    },
    
    set : function( name, value) {
        this.__m[name]=value;
    },
    update : function( meta_update  ) {
        // pull the latest data into this.__m
        // okay, if we replace this entry... which is fine, we need to make sure more matches
        // the long url must match the curr long url
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

