// 
//  listeners_chrome.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-04-07.
//  Copyright 2011 the public domain. All rights reserved.
// 
// if(!bExt) { var bExt = {}; }
/*
    Notes,
        for now, use evt.callback._scope(evt)
            'this' is always something, not always 'this' ;)

*/
bExt.bg_listeners_chrome = {
    "page_loaded" : function( evt ) {
        if( bExt.api.is_authenticated() && evt.is_http ) {
            var hv=bExt.hovercard, hovercard_blacklist=hv.blacklist();
            // todo, add user pref to disable
            if(evt.domain_host === "twitter.com") {
                this.add_js( evt.tab_id, "js/content_plugins/bitly.enhance_twitter.js" );
             }
             
             if( hv.allow() && hovercard_blacklist.indexOf( evt.domain_host ) < 0 ) {
                 this.add_js( evt.tab_id, "js/content_plugins/bitly.urlexpander.js" );
                 this.add_css( evt.tab_id, "css/urlexpander.css" );
             }
        }
        evt.callback({});
    },
    
    'open_page' : function( evt ) {
        this.open_page( evt && evt.page_name || null );
    },
    "add_prohibited_host" : function( evt ) {
        // from URL expander Content Plugin
        if(evt.domain_host) {
            bExt.hovercard.add_prohibited( evt.domain_host );
            this.open_page("options.html");            
        }
        evt.callback({});
    },
        
    'expand_and_meta' : function( evt ) {
        bExt.hovercard.md5domains( this._mklist( evt.short_url ), function( clean_urls_list ) {
            bExt.api.expand_and_meta( clean_urls_list, evt.callback._scope(evt) );            
        });

    },
    // bitly api
    'shorten' : function( evt ) {
        if(evt.long_url) {
            bExt.api.shorten( evt.long_url, evt.callback._scope(evt) );                        
        }        
    },
    'expand' : function( evt ) {
        bExt.api.expand( evt.short_url, evt.callback._scope(evt) );
    },
    'bitly_domains' : function( evt ) {
        bExt.api.bitly_domains( function(jo) {
            var bit_domains = jo.reverse();
            if(jo.status_code === 403) {
                //sign_out();
                // trigger a signout event?
                evt.callback( [] );
                return;
            }
            evt.callback( bit_domains );
        });        
    },
    'lookup' : function( evt ) {
        if(evt.long_url) {
            bExt.api.lookup( evt.long_url, evt.callback._scope(evt) );                        
        }        
    },
    
    "share" : function() {
        console.log("share share");
    },
    
    "shorten_and_select" : function( evt ) {
        console.log("execute this...", evt.is_http, evt.tab_id)
        if(evt.is_http) {
            this.add_js(evt.tab_id, "js/content_plugins/getSelected.js");
        }
        console.log("shorten it?", evt)
        bExt.api.shorten( evt.long_url, evt.callback._scope(evt) );        

    },

    "page_select" : function( evt ) {
        console.log("evt page select", evt)
        if(evt.is_http) {
            this.add_js(evt.tab_id, "js/content_plugins/getSelected.js");
            evt.callback();
        }        
    }
    


}
