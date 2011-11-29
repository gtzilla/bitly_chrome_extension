// 
//  bExt.popup.Dompage.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-04-26.
//  Copyright 2011 the public domain. All rights reserved.
// 

/*
    Representation of the Popup DOM
        An API of sorts for the popup 
            HTML interface

        Usage:
            page = new bExt.popup.Dompage( { .. })
            page.update( .. )

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
        reset_bttn : "#reset_button",
        all_copy_els : "#copy_elements_wrapper",
        opt_page : "#options_page",
        sharing_accnts : "#sharing_accounts_display",
        share_controls : "#share_controls",
        trending : "#trending_box",
        message : "#message_box"
    }, $txtarea, $counter_elem, active_accounts=[];
    
    bExt.popup.Dompage = function( el_opts ) {
        // stateful
        elem_opts=$.extend(true, {}, elem_opts, el_opts );

        // do a little setup
        $txtarea=$(elem_opts.textarea);
        $counter_elem=$(elem_opts.char_count);
        add_listeners();
        add_sharing_events();
        
        // grab info
        bExt.popup.phone( {'action' : 'share_accounts' }, list_accounts_callback );        
        bExt.popup.phone({ 'action' : 'realtime_metrics' }, realtime_metrics_callback );                
        return this;
    }
    
    // prototype, duh
    bExt.popup.Dompage.prototype={
        reset_flag : false,
        short_link:null,
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
        
        show_reset : function() {
            var stsh_txt=bExt.popup.stash_txt(),
                basic_stash=bExt.popup.basic_stash();
            if(!this.reset_flag && stsh_txt && stsh_txt !== "" && basic_stash !== stsh_txt ) {
                this.reset_flag=true;
                console.log("show the reset");
                $(elem_opts.reset_bttn).fadeIn("fast");                
            }            

        },
        
        set_url : function( url_value ) {
            this.short_link = url_value;
            $(elem_opts.all_copy_els).fadeIn();
            $(elem_opts.url_pasteboard).val( url_value );
        },
        
        
        share_txt : function( txt ) {
            this.show_reset();

            var existing_txt=$(elem_opts.textarea).val();
            if(existing_txt) {
                txt = existing_txt + " " + txt;
            }
            $(elem_opts.textarea).val( txt );
        },
        
        reset_share : function() {
            $txtarea.val( bExt.popup.basic_stash( true ) );
            $(elem_opts.reset_bttn).fadeOut();
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
    function add_listeners( ) {
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
                
    }
    
    function add_sharing_events() {
        
        // Keyup Event Watch for primary text area
        $(elem_opts.textarea).bind("keyup", function(e) {
            update_char_count();
            // hrm
            bExt.popup.page.show_reset();
            // save the stash text more often
            bExt.popup.save_active_stash();
        });
        
        
        // User Sharing (social netwrorks) display 
        // Account on / off updates
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
        
        // Share Form Submit
        // Send message to background via bExt.popup.phone( ... );
        $(elem_opts.share_form).bind('submit', function(e) {
            e.preventDefault();
            var txt = $txtarea.val(), params = {

                'action' : 'share',
                share_link:bExt.popup.page.short_link
            };
            if(txt !== "" && active_accounts.length > 0 ) {
                params.share_text = txt;
                bExt.popup.update_stash( txt );
                bExt.popup.save_active_stash();
                
                $(elem_opts.small_preloader).fadeIn();
                $(elem_opts.share_bttn).fadeOut("fast");
                
                bExt.popup.phone( params, share_callback );
                
            } else {
                console.log("nothing to share, error the UI");
                $(elem_opts.share_bttn).fadeIn("fast");
                $(elem_opts.small_preloader).fadeOut();                
            }
        });
        
        // Open Options Page from the 'message' HTML box
        // this box appears after certain share events, such as user logged out
        $(elem_opts.message).click(function(e) {
            if(e.target.className === "open_options_page") {
                e.preventDefault();
                bExt.popup.phone( {'action' : 'open_page', 'page_name' : 'options.html' }, function(){} );
            }            
        });
        
        // Reset the Share text to the original page title and URL
        $(elem_opts.reset_bttn).click(function(e) {
            e.preventDefault();
            bExt.popup.page.reset_share();
        });
    }
    
    /*
        Realtime Metrics 
            -- Preview / Teaser 
        
    */
    function realtime_metrics_callback( jo ) {

        var realtimes = jo && jo.realtime_links || [], i=0, realtime, total_clicks=0, 
            message="No trending links, have you shared any recently?";
        
        if(!jo || !jo.realtime_links || jo.error) {
            console.log("no realtime links");  
        }

        for( ; realtime=realtimes[i]; i++) {
            total_clicks+=realtime.clicks;
        }
        if(total_clicks>0) {
            message = "<span class='trend_hed'>Trending<\/span>: " + total_clicks + " clicks on <a class='trending_links' href='#'>" + realtimes.length + " links<\/a>";
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
        var share_message="Error, during share";
        if(jo.status_code === 403 ) {
           share_message  = "Error, not signed in <a class='open_options_page' href='#'>Sign In<\/a> now"
           display_share_response_message(share_message);            
           return;           
        } else if(jo.status_code) {
            display_share_response_message(share_message);            
            return;
        }

        var i=0, accounts=jo && jo.share || [], 
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
    
    // Triggered from setTimeout
    function close_message_box() {
        $( elem_opts.message ).fadeOut("fast", function() {
            $txtarea.val( bExt.popup.stash() );
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
    
})(window);
