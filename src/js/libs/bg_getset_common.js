// 
//  bg_getset_common.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-03-16.
//  Copyright 2011 the public domain. All rights reserved.
// 

/*
        Just a dumping of all the GET and SET stuff for the BG page...
        
        Note:
            This file relies on several background page specific global variables, it's messy, but it's happening
            SO - don't include this file on any other page...

            - bit_db [current instance of the "bitly" SQL, running against a basic table with two columns,  itemKey, itemValue]
            - bitly [current instance of bitly api, contains user credentials specific to the user]
            - domains_list [in memory list of md5 domains]


            File also contains references to chrome.* object        
            

*/ 

// 
function get_notify_on_context_menu_shorten() {
    return localfetch("notify_on_context_menu_shorten");
}
function set_notify_on_context_menu_shorten( s_bool ) {
    localstore("notify_on_context_menu_shorten", s_bool );
    notify_on_context_menu=s_bool;
    // return notify_on_context_menu;
}


// get realtime metrics from local cache
function get_realtime_metrics( callback ) {
    var minues=1, realtime = localfetch("realtime"), now = _now(),
        then = now - (1000*30), trends;
    callback( realtime );
}

// Copy to Clipboard Preferences
function get_auto_copy() {
    return localfetch("auto_copy");
}
function set_auto_copy( copy_bool ) {
    localstore("auto_copy", copy_bool);
    bit_db.save("auto_copy", {'copy' : copy_bool }, function(){
        // save was successful
    });
    
}
//////////////////*******************//////////////////

// The API Domain to use (j.mp or bit.ly)
function get_api_domain() {
    return bitly.get_domain();
}

function set_api_domain( api_domain ) {
    var api_change = bitly.set_domain( api_domain );
    if(api_change) {
        localstore("domain", api_domain);
        bit_db.save("domain", api_domain, function() {
            // anything here
        });
    }
}

//////////////////*******************//////////////////

// Twitter Enhance, adds a SHORTEN button to twitter when enabled
function set_enhance_twitter_com( bool_value ) {
    enhance_twitter_com=(bool_value) ? true : false;
    bit_db.save("enhance_twitter_com", { 'enhance_twitter_com' : enhance_twitter_com }, function() {
        //anything here
    });            
}

function get_enhance_twitter() {
    return enhance_twitter_com;
}


//////////////////*******************//////////////////


// this is kinda gross since it relies on a global VAR
function get_url_expansion() {
    // this is a boolean, whether the bitly.urlexpander.js script will be loaded to the page.
    return auto_expand_urls;
}

function set_url_expansion( bool_value) {
    auto_expand_urls = (bool_value) ? true : false;
    bit_db.save("auto_expand_urls", { 'auto_expand' : auto_expand_urls }, function() {
        //anything here
    });
}

//////////////////*******************//////////////////

/// Sets from CACHE
function set_no_expand_domains_from_cache() {
    var no_expand_domains = localfetch("no_expand_domains");
    
    if(!no_expand_domains || no_expand_domains.length <= 0) {
        bit_db.find("no_expand_domains", function(  domains_list ) {
            
            if(!domains_list) {
                no_expand_domains = ["bit.ly", "j.mp"];
                bit_db.save("no_expand_domains", no_expand_domains, function() {
                    localstore("no_expand_domains", no_expand_domains);
                })
            } else {
                localstore("no_expand_domains", domains_list);
            }
        })
    }
}

function set_auto_copy_from_cache() {
    bit_db.find("auto_copy", function(jo) {
        if(jo === undefined) return;
        localstore("auto_copy", jo.copy );
    })
}



function notification_sets_from_cache() {
    bit_db.find("notifications", function(jo) {
        if(jo === undefined) return;
        localstore("notifications", jo );
    })
}


function set_auto_expand_from_cache() {
    bit_db.find("auto_expand_urls", function(jo) {
        if(jo === undefined) auto_expand_urls=true
        else auto_expand_urls = jo.auto_expand;
    })
}
function set_enhance_twitter_com_from_cache() {
    bit_db.find("enhance_twitter_com", function(jo) {
        if(jo === undefined) enhance_twitter_com=true
        else enhance_twitter_com = jo.enhance_twitter_com;
    })
}        

function set_api_domain_from_cache() {
    bit_db.find("domain", function(domain_string) {
        bitly.set_domain( domain_string )
    });
}

function set_note_preferences_from_cache() {
    bit_db.find("note_preferences", function(jo) {
        if(jo===undefined) {return;}
        localstore("note_preferences", jo);
    })
}
function set_current_bitly_user_from_cache() {
    var user_data = localfetch("user_data"), domain = localfetch("domain");
    /*
        Makes determination if used is logged in, toggles 'popup' behavior accordingly
            Default popup behavior is to load options.html, login page
    */
    
    if(user_data && user_data.x_login && user_data.x_apiKey) {
        logger("User credentials found in cache");
        bitly.set_credentials( user_data.x_login, user_data.x_apiKey, user_data.access_token );
        initilaize_with_signin_info();
    
    } else {
        bit_db.find("user_data", function( sql_user_data ) {
            if(!sql_user_data || !sql_user_data.x_login) { return; }
            localstore("user_data", sql_user_data);
            // stash credentials into bitly API
            bitly.set_credentials( sql_user_data.x_login, sql_user_data.x_apiKey, sql_user_data.access_token );
            initilaize_with_signin_info();
        });
    }
}
function set_domain_list_from_cache() {

    bit_db.find("domains_list", function(jo) {
        var now =  _now(), then = now - (24*60*60*1000)*5, curr_user;
        if(jo && jo.timestamp > then && jo.domains.length > 10) {

            domains_list = jo.domains || jo;
        } else {
            curr_user = localfetch("user_data") || {};
            if( bitly.is_authenticated() ) {
                fetch_all_domains();
            } else {
                domains_list=[];
            }
        }

    });
}
function initialize_data_from_local_cache() {
    set_current_bitly_user_from_cache();
    set_domain_list_from_cache();
    set_auto_expand_from_cache();
    set_api_domain_from_cache();
    set_no_expand_domains_from_cache();
    set_auto_copy_from_cache();
    notification_sets_from_cache();
    set_enhance_twitter_com_from_cache();    
}





//////////////////*******************//////////////////