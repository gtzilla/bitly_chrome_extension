// 
//  bExt.popup.Stash.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-04-27.
//  Copyright 2011 the public domain. All rights reserved.
// 

(function(window, undefined) {

/*
    Represent Current Meta Data for Popup

        text
        long url
        short url
        id (tab)
        
        Usage:
            var stash = new bExt.popup.Stash({ ... });
            
            stash.display() // return the text for stash
*/
window.bExt.popup.Stash = function( curr_tab ) {
    this.__m = {
        'id' : curr_tab && curr_tab.id, // tab id
        'url': curr_tab && curr_tab.url,
        'text' : '',
        'short_url' : '',
        'title' : curr_tab && curr_tab.title,
        'timestamp' : (new Date()).getTime()
    };
    // todo, consider using the base64 of the long URL as the ID...
    // this is interesting b/c you could move the url to a diff tab
    this.id=curr_tab.id;
}
window.bExt.popup.Stash.prototype = {
    // output the correct text
    display : function() {
        var txt = (this.__m['text'] || "").trim();
        if(txt && txt !== "") {
            return txt;
        }
        return this.basic();
    },

    basic : function( reset ) {
        if(reset) {
            this.__m['text']="";
        }

        return this.__m['title'] + " " + this.__m['short_url'];
    },

    toString : function() {
        return JSON.stringify(this.__m);
    },
    
    get : function(name) {
        return this.__m[name] || null;
    },
    set : function( name, value) {
        this.__m[name]=value;
    },
    
    out : function() {
        return this.__m;
    },

    update : function( meta_update, clear_short  ) {

        // pull the latest data into this.__m
        // okay, if we replace this entry... which is fine, we need to make sure more matches
        // the long url must match the curr long url
        if(this.__m.url !== meta_update.url && clear_short) {
            // reset short url, different page
            meta_update.short_url="";
        }
        $.extend( this.__m, meta_update );
    }

} 
   
})(window);

