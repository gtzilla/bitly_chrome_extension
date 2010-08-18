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
function get_auto_copy() {
    return localfetch("auto_copy");
}
function set_auto_copy( copy_bool ) {
    localstore("auto_copy", copy_bool);
    bit_db.save("auto_copy", {'copy' : copy_bool }, function(){
        // save was successful

    });
    
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
////////////////***********************////////////////////////


/*  Notification Preferences: enabled, threshold etc   */
function get_note_preferences() {
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



/*  Notification storage and retrevial   */
function get_latest_notifications() {
    var notes = localfetch("notifications") || [];
    return notes;
}

function remove_notification() {

    var notes = get_latest_notifications();
    notes.shift();
    console.log("try and remove ", notes)
    __process_notification_for_db( notes );

         
}

function __process_notification_for_db( notes ) {
    localstore("notifications", notes);
    if(notes.length > 0) {
        bit_db.save("notifications", notes, function() {
            // save success...
            console.log("set note", arguments)        
        });        
    } else {
        bit_db.remove("notifications", function(){} );
    }    
}

function set_notification( note ) {
    var notes = localfetch("notifications") || [];
    notes.push(  note );
    __process_notification_for_db( notes );

}
////////////////***********************////////////////////////


/*  Watch List */
function get_watch_list() {
    return localfetch("watch_list") || [];
}

function set_watch_item( short_url, threshold ) {
    var list = localfetch("watch_list") || [];
    list.push( {'short_url': short_url, 'threshold': threshold, 'timestamp' : _now() } );
    set_watch_list( list );
    
    // set timeout or set interval?????
    
    // I can send the entire watch list, the callback should just loop over the results....
}
function set_watch_list( watch_list ) {
    // careful, overwrites, doesn't append
    console.log(watch_list)
    localstore("watch_list", watch_list)
    
    
    if(watch_list.length > 0) {
        bit_db.save("watch_list", watch_list, function(tx, sql_result) {
            // something
        });        
    } else {
        // drop it
        bit_db.remove("watch_list", function(){} );
    }
    

}

function remove_watch_item( short_url ) {
    var latest_watch_list = get_watch_list(), i=0, watch_item, clean_list=[];
    for( var i=0, watch_item; watch_item=latest_watch_list[i]; i++) {
        if(watch_item.short_url !== short_url) {
            clean_list.push( watch_item );
        }
    }
    set_watch_list( clean_list );           
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