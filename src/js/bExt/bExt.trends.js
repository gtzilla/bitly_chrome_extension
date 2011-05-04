// 
//  bExt.trends.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-05-04.
//  Copyright 2011 the public domain. All rights reserved.
// 


(function(window, undefined) {
    
window.bExt.trends = {

    worker : null,
    init : function() {
        bExt.trends.expire_links();
        if(!bExt.trends.worker) {
            console.log("Trends worker created");
            bExt.trends.worker = new Worker("js/workers/realtime_data.js");
            bExt.trends.worker.onmessage = bExt.trends.m_evt;            
        }
        setTimeout(bExt.trends.watch, 100);
    },

    exit : function() {
        if(bExt.trends.worker) {
            bExt.trends.worker.terminate();
            bExt.trends.worker=null;
        }

        return true;
    },

    m_evt : function(evt) {
        var lists, i, black_list=[], prefs=bExt.note_prefs(), item;
        console.log("message calls back");
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

    update_blacklist : function( new_notes ) {
        var notes = bExt.info.get("note_blacklist") || [];

        for(var i=0,note;note=new_notes[i]; i++) {
            if(notes.indexOf( note ) > -1) {
                continue;
            }
            notes.push( note );
        }
        bExt.info.set("note_blacklist", notes);        
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
    
})(window);