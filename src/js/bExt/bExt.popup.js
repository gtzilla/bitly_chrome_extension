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
        'is_chrome' : true,
        'auto_copy' : false
    }, active_stash;

window.bExt.popup={
    /*
            Entry Point Function. main
    */
    open : function( curr_tab ) {
        // called when the popup 'opens'
        if(settings.is_chrome) {
            bExt.popup._chrome_open(curr_tab);
        } else {
            console.log("not chrome, implement");
        }
    },
    
    // Variables / constants
    
    page : null,
    
    init : function( user_settings ) {
        // setup page items
        settings=$.extend( true, settings, user_settings )
        
        if(!bExt.popup.page) {
            console.log("bExt.popup.Dompage() var is null, create new bExt.popup.Dompage from init");
            bExt.popup.page=new bExt.popup.Dompage();
        }
        // listeners
        if(bExt.is_chrome) {
            chrome.extension.onRequest.addListener( chrome_request_listener );
        } else {
            console.log("not chrome, popup has no listener");
        }
        addEventListener("unload", bExt.popup.evt_unload );
    },
    
    _chrome_open : function( curr_tab ) {
        var s_url, params={ "action" : ""};
        
        active_stash=new bExt.popup.Stash(curr_tab);
        active_stash.update( bExt.popup.find_stash( "url", curr_tab.url  ) || {}, true );
        bExt.popup.save_stash( "url", curr_tab.url, active_stash.out() );

        params={
            'action' : 'page_select',
            'long_url' : active_stash.get("url"),
            'tab_id' : active_stash.get("id")
        }
        s_url=active_stash.get("short_url");
        if(s_url && s_url !== "" ) {
            
            // get selected, fill out page
            bExt.popup.page.update( s_url, active_stash.display(), settings.auto_copy );
            bExt.popup.phone( params, function(){} );
        
        } else {
            // shorten this link;
            params.action="shorten_and_select"
            bExt.popup.phone( params, bExt.popup.chrome_shorten_callback );
        }
    },
    
    phone : function( message, callback ) {
        if(settings.is_chrome) {
            chrome.extension.sendRequest( message, callback );
        } else {
            console.log("implement phone call to get short url back");
        }
    },
    
    chrome_shorten_callback : function(jo) {
        active_stash.set("short_url", jo&&jo.url || "");
        
        // do a display update event
        bExt.popup.page.update( active_stash.get("short_url"), active_stash.display(), settings.auto_copy );
    },
    
    stash : function() {
        return active_stash.display();
    },
    
    stash_txt : function() {
        return active_stash.get("text");
    },
    
    basic_stash : function( reset ) {
        return active_stash.basic( reset  );
    },
    
    find_stash : function( id, value  ) {
        var i=0, all_stash=bExt.info.get("popup_history") || [];
        for( ; i<all_stash.length; i++) {
            if( all_stash[i][id] === value ) {
                console.log("found stash", all_stash[i])
                return all_stash[i];
            }
        }
        return null;
    },
    
    update_stash : function(stsh_txt) {
        active_stash.set("text", stsh_txt);
    },
    
    save_active_stash : function() {
        bExt.popup.save_stash( "url", active_stash.get("url"), active_stash.out() );
    },
    
    save_stash : function(id, value, payload) {
        var i=0, all_stash=bExt.info.get("popup_history") || [], added=false;
        for( ; i<all_stash.length; i++) {
            if( all_stash[i][id] === value ) {
                added=true;
                all_stash[i]=payload;
            }
        }
        if(!added) {
            all_stash.push(payload);
        }
        // lop off the first 20 (since new are pushed in..)
        if(all_stash.length > 100) {
           all_stash.splice(0, 20);
        }
        bExt.info.set("popup_history", all_stash);
    },
    
    
    // Events
    // DOM Event
    evt_unload : function(e) {
        e.preventDefault();
        active_stash.update({
            'text' : bExt.popup.page.get_text(),
            'timestamp' : (new Date()).getTime()
        });
        bExt.popup.save_active_stash();
    }
}


function chrome_request_listener(request,sender,sendResponse) {
    if(!request.action || request.action !== "page_selection") return;
    var selected_text = (request.selection || "").trim();
    if(selected_text !== "") {
        // ummmm
        // txtarea.value = txtarea.value + " " + selected_text;
        bExt.popup.page.share_txt( selected_text );
    }
    sendResponse({});
}





})(window);






