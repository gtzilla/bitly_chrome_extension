// 
//  bExt.options_page.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-04-28.
//  Copyright 2011 the public domain. All rights reserved.
// 


(function( window, undefined) {
    
/*
    DOM Representation of the Settings / Options page (builtin chrome options page)
    
        Controls User Meta Data Settings and Configuration
        
*/

var settings={
    box : "#signedin_info_contents",
    signin_box : "#signedin_username",
    share_box : null, // set this dynimically, when elem created
    is_chrome : true
}, __lst=[];

window.bExt.options_page={
    
    //bExt.options_page.init
    init : function( opts_els ) {
        console.log("begin, bExt.options_page.init")
        settings=$.extend(true, {}, settings, opts_els );
        var udata = bExt.info.get("user_data");
        if(udata && udata.x_login) {
            
            $(settings.signin_box).text(udata.x_login + " | ");
            return true;
        }
        return false;
    },
    build_meta : function( meta_params ) {
        var m=new bExt.OptionMeta( meta_params  );
        
        // javascript fun, this is a reference. Objects are PASS BY REFERENCE
        // we can always access them, it's NOT A copy unless we go to serious lengths to ensure it.
        __lst.push(m);
        return m;
    },
    
    find_meta : function( uuid  ) {
        for(var i=0; i<__lst.length; i++) {
            if( __lst[i].get("uuid") === uuid) {
                return __lst[i];
            }
        }
        
        return null;
    },
    
    assemble : function() {
        var $box=$(settings.box);
        
        var lcl=bExt.options_page;
        
        // append To DOM
        $box.append( lcl.services() )
            .append( lcl.auto_copy() )
            .append( lcl.twitter() )
            .append( lcl.trends() )
            .append( lcl.hovercard_domains() )
            // .append( lcl.context_menu() )
            .append( lcl.api_domains() );
        
        // Events for newly appended DOM items
        lcl._attach_event();
    },
    
    //  Assign DOM Events for OptionMeta Objects list    
    _attach_event : function() {
        var lst = __lst, types = ["bind", "live"], 
            event_track, extras;
        
        for(var i=0; i<lst.length; i++) {
            extras=[];
            if(lst[i].event_method !== null ) {
                event_track=lst[i].get("evt_track");
                if(types.indexOf( event_track ) === -1) { event_track="bind"; }
               $( lst[i].el_selector || "#" + lst[i].get("id") )[event_track](lst[i].get("evt_type"), lst[i].event_method );
            }
            
            extras=lst[i].event_extras;
            for(var j=0; j<extras.length; j++) {
                if(!extras[j].evt_track) {
                    event_track="bind"; 
                } else {
                    event_track=extras[j].evt_track;
                }
                $(extras[j].selector)[event_track]( extras[j].evt_type, extras[j].event_method );
            }

        }        
    },
        
    auto_copy : function() {
        
        var opts_page_meta = bExt.options_page.build_meta({
            title : "Auto Copy Short Urls",
            enabled : bExt.info.get("auto_copy"),
            desc : "Automatically copy short urls to my clipboard when popup opens"
        }), frag=single_check_frag( opts_page_meta.out() );
        
        frag.content=frag.content.concat( hide_sharing_popup_frag( bExt.info.get("auto_copy"), bExt.info.get("disable_popup") ) );          
        // javascript fun, this is a reference. Objects are PASS BY REFERENCE
        opts_page_meta.event_method=bExt.option_evts.auto_copy;
        opts_page_meta.event_extras.push({
            selector : "#hide_sharing_input",
            evt_type : "change",
            event_method : bExt.option_evts.disable_popup
        })
        // return build( opts_page_meta );
        return fastFrag.create( frag );
    },
    
    twitter : function() {
        var opts_page_meta = bExt.options_page.build_meta({
            title : "Twitter Enhance",
            enabled : bExt.config.twitter_bttn(),
            label : "Enhance Twitter",
            desc : "Display a shorten button on twitter.com when I enter a long URL"
        });  
        
        opts_page_meta.event_method=bExt.option_evts.twitter;
        return build( opts_page_meta );
    },
    
    context_menu : function() {
        var opts_page_meta = bExt.options_page.build_meta({
            title : "Context Menu Notifications",
            label : "Show Success Notification",
            desc : "On webpages I visit, show a confirmation message when a link has been shorten via the context menu (right click menu) for valid URLs"
        });    
        return build( opts_page_meta );            
    },    
    
    trends : function() {
        
        var notice_prefs = bExt.note_prefs(),
            frag, opts_page_meta = bExt.options_page.build_meta({
            title : "Trend Notifications",
            label : "Enable Notifications",
            enabled : notice_prefs.enabled,
            desc : "Automatically notify me when my link starts to become popular, or trend. Notifications will be shown when a link reaches the threshold specified below during the past hour."
        });
        
        frag=single_check_frag( opts_page_meta.out() );
        
        var trend_frag_details = trends_structure( notice_prefs.enabled, notice_prefs.threshold  );
        frag.content=frag.content.concat(trend_frag_details);        
        
        
        // bind events for FORM submit and on change event
        opts_page_meta.event_method=bExt.option_evts.trends;
        opts_page_meta.event_extras.push({
            selector : "#notifications_form",
            evt_type : "submit",
            event_method : bExt.option_evts.update_trends
        });

        return fastFrag.create( frag );
    },
    
    services : function() {
        var opts_page_meta = bExt.options_page.build_meta({
            title : "Sharing Services",
            desc : "Share your links using the below external social network account(s):"
        }), frag=sharing_frag_container( opts_page_meta.out() );
        
        // setup DOM for later insertion w/ list_accounts_callback
        settings.share_box = opts_page_meta.get("id");
        
        opts_page_meta.set("evt_type", "click");
        opts_page_meta.event_method=bExt.option_evts.services;
        opts_page_meta.event_extras.push({
            selector : ".resync",
            evt_type : "click",
            event_method : bExt.option_evts.service_resync 
        });
        if(settings.is_chrome) {
            try {
                chrome.extension.sendRequest( {'action' : 'share_accounts' }, list_accounts_callback );
            } catch(e){ console.log("Not chrome, not sending request for share accounts"); }
        }
        return fastFrag.create( frag );
        
    },
    
    api_domains : function() {
        var frag_lst=[], radios_list=[], main_frag,
            prime_meta = bExt.options_page.build_meta({
                title : "API Domains",
                desc : "You can choose either the bit.ly API, the j.mp API or the bitly.com API. All work the same way, but j.mp is just a little shorter. This change only applies to new shortens."
            }),
            apis_lst=["bit.ly", "j.mp", "bitly.com"],
            user_selected_domain = bExt.info.get("domain") || "bit.ly";
        
        for(var i=0; i<apis_lst.length; i++) {
            // don't use complete object [new bExt.OptionMeta] here, overkill
            // also, don't need to track these elements invidivually
            radios_list.push({
                value : apis_lst[i],
                enabled : ( apis_lst[i] === user_selected_domain ) ? true : false
            });
        }
        
        for(var i=0; i<radios_list.length; i++) {
            frag_lst.push( _single_radio_frag( radios_list[i] ) );
        }

        main_frag = single_check_frag( prime_meta.out() );

        // replace the checkbox & label with the radio's list
        main_frag.content.splice(main_frag.content.length-1,1);
        main_frag.content = main_frag.content.concat([{
            id : prime_meta.get("id"),
            content : frag_lst
        }]);
        
        // assign DOM events
        prime_meta.el_selector="#" + prime_meta.get("id") + " input";
        prime_meta.event_method=bExt.option_evts.api_domains;
        
        return fastFrag.create( main_frag );
                
    },    
    
    hovercard_domains : function() {
        
        var opts_page_meta = bExt.options_page.build_meta({
            title : "Auto Expand Links",
            label : "Show Link Preview",
            enabled : bExt.hovercard.allow(),
            desc : "Shows a link preview, for bitly links, on pages you visit. This change only applies to new page loads."
        }), meta_frag = single_check_frag( opts_page_meta.out()  );
        
        
        if( bExt.hovercard.allow() ) {
            // allow extension to add the hovercard [bitly.urlexpander.js] to domains
            var domains_frag = hovercard_blist_domains( _nohovercard_domains( bExt.hovercard.blacklist() || [] ) );
            meta_frag.content=meta_frag.content.concat( domains_frag );            
        }

        opts_page_meta.event_extras.push({
            selector : "#add_no_expand_domain_form",
            evt_type : "click",
            event_method : bExt.option_evts.hovercard_update_form
        });
        
        opts_page_meta.event_extras.push({
            selector : "#remove_no_expand_domains",
            evt_type : "click",
            event_method : bExt.option_evts.hovercard_remove_domain
        }); 
        
        opts_page_meta.event_extras.push({
            selector : "#add_new_no_expand_domain",
            evt_type : "click",
            evt_track : "live",
            event_method : bExt.option_evts.hovercard_add_domain
        });
        opts_page_meta.event_method=bExt.option_evts.hovercard_domains;
        return fastFrag.create( meta_frag );
    },
        
    check_realtime : function() {
        var r_meta = bExt.info.get("realtime") || {}, clicks=0, links=0;
        if(r_meta && r_meta.realtime_links && r_meta.realtime_links.length > 0) {
            var lst=r_meta.realtime_links;
            links=lst.length;
            for(var i=0; i<lst.length; i++) {
                clicks+=lst[i].clicks
            }
            
            var realtime_frag = {
                id : "realtime_trending_box",
                content : [{
                    type : "strong",
                    content : "Trending Links: "
                },{
                    text : "You have " + clicks + " clicks on "
                }, {
                    type : "a",
                    content : links + " links",
                    attrs : {
                        href : chrome.extension.getURL("trending.html")
                    }
                }]
            }            
            $("#realtime_trending_box").remove();
            $("#top").append( fastFrag.create( realtime_frag ) );
        } else {
            $("#realtime_trending_box").remove();
        }

    }    
}



/*
    Utilities  / Extra Methods
    
        not publicly exposed by default
*/
function build( opts_meta ) {
    var frag = single_check_frag( opts_meta.out() );
    return fastFrag.create( frag );    
}



/*
    This private method has a dependecy in bExt.options_evt
*/
function _nohovercard_domains( d_list  ) {
    var i=0, domain, disble_box="disabled", 
        structured_items=[];
    for( ; domain=d_list[i]; i++) {
        // note
        // if bit.ly / j.mp ever support hover card, change to checked, to encourage removal
        if(domain === "bit.ly" || domain === 'j.mp') { disble_box = true; }
        else { disble_box = false; }
        
        structured_items.push( _hcard_sngle_checkbox_frag( domain, disble_box, i ) );
    }
    
    return structured_items;
}

function _hcard_sngle_checkbox_frag( domain, disble_box, pos  ) {
    return {
        type : "li",
        content : [{
            type : "input",
            id : 'no_expand_d_'+pos,
            css : "no_expand_check",
            attrs : {
                type : "checkbox",
                value : domain,
                name : "no_expand_domain",
                disabled : disble_box
            }
        },{
            type : "label",
            content : domain,
            attrs : {
                'for' : 'no_expand_d_'+pos
            }
        },{
            css : "hr",
            content : {
                type : "hr"
            }
        }]
    }
}

function hovercard_blist_domains( structured_items ) {
    return [{
        id : "no_expand_domains_box",
        content : [{
            type : "h4",
            content : 'Except These Domains:'
        },{
            type : "ul",
            id : "hv_blacklist_ui",
            css : "no_expand_domains_list",
            content : structured_items
        },{
            id : "new_no_expand_domain"
        },{
            content : [{
                type : "a",
                id : "add_no_expand_domain_form",
                content : "Add domain host",
                attrs : {
                    href : "#"
                }
            },{
                text : " | "
            },{
                type : "a",
                content : "Remove selected",
                id : "remove_no_expand_domains",
                attrs : {
                    href : "#"
                }
            },{
                type : "p",
                css : "no_domains_note",
                content : "Note: subdomains must be specified, facebook.com will not match www.facebook.com"
            }]
        }]
    }]
}

function trends_structure( enabled, threshold  ) {
    // the notifications trending UI elements
    // UI for users to set trending notification threshold
    var css_string = (enabled) ? "" : "display:none;";
    return [{
        id: "trending_ui_form_box",
        css : "smallInputContainer notificationInnerContainer",
        attrs : {
            style : css_string
        },
        content : [{
            type : "form",
            id : "notifications_form",
            attrs : {
                action : "#",
                method : "get",
                "accept-charset" : "utf-8"
            },
            content : [{
                type : "label",
                content : "Default Click Threshold"
            }, {
                type : "input",
                attrs : {
                    type : "text",
                    value : threshold || 20
                }
            }, {
                type : "input",
                css : "activeButtons notesFormBttn",
                attrs : {
                    value : "Update",
                    type : "submit"
                }
            }]
        },{
            type : "p",
            content : "Note: Threshold can be any integer from 5-10,000"
        }]
    }];
}

function hide_sharing_popup_frag( show_box, enabled ) {
    /*
        A form to hide the popup
    */
    
    var input_params={
        type : "checkbox"
    }, outer_params = {
        style :"display:none;"
    };
    if(show_box) {
        outer_params.style="";        
    }
    if(enabled) {
        input_params.checked=true;
    }
    return [{
        css : "options_container_inner",
        id : "hide_popup_box",
        attrs : outer_params,
        content : [{
            type : "input",
            id : "hide_sharing_input",
            attrs : input_params
        },{
            type : "label",
            content : "Speedy Shorten, disable popup",
            attrs : {
                'for' : "hide_sharing_input"
            }
        },{
            content : "Disable shorten sharing popup. Shows a browser icon on successful shorten, and copy the short url to my clipboard",
            css : "desc_txt"
        }]
    }]
}

function _single_radio_frag( meta, pos ) {
    if(!pos) pos=0;
    var radio_params = {
        type : "radio",                
        name : "api_choice",
        value : meta.value        
    }, label_id_suffix=meta.value.replace(/[^a-zA-Z]+/gi, "_");
    if(meta.enabled) {
        radio_params.checked=true;
    }
    return {
        css : "bentoOptions",
        content : [{
            type : "input",
            id : "radio_item_" + pos + "_" + label_id_suffix,
            attrs : radio_params
        },{
            type : "label",
            content : "Use " + meta.value + " API",
            attrs : {
                "for" : "radio_item_" + pos + "_" + label_id_suffix
            }
        }]
    }
}

function single_check_frag( meta ) {
    /*
        window.bExt.OptionMeta
        
            Most Common Fragment Type
        
        meta = {
            title : "",
            desc : "",
            label : "",
            id : ""
        }
    */
    
    var input_params={
        name : meta.id,
        type : meta.type,
        value : ""        
    }
    if(meta.enabled) {
        input_params.checked=true;
    }
    
    return {
        css : "options_container",
        id : meta.uuid,
        content : [{
            type : "h3",
            content : meta.title
        },{
            type : "p",
            content : meta.desc
        },{
            css : "field_type_" + meta.type,
            content : [{
                type : "input",
                id : meta.id,
                attrs : input_params
            },{
                type : "label",
                content : meta.label,
                attrs : {
                    'for' : meta.id
                }
            }]
        }]
    }
}


function sharing_frag_container( meta ) {
    return {
        id : "share_accounts",
        content : [{
            type : "h3",
            content : meta.title
        },{
            type : "p",
            content : meta.desc
        }, {
            type : "ul",
            id : meta.id,
            content : ""
        },{
            css : "meta_graph",
            content : {
                type : "p",
                content : [{
                    type : "a",
                    css : "add_or_remove",
                    content : "Add or remove",
                    attrs : {
                        href : "http://bit.ly/a/account",
                        target : "new"
                    }                                
                },{
                    text : " accounts on bitly | "
                },{
                    type : "a",
                    css : "resync",
                    content : "Refresh account list",
                    attrs : {
                        href : "#"
                    } 
                }]
            }
        }]
    };    
}
/*
    Sharing UI
*/
function list_accounts_callback(response) {
    // todo
    // break up and serve into page differently
    // add the 'shared accounts' on response, but the header and events up top
    if(response.error) {
        // todo
        // should this return to sign in page?
        // no, it should reload, then on page 'start'
        // check for signed in / signed out ness
        console.log("error", response.error)
        document.location.reload();
    }
    
    // console.log("show repsonse for sharing services", response);
    var accounts = response && response.share_accounts, i=0,
        account, html = "", status, structure, structure_items=[];
    
    for(; account=accounts[i]; i++) {
        status = (account.active) ? "on" : "off";                    
        structure_items.push({
            type : "li",
            id : account.account_id,
            attrs : {
                'status' : status
            },
            content : [{
                type : "img",
                css : "account_icon",
                attrs : {
                    src : 's/graphics/'+ account.account_type +'-'+ status +'.png',
                    border : 0,
                    alt : ""
                }
            },{
                type : "span",
                css : "account_name",
                content : ( account.account_name || account.account_login )
            },{
                type : "a",
                css : "sharingControl",
                content : 'Sharing ' + status,
                attrs : {
                    href : "#"
                }
            }]
        })
    }
    
    
    if(settings.share_box) {
        $("#" + settings.share_box).html('').append( fastFrag.create( structure_items ) );    
    } else {
        console.log("no settings.share_box to attach sharing UI to");
    }

}




/*
    Options Events
    
        DOM Based Events
            jQuery Event Types
            
        Alter DOM, save values to storage

*/
window.bExt.option_evts = {
    
    auto_copy : function( e ) {
        var chkd = $(e.target).attr("checked");
        console.log("event for auto copy", chkd);
        bExt.info.set("auto_copy", chkd);
        
        if(chkd) {
            $("#hide_popup_box").slideDown();
        } else {
            $("#hide_sharing_input:checked").trigger("click");            
            $("#hide_popup_box").slideUp();
        }
    },
    
    disable_popup : function(e) {
        var chkd = $(e.target).attr("checked");
        bExt.info.set("disable_popup", chkd);
        // todo
        chrome.extension.sendRequest({
            'action' : "toggle_popup",
            'active' : chkd
        }, function(){} );
    },
    
    twitter : function(e) {
        var chkd = $(e.target).attr("checked");
        bExt.info.set("enhance_twitter_com", chkd );
    },
        
    trends : function(e) {
        // todo, update the DOM
        var chkd = $(e.target).attr("checked");
        if(chkd) {
            $("#trending_ui_form_box").slideDown();            
        } else {
            $("#trending_ui_form_box").slideUp();            
        }        
        bExt.update_note_prefs({
            'enabled' : chkd
        });        
        
        // todo, turn off the worker?
    },
    
    update_trends : function(e) {
        // form submission event
        e.preventDefault();
        var txt_value = $(this).find("input[type=text]").val();        
        bExt.update_note_prefs({
            'threshold' : get_safe_threshold(txt_value)
        });
    },
    
    api_domains : function(e) {
        var txt_value = $(this).val();
        bExt.info.set("domain", txt_value );
        
        chrome.extension.sendRequest({
            action : "update_api_domain",
            api_domain : txt_value
        }, function(){});
    },
    
    hovercard_domains : function(e) {
        var chkd = $(e.target).attr("checked");
        if(chkd) {
            $('#no_expand_domains_box').slideDown();
        } else {
            $('#no_expand_domains_box').slideUp();
        }
        bExt.hovercard.toggle( chkd  );
    },
    
    
    hovercard_update_form : function(e) {
        // Show the UI form to add a new blacklist hovercard
        e.preventDefault();
        var frag = additional_hovercard_frag();
        $("#new_no_expand_domain").append( fastFrag.create( frag ) );
        $("#new_no_expand_domain").find("input[type=text]").focus();
    },
    
    hovercard_remove_domain : function(e) {
        e.preventDefault();
        var $selected_els = $("#no_expand_domains_box").find("input[type=checkbox]:checked"),
            domains_list=[];

        for(var i=0; i<$selected_els.length; i++) {
            domains_list.push( $selected_els[i].value )
        }
        console.log(domains_list)
        
        bExt.hovercard.remove_blacklist( domains_list );
        update_ui_hovercard_blacklist();        
    },
    
    hovercard_add_domain : function(e) {
        // form submit event
        e.preventDefault();
        var $els = $("#new_no_expand_domain").find("input[type=text]"),
            txt_value = $els.val() || null;
        if(txt_value) {   
            bExt.hovercard.update_blacklist( [ txt_value ] );
            $els.val(''); // reset form
            $els.focus();
            update_ui_hovercard_blacklist();
        }

    },
    
    // bExt.option_evts.services
    services : function(e) {
        var params={ 'action' : 'activate_account' }, img, status, parent;
        if(e.target.nodeName.toLowerCase() === "img" || e.target.className === "sharingControl") {
            e.preventDefault();
            parent = e.target.parentNode;
            status = ( parent.getAttribute("status").indexOf("on") < 0 );
            params.account_id = parent.id
            params.active = status;
            try {
                // todo, break this out
                chrome.extension.sendRequest( params, list_accounts_callback );
            } catch(e) { console.log("Not Chrome, did not refresh share accounts"); }
        }
    },
    
    service_resync : function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
            chrome.extension.sendRequest( {'action' : 're_sync_share_accounts' }, list_accounts_callback );                
        } catch(e) { console.log("Not chrome, no resync"); }
    }
    
}

function update_ui_hovercard_blacklist() {
    // private method dependency -- _nohovercard_domains -- required by both bExt.option_evts and bExt.options_page 
    var items_frag = _nohovercard_domains( bExt.hovercard.blacklist() || [] );
    $("#hv_blacklist_ui").html('').append( fastFrag.create( items_frag  ) );    
}

function get_safe_threshold( num_value ) {
    var safe_value = Math.max(num_value, 5);
    safe_value = Math.ceil( Math.min(safe_value, 10000 ) );
    return safe_value;
}

/*
    Post Event DOM Insertion Pieces
*/
function additional_hovercard_frag() {
    return structure = {
        css : "domains_host_container",
        content : [{
            type : "input",
            id : "no_expand_domain_new_domain",
            attrs : {
                name : "no_expand_domain_new_domain",
                type : "text"
            }
        },{
            type : "input",
            css : "activeButtons",
            id : "add_new_no_expand_domain",
            attrs : {
                name : "add_new_no_expand_domain",
                type : "submit",
                value : "Add"
            }                            
        }]
    }
}


})(window);




