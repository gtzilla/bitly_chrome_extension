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
        'is_chrome' : true,
        'auto_copy' : false,
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
            bExt.popup.page.update( s_url, active_stash.display(), settings.auto_copy );

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
        bExt.popup.page.update( active_stash.get("short_url"), active_stash.display(), settings.auto_copy );        
    },
    
    stash : function() {
        return active_stash.display();
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
    
    update_stash : function(stsh_txt) {
        active_stash.set("text", stsh_txt);
    },
    
    save_stash : function(id, value, payload) {
        var i=0, all_stash=bExt.info.get("popup_history") || [];
        for( ; i<all_stash.length; i++) {
            if( all_stash[i][id] === value ) {
                all_stash[i]=payload;
            } 
        }
        bExt.info.set("popup_history", all_stash);
    },
    
    
    // Events
    // DOM Event
    evt_unload : function(e) {
        e.preventDefault();
        active_stash.update({
            'text' : bExt.popup.page.get_text(),
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
        share_form : "#bitly_bento_submit",
        preloader : "#loading_short_url",
        small_preloader : "#share_loading_graphic",
        textarea : "#bento_share",
        url_pasteboard : "#bitly_short_url_area",
        char_count : "#char_count_box",
        share_bttn : "#sharing_buttons_box",
        copy_bttn : "#copy_link_button",
        all_copy_els : "#copy_elements_wrapper",
        opt_page : "#options_page",
        sharing_accnts : "#sharing_accounts_display",
        share_controls : "#share_controls",
        trending : "#trending_box",
        message : "#message_box",
    }, $txtarea, $counter_elem, active_accounts=[];
    
    bExt.popup.Dompage = function( el_opts ) {
        // stateful
        elem_opts=$.extend(true, {}, elem_opts, el_opts );
        // do a little setup?
        $txtarea=$(elem_opts.textarea);
        $counter_elem=$(elem_opts.char_count);
        add_listeners();
        bExt.popup.phone( {'action' : 'share_accounts' }, list_accounts_callback );        
        
        bExt.popup.phone({ 'action' : 'realtime_metrics' }, realtime_metrics_callback );                
        return this;
    }
    
    // prototype, duh
    bExt.popup.Dompage.prototype={

        // DOM
        update : function( s_url, share_txt, auto_copy  ) {
            this.hide_loader(); 
            this.set_url( s_url );
            this.share_txt( share_txt );
            this.counter();
            
            if(auto_copy) {
                this.copy_url();
            }            
        },
        
        copy_url : function() {
            $(elem_opts.copy_bttn).text("Copied");
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
        
        get_text : function() {
            return $txtarea.val();
        },

        hide_loader : function() {
            $(elem_opts.preloader).fadeOut("fast");
        },
        
        counter : function() {
            setTimeout(function() {
                var txt = $(elem_opts.textarea).val();
                $(elem_opts.char_count).html( txt.length + " characters" );
            }, 10);

        }

    }
    
    
    // utilties
    function add_listeners() {
        /*
            DOM Event Listeners. 
                Some send 'chrome' events in order to open the page
        */
        // Copy Button
        var $copy_bttn=$(elem_opts.copy_bttn);
        $copy_bttn.click(function(e) {
            e.preventDefault();
            copy_to_clipboard();
            $(this).text("Copied");
        });
                
        // 'chrome' options page / ext settings link
        $(elem_opts.opt_page).click(function(e) {
            e.preventDefault();
            bExt.popup.phone( {'action' : 'open_page', 'page_name' : 'options.html' }, function(){} );
        });
        
        // Open the trending page
        $(elem_opts.trending).click(function(e) {
            bExt.popup.phone( {'action' : 'open_page', 'page_name' : 'trending.html' }, function(){} );            
        });
                
        // additional listeners
        add_sharing_events();
    }
    
    function add_sharing_events() {
        //
        $(elem_opts.textarea).bind("keyup", function(e) {
            update_char_count();
        });
        
        
        // User Sharing (social netwrorks) display 
        $(elem_opts.sharing_accnts).click(function(e) {
            if(e.target.nodeName.toLowerCase() === "img") {
                var img = e.target, src = img.src,
                    status = (src.indexOf("on.png") < 0 ),
                    params = {'action' : 'activate_account'};
                params.account_id = img.id;
                params.active = status;
                bExt.popup.phone( params, list_accounts_callback )
            }            
        }); 
        
        $(elem_opts.share_form).bind('submit', function(e) {
            e.preventDefault();
            var txt = $txtarea.val(), params = {'action' : 'share' };
            if(txt !== "" && active_accounts.length > 0 ) {
                params.share_text = txt;
                bExt.popup.update_stash( txt );
                $(elem_opts.small_preloader).fadeIn();
                $(elem_opts.share_bttn).fadeOut("fast");
                
                bExt.popup.phone( params, share_callback );
                
            } else {
                console.log("nothing to share, error the UI");
                $(elem_opts.share_bttn).fadeIn("fast");
                $(elem_opts.small_preloader).fadeOut();                
            }
        });
        
        $(elem_opts.message).click(function(e) {
            if(e.target.className === "open_options_page") {
                e.preventDefault();
                bExt.popup.phone( {'action' : 'open_page', 'page_name' : 'options.html' }, function(){} );
            }            
        });
    }
    
    function update_char_count() {
        var txt = $txtarea.val();
        $counter_elem.text( txt.length + " characters" );
    }    

    // copy to pasteboard / clipboard
    function copy_to_clipboard() {
        $(elem_opts.url_pasteboard).get(0).select();
        document.execCommand("copy", false, null);        
    }
    
    
    /*
        Realtime Metrics 
            -- Preview / Teaser 
        
    */
    function realtime_metrics_callback( jo ) {
        if(!jo || !jo.realtime_links || jo.error) {
            console.log("error");
        }
        
        var realtimes = jo && jo.realtime_links || [], i=0, realtime, total_clicks=0, message;
        for( ; realtime=realtimes[i]; i++) {
            total_clicks+=realtime.clicks;
        }
        if(total_clicks>0) {
            message = "<span class='trend_hed'>Trending<\/span>: " + total_clicks + " clicks on <a class='trending_links' href='#'>" + realtimes.length + " links<\/a>";
        } else {
            message = "No trending links, have you shared any recently?";
        }
        
        $(elem_opts.trending).html( message );        
    }
    /*
        Sharing
        
            Callback & Display
            
            display the share ICON buttons 
            for active / inactive social network sharing accounts
    */
    function list_accounts_callback(jo) {
        var i=0, account, accounts = jo && jo.share_accounts, li, accnt_frag;
            
        active_account_list = [];
        var li_frag_lst=[];
        if(accounts.length > 0 ) {
            for( ; account=accounts[i]; i++) {

                if(account.active) {
                    active_accounts.push( account );
                }
                
                li = build_accounts_frag( account );                
                li_frag_lst.push(li);
            }

            
            accnt_frag = fastFrag.create([{
                type : "span",
                css : "share_account_header",
                content : "Active:"
            },{
                type : "ul",
                id : "share_accounts",
                content : li_frag_lst
            },{
                css : "hr",
                content :{
                    type : "hr"
                }
            }]);
            
            $(elem_opts.sharing_accnts).html('').append( accnt_frag );
            $(elem_opts.small_preloader).fadeOut("fast");
            $(elem_opts.share_controls).fadeIn();

        } else {
            // Hook, add a teaser or promo for Sharing Connection
            $(elem_opts.sharing_accnts).html( '' );
        }
        
    }
    
    function build_accounts_frag( acct_meta ) {
        var status = (acct_meta.active) ? "on" : "off";        
        return {
            type : "li",
            content : {
                type : "img",
                css : "account_icon",
                id : acct_meta.account_id,
                attrs : {
                    title : acct_meta.account_name || acct_meta.account_login,
                    src : "s/graphics/" + acct_meta.account_type+'-'+status + ".png",
                    alt : "",
                    border : 0
                }                
            }
        }
    } 
    
    
    function share_callback(jo) {
        console.log(jo, "share");
        if(jo.status_code === 403 ) {
            var share_message = "Error, not signed in <a class='open_options_page' href='#'>Sign In<\/a> now"
            
            display_share_response_message(share_message);
            return;                    
        } else if( jo.error ) {
            var share_message = "Error, during share";
            
            
            display_share_response_message(share_message);
            return;
        } else if(jo.share.length <=0) {
            return;
        }

        
        var i=0, accounts=jo && jo.share, 
            account, success_messages = 0, share_message;
        
        for( ; account=accounts[i]; i++) {
            if(!account.error) { success_messages +=1 } 
        }
        
        if(success_messages>0) {
            share_message = "Success. Shared your message on " + success_messages;
            share_message += " of " + accounts.length + " accounts";
        } else {
            share_message = "Oops, something went wrong. Didn't share to any accounts."
        }
        display_share_response_message( share_message );
        
    }   
    function display_share_response_message( share_message ) {
        $(elem_opts.small_preloader).fadeOut("fast");        
        $( elem_opts.message  ).html( share_message ).fadeIn();

        $txtarea.val('');
        $(elem_opts.share_bttn).fadeIn();
        setTimeout(close_message_box, 4000);                            
    }   
    function close_message_box() {
        $( elem_opts.message ).fadeOut("fast", function() {
            $txtarea.val( bExt.popup.stash() );
        });

    }      
    
    
})(window);



