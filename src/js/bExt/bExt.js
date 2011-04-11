// 
//  bExt.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-04-07.
//  Copyright 2011 the public domain. All rights reserved.
// 





var bExt={
    // bExt.match_host
    'api' : null,
    'db' : null,
    match_host : function(url_str) {
        var matches = url_str.match(/^http(?:s)?:\/\/([^/]{2,})\/.*$/i);
        return matches && matches.pop();
    },
    // bExt.Evt
    Evt : function(request, sender, callback) {
        // an Ext Event Wrapper / Representation
        this.__finished=false;
        this.url=sender.tab && sender.tab.url;
        this.domain_host=bExt.match_host( this.url );
        this.tab_id=sender && sender.tab && sender.tab.id || null;
        this.__cb=callback && (typeof callback === "function") && callback || function(){};
        // return this;
    },
    // bExt.user    
    user : {
        /*
            enhance_twitter_com
            auto_expand_urls
            user_data = localfetch("user_data");
        */
        
        'get' : function(key) {
            if(!this.__data[key]) {
                // get from cache, store it
            }
            return this.__data[key];
        },
        'set' : function(k,v) {
            this.__data[k]=v;
        },
        '__data' : {},
        'load_cache' : function() {
            // everything from the cache
        },
        
        'clear' : function() {
            // signout
        }
    }
}

/*
    Events
*/
bExt.Evt.prototype={
    /*
        usage
            new bExt.Evt( request, sender, sendResponse );
    */
    // bExt.Evt.callback
    callback : function( data ) {
        var cb=this.__cb;
        if(this.__finished){  return; }
        this.__finished=true;
        if(cb && (typeof cb).toLowerCase() === "function") {
            cb( data || {} );
        }
    }
}




/*  EOF */
