// 
//  bExt.trends.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-05-04.
//  Copyright 2011 the public domain. All rights reserved.
// 


(function(window, undefined) {
    
window.bExt.trends = {
    active:false,
    worker : null,
    beginPoll: function() {
        console.log("polling call", Date.now(), new Date())
        if(bExt.trends.active) {
            return;
            //clearInterval(bExt.trends.active);

        }
        bExt.trends.expire_links();
        bExt.trends.active=setInterval(function() {
            console.log("check trends", Date.now())
            // make a remote call, parse the shit
            // send to nofitifcations
            bExt.trends.phoneRemoteServer();
        }, 30000);
    },
    init : function() {
        bExt.trends.expire_links();
        bExt.trends.beginPoll();
        //setTimeout(bExt.trends.watch, 100);
    },
    
    phoneRemoteServer:function() {
        // Call the bitly API
        bExt.api.realtime(function(data){
            if(!data) return;
            var links = data.realtime_links, 
                notifications=[], remove_list=[];
            
            var black_list=bExt.info.get("note_blacklist");

            outerLoop: for(var i=0,link; link=links[i]; i++) {

                for(var j=0,short_url; short_url=black_list[i]; i++) {
                    var pieces = short_url.split("/"), hash = pieces.pop();
                    if( hash === link.user_hash ) {
                        continue outerLoop;
                    }
                }
                

                var shorty = "http://bit.ly/" + link.user_hash;
                notifications.push( shorty );

                
            }            
            // parse the data out
            var params={
                'notifications' : notifications,
                'trending_links' : data,
                'current_blacklist' : black_list
            }
            bExt.trends.m_evt(params);
        });
    },
    exit : function() {
        clearInterval(bExt.trends.active);
        return true;
    },

    m_evt : function(data) {
        var lists, i, black_list=[], prefs=bExt.note_prefs(), item;
        if(!data.trending_links) {
            return;
        }
        bExt.info.set("realtime", data.trending_links );
        lists = data.remove_list || [];
        for( i=0,item; item = lists[i]; i++ ) {
            black_list.push( item.short_url );
        }
        if(prefs.enabled) {
            bExt.note_resolve( data.notifications  );
        }        
    },

    watch : function() {
        // watch and alert
        // just do a poll
        console.log("trending interval check started");
        if(!bExt.api.bit_request.access_token) {
            console.log("no token to poll with");
            // throw an error here.... 
            return;
        }

        var black_list=[], 
            note_blacklist = bExt.info.get("note_blacklist") || [];

        bExt.trends.beginPoll();

    },

    update_links : function( black_list, bitly_token ) {
        if(black_list.length > 0) {            
            var note_b_list = bExt.info.get("note_blacklist") || [],
                params = {
                    'oauth_key' : bitly_token, // keep passing this in...
                    'black_list' : note_b_list.concat( black_list ),
                    'action' : 'update'
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
