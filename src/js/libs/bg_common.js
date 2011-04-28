/*
    This file is just a dumping ground of Background Page *Helper* methods
        Don't add this script to other pages
        
    If there is a method in here you need, either 
        access via chrome.extension.getBackgroundPage() 
        - OR -
        move the function to common.js
        
    Note:
        This file relies on several background page specific global variables, it's messy, but it's happening
        SO - don't include this file on any other page...
        
        - bit_db [current instance of the "bitly" SQL, running against a basic table with two columns,  itemKey, itemValue]
        - bitly [current instance of bitly api, contains user credentials specific to the user]
        - domains_list [in memory list of md5 domains]
        
        
        File also contains references to chrome.* object
        
        
        
        Common global variables..
        
            trends_worker
            bit_db
            bitly
    
*/


// these are common helper funcs
// local SQL can be done via bit_db (bit_db=bitlyDB("db_name"))
function localstore( itemKey, itemValue ) {
    try{
        return window.localStorage.setItem( itemKey, window.JSON.stringify( itemValue ) );
    } catch(e) {}
    return;
}
function localdelete( itemKey ) {
    try {
        return window.localStorage.removeItem( itemKey )
    } catch(e){}
    return false;
}

function localfetch( itemKey ) {
    var item = window.localStorage.getItem( itemKey )
    try{
        var json_item = JSON.parse(item);
        return json_item
    } catch(e) {
        console.log('Error getting key', itemKey, e)
    }
    return null;
}

////////////////***********************////////////////////////

/// Manage Local User Data --

function save_signedin_user( curr_user_data ) {
    localstore("user_data", curr_user_data);
    bit_db.save( "user_data", curr_user_data, function( tx, sql ) {});            
}


function reset_local_data() {
    
    localdelete("realtime");
    localdelete("note_blacklist");
    localdelete("notifications");
    localdelete("stash");            
    
    localdelete("user_data");
    localdelete("share_accounts"); //  we don't store share accounts in SQL
    localdelete("no_expand_domains");            
    
    bit_db.remove("notifications", delete_sql_handler );
    bit_db.remove("no_expand_domains", delete_sql_handler );
    bit_db.remove("user_data", delete_sql_handler );
    bit_db.remove("domain", delete_sql_handler );
    bit_db.remove("auto_expand_urls", delete_sql_handler );
    bit_db.remove("enhance_twitter_com", delete_sql_handler );            
}

function delete_sql_handler() { /* this is just a callback for deletes, check for success / failure, todo */  }

function initilaize_with_signin_info(){
    trends_watch_and_alert(); // trending check
    chrome.browserAction.setPopup({ "popup" : "popup.html"});  
    if(!context_menu_added) {
        contextmenu_add_link();                        
        context_menu_added=true;
    }                      
}

////////////////***********************////////////////////////

// Sharing and Social Accounts Connection

function share_message( message, callback) {
    var a = localfetch("share_accounts"),
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
    bitly.share( params, function(jo) {
        if (jo.status_code === 403) {
            // issue #8, explicitly sign out!
            sign_out();
            jo.error = true;
        }
        callback(jo);
    } );
}
////////////////***********************////////////////////////

///
function logger( message ) {
    var logs = localfetch("logs") || [];
    logs.push({ timestamp : _now(), 'message' : message });
    // drop old messages
    if(logs.length > 100) { logs = logs.slice(50); }
    localstore("logs", logs);
}

// GET and SET
function get_logs() {
    return localfetch("logs") || [];
}


/* 
    No 'expand' domains are domains / hosts that 
    expand_and_meta (info,clicks,expand calls) will NOT be made
    
    User Controlled value, except for bit.ly and j.mp
*/

function add_no_expand_domain( domain_host  ) {
    var domains = get_no_expand_domains();
    
    if(domains.indexOf( domain_host ) > -1 ) { return; }
    
    domains.push(domain_host);
    bit_db.save("no_expand_domains", domains, function() {
        logger("Update no expand domains to local SQL: " + domain_host);
    
    })
    localstore("no_expand_domains", domains);
}
function remove_no_expand_domain( domain_host ) {
    var domains = get_no_expand_domains(), pos = domains.indexOf( domain_host );
    if(pos > -1) {
        domains.splice(pos, 1);
        localstore("no_expand_domains", domains);
        bit_db.save("no_expand_domains", domains, function() {
            //
        });
    }

}
         
function get_no_expand_domains() {
    var domains_list = localfetch("no_expand_domains");
    if(!domains_list) {
        domains_list = ["bit.ly", "j.mp"];
        localstore("no_expand_domains", domains_list);
        bit_db.save("no_expand_domains", domains_list, function() {
        
        });
    }
    
    return domains_list;
}




/*   MAnaging Domains  */
function fetch_all_domains() {
    bitly.bitly_domains( function(jo) {
        var bit_domains = jo.reverse(), params = { 'domains' :  bit_domains, 'timestamp' : _now() };
        
        if(jo.status_code === 403) {
            sign_out();
        } else {
            bit_db.save( "domains_list", params, function() {
                console.log("storing domains to sql", bit_domains.length)
            })
            domains_list = bit_domains;
        }
    });
}
function clear_domain_list() {
    domains_list = [];
    bit_db.remove( "domains_list" , function() {
        console.log("success deleting domains list", arguments)
    })
}

function parse_domains( url_list ) {
    var final_list = [],
        regex = new RegExp("(?:https?://){1}([^/]*)/(?:.*)", 'i'),
        matches, md5_domain, i=0, url;
    for( ; url=url_list[i]; i++) {
        matches = url.match(regex)
        if(matches && matches.length > 1) md5_domain = hex_md5( matches[1] );
        else  {
            md5_domain = null;
            continue;
        }
        final_list.push({ 'md5' : md5_domain, 'short_url' : url })
    }
    
    return final_list;
}

function process_domains( url_list ) {
    var i=0, j=0, domain, possible,
        possible_domains = parse_domains( url_list ),
        total_possible = possible_domains.length,
        l = domains_list || [], final_results = [];
    
    
    if(possible_domains <= 0 ) return;
    
    if(l.length > 1 ) {
        // JS Definitive Guide page 90, 6.10 labels
        // Avoids having to recaluate .length on domains_list, which is ~3100 items
        // label allows inner loop to break outer loop
        outerloop:
            for( ; domain = l[i]; i++) {
                innerloop:
                    for(j=0; possible=possible_domains[j]; j++) {
                        if(possible.md5 === domain ) {
                            final_results.push(possible.short_url); // positive match
                            if(final_results.length >= total_possible) {  break outerloop; }
                        }
                    }
            }
    } else { final_results = url_list; }
    return final_results;
}
////////////////***********************////////////////////////


/*  Notification Preferences: enabled, threshold etc   */
function get_note_preferences() {
    // 20 days later, this was kinda genius - good job me. the only thing that doesn't suck
    var default_pref = { 'enabled' : true, 'threshold' : 20, "interval" : 1, "interval_type" : 'hour' };
    return localfetch("note_preferences") || default_pref;
}

function set_note_preferences( pref_obj ) {
    // add the keys that exist, save it
    var prefs = get_note_preferences(), keys = ["enabled", "threshold", "interval", "interval_type"];
    for(var k in pref_obj) {
        if( keys.indexOf( k ) === -1 ) { continue; }
        prefs[k] = pref_obj[k];
    }
    localstore("note_preferences", prefs);
    bit_db.save("note_preferences", prefs, function() {
        // do something with save...
    });
    
}

////////////////***********************////////////////////////
/*
 ________________
< notificiations >
 ----------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
*/


/*  Notification storage and retrevial   */
function notification_get_latest() {
    var notes = localfetch("notifications") || [];
    return notes;
}

function notification_remove() {
    var notes = notification_get_latest();
    notes.shift();         
}

function notification_set_list( notes_list ) {
    localstore("notifications", notes_list);
}

function notification_set( note ) {
    var notes = localfetch("notifications") || [];
    for(var i=0, notice; notice=notes[i]; i++) {     
        if(note.short_url === notice.short_url) {
            return;
        }
    }
    notes.push(  note );   
}
function notification_close_action( evt ){
    console.log("close the", evt, arguments)
}


// convenience method
function notification_display() {
    bitNote.show();
}
function notification_process_realtime_post( short_urls ) {
    var r_time = localfetch("realtime"), bit_result, i=0, black_list=[], active_links = [],
        notes_list = [], l_notes = notification_get_latest(),
        prefs = get_note_preferences();
    
    if(short_urls.length <= 0 ) { return; }
    r_time = r_time && r_time.realtime_links || [];
    
    
    bitly.expand_and_meta( short_urls, function(jo) {
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
        notification_set_list( l_notes );
        
        if(l_notes.length > 0 ) {
            notification_display();
        }
        
        trends_update_worker_blacklist( black_list, bitly.bit_request.access_token );
        expire_old_blacklist();
    
    });
}
////////////////***********************////////////////////////



function add_to_notes_blacklist( new_notes ) {
    // these are just items we don't want to see again
    var notes = localfetch("note_blacklist") || [];
    
    for(var i=0,note;note=new_notes[i]; i++) {
        if(notes.indexOf( note ) > -1) {
            continue;
        }
        notes.push( note );
    }
    
    console.log( notes, "add these to temp blacklist" );
    localstore("note_blacklist", notes);
}

function expire_old_blacklist() {
    /*
        Any url that's not in the in 'alive_list' take out of the expiration list.
    */
    var notes = localfetch("note_blacklist") || [], new_notes=[], r_time = localfetch("realtime");
    
    r_time = r_time && r_time.realtime_links || [];
    
    outerLoop_expire:
    for(var i=0, note; note=notes[i]; i++) {
        for(var j=0; j<r_time.length; j++) {
            
            if( note.indexOf( r_time[j].user_hash ) > -1  ) {
                new_notes.push(  note );                
                continue outerLoop_expire;
            }
        }

    }
    localstore("note_blacklist", new_notes);    
    
    
}

////////////////***********************////////////////////////

/*  Trend Worker  | trending worker, trends work */
// Trending...
function trends_watch_and_alert() {
    return;
    
    console.log("trending interval check started");
    //logger("Watch and Alert for a link has been enabled, notifications");
    if(!bitly.bit_request.access_token) {
        console.log("no token to poll with");
        // throw an error here.... 
        return;
    }
    var black_list=[], note_blacklist = localfetch("note_blacklist") || [];
    
    // console.log("starts with", note_blacklist)
    var params = {
        'oauth_key' : bitly.bit_request.access_token,
        'black_list' : note_blacklist,
        'action' : 'start'
    }
    trends_worker.postMessage( params );
}
function trends_update_worker_blacklist( black_list, bitly_token ) {
    if(black_list.length > 0) {            
        var note_b_list = localfetch("note_blacklist") || [],
            params = {
                'oauth_key' : bitly_token, // keep passing this in...
                'black_list' : note_b_list.concat( black_list ),
                'action' : 'update'
            }
        trends_worker.postMessage( params );  // Updating the worker
    }
}
function trends_worker_message_event( evt ) {
    // console.log(evt, "the worker says?")
    // console.log(evt.data, "trend data")
    
    
    if(!evt.data.trending_links) {
        return;
    }
    
    
    localstore("realtime", evt.data.trending_links );
    
    var lists = evt.data.remove_list || [], black_list=[];
    for( var i=0,item; item = lists[i]; i++ ) {
        black_list.push( item.short_url );
    }

    
    var prefs = get_note_preferences();
    
    if(prefs.enabled) {
        notification_process_realtime_post( evt.data.notifications  );
    }
}


////////////////***********************////////////////////////


// Chrome specifics
// wrapper method to chrome.tabs.update || chrome.tabs.create
function get_chrome_page( page_name ) {
    var url =  chrome.extension.getURL(page_name),
        curr_tab, i=0,
        createTab=true, params = { 'selected' : true, 'url' : url };
    chrome.tabs.getAllInWindow(null, function(tab_array) {
       
       for(; curr_tab=tab_array[i]; i++) {
           
           if( curr_tab.url === url ) {
               createTab=false;
               chrome.tabs.update( curr_tab.id, params);
               break;
           }
       }
        if(createTab) { chrome.tabs.create( { 'url' : chrome.extension.getURL(page_name) }) }
    });
}



/////// Context Menu
///// Context Menu (right click menu)
function contextmenu_add_link() {
    var params = {
        'type' : 'normal',
        'title' : 'Shorten and copy link with bit.ly',
        'contexts' : ["link"],
        'onclick' : _contextmenu_on_link_click,
        'documentUrlPatterns' : ['http://*/*', 'https://*/*']
    }

    chrome.contextMenus.create(params, function() {});
}
function _contextmenu_on_link_click( info, tab ) {
    //http://code.google.com/chrome/extensions/contextMenus.html
    // info from the tab, shoot a message in
    var long_url = info.linkUrl && info.linkUrl.trim(), expand_meta_data;
    if(long_url !== "" ) {
        bitly.shorten( info.linkUrl.trim(), function(jo) {
            if(jo && jo.status_txt && jo.status_txt === "ALREADY_A_BITLY_LINK") {
               _util_expand_and_reshorten( long_url  );
            } else if(jo && jo.url && jo.url !== "") {
                // can I get a callback from this? -- check if it's true?
                copy_to_clip(jo.url);
                if( get_notify_on_context_menu_shorten() ) {
                    contextmenu_inject_pagebanner( tab.id );
                }

            }
        }); 
    }
}

function contextmenu_inject_pagebanner( tab_id  ) {
    // chrome.tabs.insertCSS(tab_id, {file : "css/urlexpander.css"});
    chrome.tabs.executeScript(tab_id, {
        file : "js/content_scripts/bitly.contextMenuNotification.js"
    })
}

function _util_expand_and_reshorten( long_url ) {
    bitly.expand( long_url, function(jo) {
        expand_meta_data = jo&&jo.expand&&jo.expand.pop();
        if(!expand_meta_data) { return; } // todo, bubble error??
        bitly.shorten( expand_meta_data.long_url, function(jo) {
            if(jo && jo.url && jo.url !== "") {
                copy_to_clip(jo.url);                                    
            }
        });
    });
}

// relies on DOM for this page, could create this on the fly...
function copy_to_clip( str_value  ) {
    var txt_area = _id("instant_clipboad_copy_space");
    try {
        txt_area.value=str_value;
        txt_area.select();
        document.execCommand("copy", false, null);  
    } catch(e){}            
}