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
    share_box : null,
    is_chrome : (chrome&&chrome.tabs) ? true : false
}, __lst=[];

window.bExt.options_page={
    
    //bExt.options_page.init
    init : function( opts_els ) {
        settings=$.extend(true, {}, settings, opts_els );
        var udata = bExt.info.get("user_data");
        console.log("this user", udata);        
    },
    
    // make this appear as an array
    length : 0,
    splice : function(idx, howMany) {
        
    },
    
    build_meta : function( meta_params ) {
        var m=new bExt.OptionMeta( meta_params  );
        
        // javascript fun, this is a reference. Objects are PASS BY REFERENCE
        // we can always access them, it's NOT A copy unless we go to serious lengths to ensure it.
        __lst.push(m);
        return m;
    },
    
    assemble : function() {
        var $box=$(settings.box), lst;
        
        // get users data, append Elements as needed
        
        $box.append( bExt.options_page.services() )
            .append( bExt.options_page.auto_copy() )
            .append( bExt.options_page.twitter() )
            .append( bExt.options_page.trends() )
            .append( bExt.options_page.hovercard_domains() )
            .append( bExt.options_page.context_menu() )
            .append( bExt.options_page.api_domains() );
        
        //  Assign DOM Events for OptionsMeta Objects list
        lst = __lst;
        for(var i=0; i<lst.length; i++) {
            if(lst[i].event_method !== null ) {
               $( lst[i].el_selector || "#" + lst[i].get("id") ).bind(lst[i].get("evt_type"), lst[i].event_method );
            }
        }
    },
    
    api_domains : function() {
        var frag_lst=[], meta_list=[], main_frag,
            prime_meta = bExt.options_page.build_meta({
                title : "API Domains",
                desc : "You can choose either the bit.ly API, the j.mp API or the bitly.com API. All work the same way, but j.mp is just a little shorter. This change only applies to new shortens."
            }),
            apis_lst=["bit.ly", "j.mp", "bitly.com"],
            user_selected_domain = bExt.info.get("domain") || "bit.ly";
        
        for(var i=0; i<apis_lst.length; i++) {
            // don't use complete object [new bExt.OptionMeta] here, overkill
            meta_list.push({
                value : apis_lst[i],
                enabled : ( apis_lst[i] === user_selected_domain ) ? true : false
            });
        }
        
        for(var i=0; i<meta_list.length; i++) {
            frag_lst.push( _single_radio_frag( meta_list[i] ) );
        }

        main_frag = single_check_frag( prime_meta.out() );

        // replace the checkbox & label with the radio's list
        main_frag.content.splice(main_frag.content.length-1,1);
        main_frag.content = main_frag.content.concat([{
            id : "api_choice_form",
            content : frag_lst
        }]);    
        return fastFrag.create( main_frag );
                
    },
    
    trends : function() {
        
        var frag, opts_page_meta = bExt.options_page.build_meta({
            title : "Trend Notifications",
            label : "Enable Notifications",
            desc : "Automatically notify me when my link starts to become popular, or trend. Notifications will be shown when a link reaches the threshold specified below during the past hour."
        });
        
        frag=single_check_frag( opts_page_meta.out() );
        var trend_frag_details = trends_structure();
        frag.content=frag.content.concat(trend_frag_details);
        return fastFrag.create( frag );
    },
    
    services : function() {
        var opts_page_meta = bExt.options_page.build_meta({
            title : "Sharing Services",
            desc : "Share your links using the below external social network account(s):"
        }), frag=sharing_frag_container( opts_page_meta.out() );
        
        settings.share_box = opts_page_meta.get("id");
        if(settings.is_chrome) {
            try {
                chrome.extension.sendRequest( {'action' : 'share_accounts' }, list_accounts_callback );
            } catch(e){ console.log("Not chrome, not sending request for share accounts"); }
        }
        return fastFrag.create( frag );
        
    },
    
    hovercard_domains : function() {
        
        var opts_page_meta = bExt.options_page.build_meta({
            title : "Auto Expand Links",
            label : "Show Link Preview",
            enabled : bExt.hovercard.allow(),
            desc : "Shows a link preview, for bit.ly, on pages you visit. This change only applies to new page loads."
        }), meta_frag = single_check_frag( opts_page_meta.out()  );
        
        
        if( bExt.hovercard.allow() ) {
            // allow extension to add the hovercard [bitly.urlexpander.js] to domains
            var domains_frag = hovercard_blist_domains( _nohovercard_domains( bExt.hovercard.blacklist() || [] ) );
            meta_frag.content=meta_frag.content.concat( domains_frag );            
        }
        opts_page_meta.event_method=bExt.option_evts.hovercard_domains;
        return fastFrag.create( meta_frag );
    },
    
    auto_copy : function() {
        
        var opts_page_meta = bExt.options_page.build_meta({
            title : "Auto Copy Short Urls",
            enabled : bExt.info.get("auto_copy"),
            desc : "Automatically copy short urls to my clipboard when popup opens"
        });        
        
        
        // javascript fun, this is a reference. Objects are PASS BY REFERENCE
        opts_page_meta.event_method=bExt.option_evts.auto_copy;
        
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
    
    basic : function() {
        console.log("basic: window.bExt.options_page");
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

function get_safe_threshold( num_value ) {
    var safe_value = Math.max(num_value, 5);
    safe_value = Math.ceil( Math.min(safe_value, 5000 ) );
    return safe_value;
}


function _nohovercard_domains( d_list  ) {
    var i=0, domain, disble_box="disabled", 
        structured_items=[];
    for( ; domain=d_list[i]; i++) {
        // note
        // if bit.ly / j.mp ever support hover card, change to checked, to encourage removal
        if(domain === "bit.ly" || domain === 'j.mp') { disble_box = true; }
        else { disble_box = false; }
        
        structured_items.push({
            type : "li",
            content : [{
                type : "input",
                id : 'no_expand_d_'+i,
                css : "no_expand_check",
                attributes: {
                    type : "checkbox",
                    value : domain,
                    name : "no_expand_domain",
                    disabled : disble_box
                }
            },{
                type : "label",
                content : domain,
                attributes : {
                    'for' : 'no_expand_d_'+i
                }
            },{
                css : "hr",
                content : {
                    type : "hr"
                }
            }]
        });
        
    }
    
    return structured_items;
}

function hovercard_blist_domains( structured_items ) {
    return [{
        id : "no_expand_domains_box",
        content : [{
            type : "h4",
            content : 'Except These Domains:'
        },{
            type : "ul",
            css : "no_expand_domains_list",
            content : structured_items
        },{
            id : "new_no_expand_domain"
        },{
            content : [{
                type : "a",
                id : "add_no_expand_domain_form",
                content : "Add domain host",
                attributes : {
                    href : "#"
                }
            },{
                text : " | "
            },{
                type : "a",
                content : "Remove selected",
                id : "remove_no_expand_domains",
                attributes : {
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

function trends_structure() {
    // the notifications trending UI elements
    // UI for users to set trending notification threshold
    return [{
        css : "smallInputContainer notificationInnerContainer",
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
                    value : 20
                }
            }, {
                type : "input",
                attrs : {
                    value : "Update",
                    type : "submit"
                }
            }]
        },{
            type : "p",
            content : "Note: Threshold can be any integer from 5-5,000"
        }]
    }];
}



function _single_radio_frag( meta ) {
    var radio_params = {
        type : "radio",                
        name : "api_choice",
        value : meta.value        
    }
    if(meta.enabled) {
        radio_params.checked=true;
    }
    return {
        css : "bentoOptions",
        content : [{
            type : "input",
            attrs : radio_params
        },{
            type : "label",
            content : "Use " + meta.value + " API"
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
                    attributes : {
                        href : "http://bit.ly/a/account",
                        target : "new"
                    }                                
                },{
                    text : " accounts on bitly | "
                },{
                    type : "a",
                    css : "resync",
                    content : "Refresh account list",
                    attributes : {
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
            attributes : {
                'status' : status
            },
            content : [{
                type : "img",
                css : "account_icon",
                attributes : {
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
                attributes : {
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
    Options Event

*/
window.bExt.option_evts = {
    
    auto_copy : function( e ) {
        var chkd = $(e.target).attr("checked");
        console.log("event for auto copy", chkd);
        bExt.info.set("auto_copy", chkd);
    },
    
    twitter : function(e) {
        var chkd = $(e.target).attr("checked");
        bExt.info.set("enhance_twitter_com", chkd );
    },
    
    hovercard_domains : function(e) {
        var chkd = $(e.target).attr("checked");        
        console.log("yey! hoverville");
        //todo, UPDATE THE DOM
        bExt.hovercard.toggle( chkd  );
    }
    
}


})(window);



// separate but equal, prep to put in own file

(function( window, undefined) {
/*
    Representation of each 'setting' UI Controls Parent
    
        Such that, a Title, desc, and event method are assigned
*/

window.bExt.OptionMeta = function( meta_obj  ) {
    this.__m=$.extend( {}, this.__m, meta_obj );
    this.set_label();
    this.set_id();

    return this;
}

window.bExt.OptionMeta.prototype = {
    
    // add this to set event for this object
    'event_method' : null,        
    
    set_id : function() {
        if(!this.__m.id && this.__m.title !== this.__m.label ) {
            this.__m.id=(this.__m.title + "_" + this.__m.label).replace(/[^a-z0-9]/gi, "_").toLowerCase();
        } else {
            this.__m.id=(this.__m.title).replace(/[^a-z0-9]/gi, "_").toLowerCase();
        }
    },
    set_label : function() {
        if(!this.__m.label) {
            this.__m.label=this.__m.title;
        }
    },
    
    get : function( name ) {
        return this.__m[ name ];
    },
    
    set : function( name, value ) {
        return this.__m[name]=value;
    },
    
    out : function() {
        return this.__m;
    },
    __m : {
        evt_type : "change",
        el_selector : null, // a jQuery query selector string
        id : null,
        title : null,
        label : null,
        enabled : null,
        type : "checkbox",
        desc : null,
        value : ""
    }
}
    
})(window);