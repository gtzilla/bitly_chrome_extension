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
    'share' : null,
    
    'Sharing' : function() {
        /*
            Share a little Share
                Handle Sharing
        */
    },
        
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
    
    // notifications preferences (settings and whatnot)
    note_prefs : function() {
        var default_pref = { 'enabled' : true, 'threshold' : 20, "interval" : 1, "interval_type" : 'hour' };
        return bExt.info.get("note_preferences") || default_pref;
    },
    
    // get all the notes resolves
    note_resolve : function( short_urls ) {
        var r_time = bExt.info.get("realtime"), 
            bit_result, i=0, black_list=[], active_links = [],
            notes_list = [], l_notes = bExt.info.get("notifications") || [],
            prefs = get_note_preferences();

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
            notification_set_list( l_notes );

            if(l_notes.length > 0 ) {
                notification_display();
            }

            bExt.trends.update_links( black_list, bExt.api.bit_request.access_token );
            bExt.trends.expire_links();

        });        
    },
    
    // start the bitly API ref
    init_api : function() {
        if(!bitly_oauth_credentials || !bitly_oauth_credentials.client_id) { return false; }
        
        // create a new instance
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
    
    //
    
        
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
                window.localStorage.setItem( k, window.JSON.stringify( v ) );
                return true;
            } catch(e) {}
            return false;   
        },
        '__data' : {},
        'load_cache' : function() {
            // everything from the cache
        },
        
        'clear' : function(itemKey) {
            try {
                window.localStorage.removeItem( itemKey );
                return true;
            } catch(e){ return false; }
            return false;            
        }
    }
}


/*
    Trends
        -- workers etc
*/

bExt.trends = {
    worker : null,
    init : function() {
        bExt.trends.expire_links();
        bExt.trends.worker = new Worker("js/workers/realtime_data.js");
        bExt.trends.worker.onmessage = bExt.trends.worker.m_evt;
        bExt.trends.watch();
    },
    
    m_evt : function(evt) {
        var lists, i, black_list=[], prefs=bExt.note_prefs();
        
        if(!evt.data.trending_links) {
            return;
        }
        bExt.info.set("realtime", evt.data.trending_links );
        lists = evt.data.remove_list || [];
        for( i=0,item; item = lists[i]; i++ ) {
            black_list.push( item.short_url );
        }
        if(prefs.enabled) {
            bExt.note_resolve( evt.data.notifications  );
        }        
    },
    
    watch : function() {
        // watch and alert
        console.log("trending interval check started");
        if(!bExt.api.bit_request.access_token) {
            console.log("no token to poll with");
            // throw an error here.... 
            return;
        }
        
        var black_list=[], 
            note_blacklist = bExt.info.get("note_blacklist") || [], 
            params = {
                'oauth_key' : bExt.api.bit_request.access_token,
                'black_list' : note_blacklist,
                'action' : 'start'
            }
        bExt.trends.worker.postMessage( params );        
    },
    
    update_links : function( black_list, bitly_token ) {
        if(black_list.length > 0) {            
            var note_b_list = bExt.info.get("note_blacklist") || [],
                params = {
                    'oauth_key' : bitly_token, // keep passing this in...
                    'black_list' : note_b_list.concat( black_list ),
                    'action' : 'update'
                }
            if(bExt.trends.worker) {
                bExt.trends.worker.postMessage( params );  // Updating the worker                
            } else {
                console.log("no trends worker");
            }

        }        
    },
    
    expire_links : function() {
        // expire blacklinks
        var notes = bExt.info.get("note_blacklist") || [], 
            new_notes=[], i, j, note,
            r_time = bExt.info.get("realtime");

        r_time = r_time && r_time.realtime_links || [];

        outerLoop_expire:
        for(i=0, note; note=notes[i]; i++) {
            for(j=0; j<r_time.length; j++) {

                if( note.indexOf( r_time[j].user_hash ) > -1  ) {
                    new_notes.push(  note );                
                    continue outerLoop_expire;
                }
            }

        }
        bExt.info.set("note_blacklist", new_notes);        
    }
}

// todo,
// move this elsewhere
Function.prototype._scope = function( scope ) {
    var self=this;
    return function() { self.apply( scope, Array.prototype.slice.call( arguments, 0 ) ); }
}



bExt.Sharing.prototype={
    
}

})(window);

/*  EOF */
