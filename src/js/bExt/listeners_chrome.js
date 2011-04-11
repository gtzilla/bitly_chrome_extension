// 
//  listeners_chrome.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-04-07.
//  Copyright 2011 the public domain. All rights reserved.
// 
var listeners_chrome={
    "page_loaded" : function( ext_evt ) {
        // incomplete
        // NO
        // it has to be access wrappers
        // no straight calling CHROME
        // generic, plz
        
        // if(!user_settings.auto_expand_url) { ext_evt.callback({}); return; }
        
        console.log("the brain hears you in listeners_chrome", ext_evt);
        if(ext_evt.domain_host === "twitter.com") {
            this._add_js( ext_evt.tab_id, "js/content_plugins/bitly.enhance_twitter.js" );
         }
        
        this._add_js( ext_evt.tab_id, "js/content_plugins/bitly.urlexpander.js" );                
        // return;
        
        ext_evt.callback({});
    },
    "share" : function() {
        console.log("share share")
    }
}