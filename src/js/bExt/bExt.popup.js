// 
//  bExt.popup.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-04-19.
//  Copyright 2011 the public domain. All rights reserved.
// 
// dependencies: jQuery, fastFrag, bExt

(function(window, undefined){

var document=window.document, 
    settings={
        'is_chrome' : true
    }, active_stash;

window.bExt.popup={
    /*
            Entry Point Function. main
    */
    open : function( curr_tab ) {
        // called when the popup 'opens'
        console.log("chrome get tabs calls", settings);
        if(settings.is_chrome) {
            bExt.popup._chrome_open(curr_tab);            
        } else {
            console.log("not chrome, implement");
        }
    },
    
    // Variables / constants
    
    page : null,    
    
    init : function( user_settings ) {
        // setup page items
        settings=$.extend( true, settings, user_settings ) 

        if(!bExt.popup.page) {
            console.log("load page from init, not called");
            bExt.popup.page=new bExt.popup.Dompage();
        }
        // listeners
        addEventListener("unload", bExt.popup.evt_unload );        
    },    
    
    _chrome_open : function( curr_tab ) {
        var s_url;
        
        active_stash=new bExt.popup.Stash(curr_tab);
        active_stash.update( bExt.popup.find_stash( "url", curr_tab.url  ) || {} );
        
        console.log("active_stash", active_stash, active_stash.get("url"), active_stash.get("id"))
        s_url=active_stash.get("short_url");
        if(s_url && s_url !== "" ) {
            
            // get selected, fill out page
            bExt.popup.page.hide_loader(); 
            bExt.popup.page.set_url( s_url );
            bExt.popup.page.share_txt( active_stash.display() );
            bExt.popup.page.counter();

        } else {
            // shorten this link;           
            bExt.popup.phone({
                'action' : 'shorten_and_select',
                'long_url' : active_stash.get("url"),
                'tab_id' : active_stash.get("id")
            }, bExt.popup.chrome_shorten_callback );
        }
    },
    
    phone : function( message, callback ) {
        if(settings.is_chrome) {
            chrome.extension.sendRequest( message, callback );   
        } else {
            console.log("implement phone call to get short url back");
        }
    },
    
    chrome_shorten_callback : function(jo) {
        active_stash.set("short_url", jo&&jo.url || "");
        
        // do a display update event
        bExt.popup.page.set_url( active_stash.get("short_url") );        
        bExt.popup.page.hide_loader();        
        bExt.popup.page.share_txt( active_stash.display() );
        bExt.popup.page.counter();
    },
    
    find_stash : function( id, value  ) {
        var i=0, all_stash=bExt.info.get("popup_history") || [];
        for( ; i<all_stash.length; i++) {
            if( all_stash[i][id] === value ) {
                return all_stash[i];
            } 
        }
        return null;
    },
    
    save_stash : function(id, value, payload) {
        var i=0, all_stash=bExt.info.get("popup_history") || [];
        for( ; i<all_stash.length; i++) {
            if( all_stash[i][id] === value ) {
                return all_stash[i]=payload;
            } 
        }
        bExt.info.set("popup_history", all_stash);
    },
    
    
    // Events
    // DOM Event
    evt_unload : function(e) {
        e.preventDefault();
        active_stash.update({
            'text' : $(settings.share_box).val(),
            'timestamp' : (new Date()).getTime()
        });
        bExt.popup.save_stash( "url", active_stash.get("url"), active_stash.out()  );
    }
}







/*
    Represent Current Meta Data
        
        text
        long url
        short url
        id (tab)
*/
bExt.popup.Stash = function( curr_tab ) {
    
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
bExt.popup.Stash.prototype = {
    // do a better dump
    display : function() {
        var txt = (this.__m['text'] || "").trim();
        if(txt && txt !== "") {
            return txt;
        }
        return this.__m['title'] + " " + this.__m['short_url'];
    },
    
    toString : function() {
        return JSON.stringify(this.__m);
    },
    get : function(name) {
        return this.__m[name] || null;
    },
    
    out : function() {
        return this.__m;
    },
    
    set : function( name, value) {
        this.__m[name]=value;
    },
    update : function( meta_update  ) {
        
        // pull the latest data into this.__m
        // okay, if we replace this entry... which is fine, we need to make sure more matches
        // the long url must match the curr long url
        if(this.__m.url !== meta_update.url) {
            // reset short url, different page
            meta_update.short_url="";
        }
        $.extend( this.__m, meta_update );
    }
    
}
    
})(window);



/*
    Representation of the Popup DOM
        An API of sorts for the popup 
            HTML interface

        Usage
        
            new 

*/

(function(window, undefined) {
    
    var elem_opts = {
        preloader : "#loading_short_url",
        small_preloader : "#share_loading_graphic",
        textarea : "#bento_share",
        url_pasteboard : "#bitly_short_url_area",
        char_count : "#char_count_box",
        share_bttn : "#sharing_buttons_box",
        copy_bttn : "#copy_link_button",
        all_copy_els : "#copy_elements_wrapper"
    }
    
    bExt.popup.Dompage = function( el_opts ) {
        // stateful
        elem_opts=$.extend(true, {}, elem_opts, el_opts );
        // do a little setup?
        var $copy_bttn=$(elem_opts.copy_bttn);
        $copy_bttn.bind("click", function(e) {
            e.preventDefault();
            copy_to_clipboard()
            $(this).text("Copied")
        });
        return this;
    }

    function copy_to_clipboard() {
        $(elem_opts.url_pasteboard).get(0).select();
        document.execCommand("copy", false, null);        
    }

    bExt.popup.Dompage.prototype={

        // DOM
        copy_url : function() {
            copy_to_clipboard();
        },
        
        set_url : function( url_value ) {
            $(elem_opts.all_copy_els).fadeIn();
            $(elem_opts.url_pasteboard).val( url_value );
        },
        
        share_txt : function( txt ) {
            var existing_txt=$(elem_opts.textarea).val();
            if(existing_txt) {
                txt = existing_txt + " " + txt
            }
            $(elem_opts.textarea).val( txt );
        },

        hide_loader : function() {
            $(elem_opts.preloader).fadeOut("fast");
        },
        
        counter : function() {
            setTimeout(function() {
                var txt = $(elem_opts.textarea).val();
                $(elem_opts.char_count).html( txt.length + " characters" )
            }, 10);

        }

    }
    
    
})(window);



