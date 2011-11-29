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
    /*
        User Navigated Page Load
            Hover card / additional action hooks for user preferences
        
    */
    "page_loaded" : function( evt ) {
        if( bExt.api.is_authenticated() && evt.is_http ) {
            var hv=bExt.hovercard, hovercard_blacklist=hv.blacklist();
            // todo, add user pref to disable
            if(evt.domain_host === "twitter.com" && bExt.config.twitter_bttn() ) {
                this.add_js( evt.tab_id, "js/content_plugins/bitly.enhance_twitter.js" );
                this.add_js( evt.tab_id, "js/content_plugins/bitly.linksRecap.js" );
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
            bExt.hovercard.update_blacklist( [evt.domain_host] );
            this.open_page("options.html");            
        }
        evt.callback({});
    },
    
    "update_api_domain" : function( evt ) {
        if(evt.api_domain) {
            bExt.api.set_domain( evt.api_domain );            
        }
        evt.callback({});        
    },
    
    "sign_out" : function( evt ) {
        bExt.sign_out();
        evt.callback({});
    },
    
    "toggle_popup" : function( evt ) {
        // speed shorten preference setting
        // Auto Copy must be 'enabled' for this to work
        bExt.disable_popup( evt.is_active );
    },
    
    "realtime_metrics" : function(evt) {
        evt.callback( bExt.info.get("realtime") || {} );
    },
        
    'expand_and_meta' : function( evt ) {
        bExt.hovercard.md5domains( this._mklist( evt.short_url ), function( clean_urls_list ) {
            if(clean_urls_list.length > 0) {
                bExt.api.expand_and_meta( clean_urls_list, evt.callback._scope(evt) );            
            } else {
                evt.callback._scope(evt)({});
            }
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
                bExt.sign_out();
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
    
    "share" : function( evt ) {
        var s_url = evt.share_link || null;
        bExt.share.send( s_url, (evt.share_text || ""),  evt.callback._scope(evt) );
    },
    
    "share_accounts" : function( evt ) {
        bExt.share.accounts( evt.callback._scope(evt) );
    },
    
    "re_sync_share_accounts" : function( evt ) {
        bExt.share.sync( evt.callback._scope(evt) )
    },
    
    "activate_account" : function( evt ) {
        // Turn accounts on/off for sharing
        bExt.share.toggle( evt.account_id, evt.is_active, evt.callback._scope(evt) );
    },
    
    "shorten_and_select" : function( evt ) {
        console.log("shorten_and_select", evt, evt.is_http, evt.tab_id);
        if(evt.is_http) {
            this.add_js(evt.tab_id, "js/content_plugins/getSelected.js");
        }
        bExt.api.shorten( evt.long_url, evt.callback._scope(evt) );        

    },

    "page_select" : function( evt ) {
        console.log("evt page select", evt, evt.tab_id);
        if(evt.is_http) {
            this.add_js(evt.tab_id, "js/content_plugins/getSelected.js");
            evt.callback();
        }        
    }
    


}
