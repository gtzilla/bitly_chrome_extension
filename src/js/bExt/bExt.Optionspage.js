// 
//  bExt.Optionspage.js
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
    box : "#signedin_info_contents"
}

window.bExt.Optionspage = function( opts_els ) {
    settings=$.extend(true, {}, settings, opts_els );
    return this;
}

window.bExt.Optionspage.prototype={
    
    __lst : [],
    
    // make this appear as an array
    length : 0,
    splice : function() {
        
    },
    
    
    assemble : function() {
        var $box=$(settings.box);
        
        // get users data, append Elements as needed
        
        $box.append( this.auto_copy() )
            .append( this.twitter() )
            .append( this.trends() )
            .append( this.hovercard_domains() )
            .append( this.context_menu() );
    },
    
    trends : function() {
        
        var frag, opts_page_meta = new bExt.OptionMeta({
            title : "Trend Notifications",
            label : "Enable Notifications",
            desc : "Automatically notify me when my link starts to become popular, or trend. Notifications will be shown when a link reaches the threshold specified below during the past hour."
        });
        
        frag=single_check_frag( opts_page_meta.out() );
        var trend_frag_details = trends_structure();
        frag.content=frag.content.concat(trend_frag_details);
        return fastFrag.create( frag );
    },
    
    hovercard_domains : function() {
        
        var opts_page_meta = new bExt.OptionMeta({
            title : "Auto Expand Links",
            label : "Show Link Preview",
            desc : "Shows a link preview, for bit.ly, on pages you visit. This change only applies to new page loads."
        }),
        meta_frag = single_check_frag( opts_page_meta.out()  )
        var domains_frag = hovercard_blist_domains( _nohovercard_domains( bExt.hovercard.blacklist() ) );
        
        
        meta_frag.content=meta_frag.content.concat( domains_frag );
        return fastFrag.create( meta_frag );
    },
    
    auto_copy : function() {
        
        var opts_page_meta = new bExt.OptionMeta({
            title : "Auto Copy Short Urls",
            desc : "Automatically copy short urls to my clipboard when popup opens"
        });        
        
        return build( opts_page_meta );       
    },
    
    context_menu : function() {
        var opts_page_meta = new bExt.OptionMeta({
            title : "Context Menu Notifications",
            label : "Show Success Notification",
            desc : "On webpages I visit, show a confirmation message when a link has been shorten via the context menu (right click menu) for valid URLs"
        });    
        return build( opts_page_meta );            
    },
    
    twitter : function() {
        var opts_page_meta = new bExt.OptionMeta({
            title : "Twitter Enhance",
            label : "Enhance Twitter",
            desc : "Display a shorten button on twitter.com when I enter a long URL"
        });  
        
        
        return build( opts_page_meta );
    },
    
    basic : function() {
        console.log("basic: window.bExt.Optionspage");
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

function trends_structure() {
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

function hovercard_blist_domains( structured_items ) {
    return [{
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
    }];
}

function single_check_frag( meta ) {
    /*
        meta = {
            title : "",
            desc : "",
            label : "",
            id : ""
        }
    */
    
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
                attrs : {
                    name : meta.id,
                    type : meta.type,
                    value : ""
                }
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



window.bExt.OptionMeta = function( meta_obj  ) {
    this.__m=$.extend( true, this.__m, meta_obj );
    this.set_label();
    this.set_id();

    return this;
}

window.bExt.OptionMeta.prototype = {
    
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
        id : null,
        title : null,
        label : null,
        type : "checkbox",
        desc : null,
        value : ""
    }
}
    
})(window);