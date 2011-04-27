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
        'auto_copy' : false,
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
            console.log("load page from init, not called");
            bExt.popup.page=new bExt.popup.Dompage();
        }
        // listeners
        addEventListener("unload", bExt.popup.evt_unload );        
    },    
    
    _chrome_open : function( curr_tab ) {
        var s_url;
        
        active_stash=new bExt.popup.Stash(curr_tab);
        active_stash.update( bExt.popup.find_stash( "url", curr_tab.url  ) || {}, true );
        bExt.popup.save_stash( "url", curr_tab.url, active_stash.out() );
        s_url=active_stash.get("short_url");
        if(s_url && s_url !== "" ) {
            
            // get selected, fill out page
            bExt.popup.page.update( s_url, active_stash.display(), settings.auto_copy );

        } else {
            // shorten this link;           
            bExt.popup.phone({
                'action' : 'shorten_and_select',
                'long_url' : active_stash.get("url"),
                'tab_id' : active_stash.get("id")
            }, bExt.popup.chrome_shorten_callback );
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
        bExt.popup.save_stash( "url", active_stash.get("url"), active_stash.out()  );
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
    // todo, consider using the base64 of the long URL as the ID...
    // this is interesting b/c you could move the url to a diff tab
    this.id=curr_tab.id;
}
bExt.popup.Stash.prototype = {
    // do a better dump
    display : function() {
        var txt = (this.__m['text'] || "").trim();
        if(txt && txt !== "") {
            return txt;
        }
        return this.__m['title'] + " " + this.__m['short_url'];
    },
    
    toString : function() {
        return JSON.stringify(this.__m);
    },
    get : function(name) {
        return this.__m[name] || null;
    },
    
    out : function() {
        return this.__m;
    },
    
    set : function( name, value) {
        this.__m[name]=value;
    },
    update : function( meta_update, clear_short  ) {
        
        // pull the latest data into this.__m
        // okay, if we replace this entry... which is fine, we need to make sure more matches
        // the long url must match the curr long url
        if(this.__m.url !== meta_update.url && clear_short) {
            // reset short url, different page
            meta_update.short_url="";
        }
        $.extend( this.__m, meta_update );
    }
    
}
    
})(window);






