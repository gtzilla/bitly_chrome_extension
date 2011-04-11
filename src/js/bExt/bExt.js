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
    
    init_api : function() {
        if(!bitly_oauth_credentials || !bitly_oauth_credentials.client_id) { return false; }
        if(!bExt._api_instance) {
            bExt._api_instance=true;
            bExt.api=new bitlyAPI( bitly_oauth_credentials.client_id, bitly_oauth_credentials.client_signature );
        }
        var user_data = bExt.info.get("user_data");
        if(user_data && user_data.x_login && user_data.x_apiKey) {
            bExt.api.set_credentials( user_data.x_login, user_data.x_apiKey, user_data.access_token );
        } else {
            return false;
        }

        return true;
    },
    
    'hovercard' : {
        'blacklist' : function() {
            var hv = bExt.info.get("hovercard");
            
            if(!hv.blacklist) {
                hv.blacklist = ["bit.ly", "j.mp"];
                bExt.info.set("hovercard", hv);
            }            
        },
        'allow' : function() {
            var hv = bExt.info.get("hovercard");
            return hv.show_card
        }
    },
    
    // bExt.user    
    'info' : {
        /*
            enhance_twitter_com
            auto_expand_urls
            user_data = localfetch("user_data");
        */
        
        'get' : function(key) {
            if(!this.__data[key]) {
                // get from cache, store it
                this.__data[key]=this.__get(key);
            }
            return this.__data[key];
        },
        '__get' : function(itemKey) {
            var item = window.localStorage.getItem( itemKey );
            try{
                return JSON.parse(item);
            } catch(e) { return item; }          
        },
        'set' : function(k,v) {
            this.__data[k]=v;
            try{
                return window.localStorage.setItem( k, window.JSON.stringify( v ) );
            } catch(e) {}
            return;            
        },
        '__data' : {},
        'load_cache' : function() {
            // everything from the cache
        },
        
        'clear' : function(itemKey) {
            try {
                return window.localStorage.removeItem( itemKey )
            } catch(e){ return false; }
            return true;            
        }
    },
    
    'sharing' : {
        'sync' : function( callback ) {
            
        }
    }
}






/*  EOF */
