// 
//  bExt.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-04-07.
//  Copyright 2011 the public domain. All rights reserved.
// 



(function(window, undefined) {
    


window.bExt={
    // bExt.match_host
    'api' : null,
    'db' : null,
    'events' : null,
    'is_chrome' : true,
    'context_menu' : false,
    
    /*
        TODO: Handle Upgrades / New Installs better
            DB Space, Setting Defaults etc
    */
    match_host : function(url_str) {
        // todo, weakness, not all URLs start with HTTP/HTTPs 
        var matches = url_str && url_str.trim().match(/^http(?:s)?:\/\/([^/]{2,})\/?.*$/i);
        return matches && matches.pop();
    },    
    init_db : function() {
        try {
            bExt.db=sqlDB("bitly_local_db");            
        } catch(e) {return false;}
        return true;

    },
    
    open_page : function( page_name ) {
        if(!bExt.is_chrome) { console.log("not chrome"); return; }
        
        var url =  chrome.extension.getURL(page_name),
            curr_tab, i=0, createTab=true, self=this,
            params = { 'selected' : true, 'url' : url };
        
        chrome.tabs.getAllInWindow(null, function(tab_array) {

           for(; curr_tab=tab_array[i]; i++) {
               // todo, this is broken
               if( self.url === url ) {
                   createTab=false;
                   chrome.tabs.update( self.tab_id, params);
                   break;
               }
           }
           if(createTab) { chrome.tabs.create( { 'url' : chrome.extension.getURL( page_name ) }); }
        });        
    },
    
    set_popup : function() {
        if(bExt.is_chrome && !bExt.info.get("disable_popup") ) {
            chrome.browserAction.setPopup({ "popup" : "popup.html"});
        } else if( bExt.is_chrome ){
            console.log("the pop is disabled, browser action");
            chrome.browserAction.setPopup({ "popup" : ""});   
            chrome.browserAction.setTitle({
                title : "Shorten link with bitly"
            });                     
            if( !chrome.browserAction.onClicked.hasListener( bExt.evt_button_listen ) ) {
                chrome.browserAction.onClicked.addListener( bExt.evt_button_listen );
            }
        } else {
            console.log("not chrome, didn't set popup");
        }

    },
    
    // bExt.sign_in
    sign_in : function( username, password, callback ) {
        
        if(!bExt._api_instance) {
            bExt.init_api();
        }
        bExt.api.auth(username, password, function(response) {
            
            var auth = response, current_user;
            if(auth && auth.login !== "" ) {
                current_user = {
                    "x_login": auth.login,
                    "x_apiKey": auth.apiKey,
                    "access_token" : auth.access_token
                }
                bExt.info.set("user_data", current_user);                
                bExt.md5_domains();
                bExt.trends.init();
                bExt.set_popup();
            }
            if(callback) { callback(response); }
        
        });
        
    },
    
    disable_popup : function( disabled ) {
        
        if(disabled) {
            chrome.browserAction.setPopup({ "popup" : ""});
            chrome.browserAction.setTitle({
                title : "Shorten link with bitly"
            });
            if( !chrome.browserAction.onClicked.hasListener( bExt.evt_button_listen ) ) {
                chrome.browserAction.onClicked.addListener( bExt.evt_button_listen );
            }            
        } else {
            chrome.browserAction.setPopup({ "popup" : "popup.html"});
        }        
    },
    
    // bExt.sign_out
    sign_out : function() {
        bExt.api.remove_credentials();
        
        try {
            bExt._clear_signin_data();        
        } catch(e) {}

        bExt.api.set_domain("bit.ly");
        
        // bail on worker
        bExt.trends.exit();
        
        bExt.disable_popup( true );
        console.log("log out complete")
        return;
    },
    
    _clear_signin_data : function() {
        bExt.info.remove("realtime");
        bExt.info.remove("note_blacklist");
        bExt.info.remove("notifications");
        bExt.info.remove("stash");
        bExt.info.remove("popup_history");

        bExt.info.remove("user_data");
        bExt.info.remove("share_accounts"); //  we don't store share accounts in SQL
        bExt.info.remove("no_expand_domains");            

        bExt.db.remove("notifications", delete_sql_handler );
        bExt.db.remove("no_expand_domains", delete_sql_handler );
        bExt.db.remove("user_data", delete_sql_handler );
        bExt.db.remove("domain", delete_sql_handler );
        bExt.db.remove("auto_expand_urls", delete_sql_handler );
        bExt.db.remove("enhance_twitter_com", delete_sql_handler );        
    },
    
    add_righclick : function() {
        if(!bExt.context_menu) {
            var params = {
                'type' : 'normal',
                'title' : 'Shorten and copy link with bitly',
                'contexts' : ["link"],
                'onclick' : bExt.evt_rightclick,
                'documentUrlPatterns' : ['http://*/*', 'https://*/*']
            }
            // todo, chrome specific
            if(bExt.is_chrome) {
                chrome.contextMenus.create(params, function() {});                            
            } else {
                console.log("not chrome, no context menu added")
            }

            bExt.context_menu=true;
        }
    },
    
    evt_rightclick : function(info, tab) {
        var long_url = info.linkUrl && info.linkUrl.trim(), expand_meta_data;
        if(long_url !== "" ) {
            bExt.api.shorten( info.linkUrl.trim(), function(jo) {
                if(jo && jo.status_txt && jo.status_txt === "ALREADY_A_BITLY_LINK") {
                   _util_expand_and_reshorten( long_url  );
                } else if(jo && jo.url && jo.url !== "") {
                    copy_to_clip(jo.url);
                    // contextmenu_inject_pagebanner( tab.id );
                }
            }); 
        }        
    },
    
    
    /*
        The Fish Icon
    */
    evt_button_listen : function( curr_tab ) {
        // The Event for the 'popup' When popup is NOT enable
        var udata = bExt.info.get("user_data"), popup_disabled=bExt.info.get("disable_popup");
        if(bExt.is_chrome && udata && udata.x_login && !popup_disabled ) {
            console.log("is the no shorten on?? User logged in?", udata);
            
        } else if( udata && udata.x_login && popup_disabled  ) {
            bExt.speed_shorten( curr_tab )

        } else if(bExt.is_chrome) {
            
            chrome.tabs.create( { 'url' : chrome.extension.getURL( "signin.html" ) });
            console.log("didn't open the chrome tab for optiions inoroder to login")
        }

    },
    
    
    speed_shorten : function( curr_tab ) {
        console.log("no popup, do a shorten", bExt.api, curr_tab);
        
        chrome.browserAction.setBadgeText({
            text : " ",
            tabId : curr_tab.id                
        });
        chrome.browserAction.setBadgeBackgroundColor({
            color : [107, 175, 240, 150],
            tabId : curr_tab.id
        });            
        // shorten only.            
        if(curr_tab.url && curr_tab.url !== "") {
            // todo, add match host
            bExt.api.shorten( curr_tab.url, function(jo) {
                console.log("jo", jo);
                if(jo && jo.url) {
                    copy_to_clip( jo.url );
                    setTimeout(function() {
                        chrome.browserAction.setBadgeText({
                            text : "",
                            tabId : curr_tab.id                
                        });                            
                    }, 7000);
                }
            });
        }        
    },
    
    // start the bitly API ref
    init_api : function() {
        if(!bitly_oauth_credentials || !bitly_oauth_credentials.client_id) { return false; }
        
        // create a new instance
        if(!bExt._api_instance) {
            bExt._api_instance=true;
            bExt.api=new bitlyAPI( bitly_oauth_credentials.client_id, bitly_oauth_credentials.client_signature );
        }
        
        bExt.api.set_domain( bExt.info.get("domain") || "bit.ly" );
        
        var user_data = bExt.info.get("user_data");
        if(user_data && user_data.x_login && user_data.x_apiKey) {
            bExt.api.set_credentials( user_data.x_login, user_data.x_apiKey, user_data.access_token );
        } else {
            return false;
        }

        return true;
    },
    
    md5_domains : function() {
        bExt.api.bitly_domains( bExt.hovercard.store_md5domains );        
    },
    
    // notifications preferences (settings and whatnot)
    note_prefs : function() {
        var default_pref = { 'enabled' : true, 'threshold' : 20, "interval" : 1, "interval_type" : 'hour' };
        return bExt.info.get("note_preferences") || default_pref;
    },
    
    update_note_prefs : function( meta ) {
        var meta = $.extend( {}, bExt.note_prefs(), meta); 
        return bExt.info.set("note_preferences", meta);
    },
    
    // get all the notes resolves
    note_resolve : function( short_urls ) {
        var r_time = bExt.info.get("realtime"), 
            bit_result, i=0, black_list=[], active_links = [],
            notes_list = [], l_notes = bExt.info.get("notifications") || [],
            prefs = bExt.note_prefs();

        if(short_urls.length <= 0 ) { return; }
        r_time = r_time && r_time.realtime_links || [];

        bExt.api.expand_and_meta( short_urls, function(jo) {
            // add to the notifications, remove from the list...

            for(var k in jo.expand_and_meta) {
                bit_result = jo.expand_and_meta[k];

                for(i=0;i<r_time.length;i++) {
                    if(r_time[i].user_hash === bit_result.user_hash) {
                        bit_result.trend_clicks = r_time[i].clicks;
                    }
                }

                if(bit_result.trend_clicks > prefs.threshold) {
                    black_list.push( bit_result.short_url );
                    notes_list.push( bit_result );
                }
            }

            l_notes = l_notes.concat(notes_list);
            bExt.info.set("notifications", l_notes);


            if(l_notes.length > 0 ) {
                bitNote.show();
            }

            bExt.trends.update_links( black_list, bExt.api.bit_request.access_token );
            bExt.trends.expire_links();

        });        
    },
    

    /*
        Access to LOCAL storage
            This access transcends windows / pages
            
            Accessable across entire chrome ext.
    */
    'info' : {
        
        'get' : function(key) {
            return this.__get(key);
        },
        '__get' : function(itemKey) {
            var item = window.localStorage.getItem( itemKey );
            try{
                return JSON.parse(item);
            } catch(e) { return item; }          
        },
        'set' : function(k,v) {
            // this.__data[k]=v;
            try{
                window.localStorage.setItem( k, window.JSON.stringify( v ) );
                return true;
            } catch(e) {}
            return false;   
        },
        'remove' : function(itemKey) {
            try {
                window.localStorage.removeItem( itemKey );
                return true;
            } catch(e){ return false; }
        }
    }
    /* end bExt.info methods  */
}


/*
    Trends
        -- workers etc
*/




function _util_expand_and_reshorten( long_url ) {
    bExt.api.expand( long_url, function(jo) {
        expand_meta_data = jo&&jo.expand&&jo.expand.pop();
        if(!expand_meta_data) { return; } // todo, bubble error??
        bExt.api.shorten( expand_meta_data.long_url, function(jo) {
            if(jo && jo.url && jo.url !== "") {
                copy_to_clip(jo.url);                                    
            }
        });
    });    
}

function copy_to_clip( str_value  ) {
    var $txt_area = $("#instant_clipboad_copy_space");
    if(!$txt_area || $txt_area.length < 1 ) {
        document.body.appendChild( fastFrag.create({
            id : "instant_clipboad_copy_space"
        }) );
        $txt_area = $("#instant_clipboad_copy_space");
    }
    try {
        $txt_area.val( str_value );
        $txt_area[0].select();
        document.execCommand("copy", false, null);  
    } catch(e){}            
}

function contextmenu_inject_pagebanner( tab_id  ) {
    
    if(bExt.is_chrome) {
        chrome.tabs.executeScript(tab_id, {
            file : "js/content_scripts/bitly.contextMenuNotification.js"
        });
    } else {
        console.log("not chrome, context menu not injected");
    }

}




// todo,
// move this elsewhere
Function.prototype._scope = function( scope ) {
    var self=this;
    return function() { self.apply( scope, Array.prototype.slice.call( arguments, 0 ) ); }
}

window.bExt.config = {
    /*
        Twitter Button
        
        Right Click Button
        
        Auto Copy Button
        
        Context Menu Notifications
        
        Hovercard / link expander
    */
    twitter_bttn : function() {
        var existing = bExt.info.get("enhance_twitter_com");
        if(existing === null || existing === undefined )  {
            console.log("it doesn't EXIST???");
            existing=true;
            bExt.info.set("enhance_twitter_com", existing);            
        }
        return existing;
        
    }
}

/*
    Sharing
    
        Handle the connection between bitly API and ext for external services and Local Storage

*/
window.bExt.share = {
    
    // get the current Social Network Accounts associated w/ bitly account
    // 'cache' this data into localstorage to speed up requests
    accounts : function( callback ) {
        var user_share_accounts = bExt.info.get("share_accounts");
        if(!user_share_accounts) {
            bExt.share.sync( callback );
        } else {
            callback( user_share_accounts )
        }        
    },
    
    // toggle specific social accounts on and off
    toggle : function( accnt_id, active,  callback  ) {
        var user_share_accounts = bExt.info.get("share_accounts"),
            accounts = user_share_accounts && user_share_accounts.share_accounts,
            i=0, account, flag=false;
        
        for( ; account=accounts[i]; i++) {
            if( account.account_id === accnt_id ) {
                account.active = active;
                flag = true;
                break;
            }
        }
        bExt.info.set("share_accounts", user_share_accounts);
        callback(user_share_accounts);
    },
    
    // Get the latest Social Accounts from remote bitly
    sync : function( callback ) {
        var account, accounts, i=0;
        bExt.api.share_accounts( function( jo ) {
            if (jo.status_code === 403) {
                
                bExt.sign_out(); // issue #8, explicitly sign out!
                jo.error = true;
                callback(jo)
                return;
            }

            accounts = jo && jo.share_accounts;
            if(accounts) {
                for( ; account=accounts[i]; i++) {
                    account.active=true;
                }
                bExt.info.set("share_accounts", jo);
            }
            callback(jo);

        });        
    },
    
    send : function( share_link, message, callback ) {
        var a = bExt.info.get("share_accounts"),
            accounts = a && a.share_accounts || [],
            i=0, account, share_ids = [], params = {};

        for( ; account=accounts[i]; i++) {
            if(account.active) {
                share_ids.push( account.account_id );
            }
        }
        if(message.trim() === "" || share_ids.length <= 0 ) {
            callback({'error' : 'no active accounts'})
            return;
        }

        params.account_id = share_ids;
        params.share_text = message;
        if(share_link) { params.share_link = share_link; }
        
        // make the HTTP remote request
        bExt.api.share( params, function(jo) {
            if (jo.status_code === 403) {
                // issue #8, explicitly sign out!
                bExt.sign_out();
                jo.error = true;
            }
            callback(jo);
        });
    }
    
}

function delete_sql_handler() {
    /* sql  */
}


})(window);

/*  EOF */
