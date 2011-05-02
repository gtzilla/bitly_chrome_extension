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
        
        As or ver Chrome Ext ver 1, the sign in screen shared the same page as this page.
*/

var settings={
    box : "#signedin_info_contents"
}
window.bExt.Optionspage = function( opts_els ) {
    settings=$.extend(true, {}, settings, opts_els );
    console.log("up")
    console.log("built!");
    return this;
}

window.bExt.Optionspage.prototype={
    
    __lst : [],
    
    trends : function() {
        
        var frag, opts_page_meta = new bExt.OptionMeta({
            title : "Trend Notifications",
            label : "Enable Notifications",
            desc : "Automatically notify me when my link starts to become popular, or trend. Notifications will be shown when a link reaches the threshold specified below during the past hour."
        });        
        
        frag=single_check_frag( opts_page_meta );
        var trend_frag_details = [{
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
        }]
        frag.content=frag.content.concat(trend_frag_details);
        fastFrag.create( frag );
    },
    
    auto_copy : function() {
        
        var opts_page_meta = new bExt.OptionMeta({
            title : "Auto Copy Short Urls",
            desc : "Automatically copy short urls to my clipboard when popup opens"
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

function build( opts_meta ) {
    var frag = single_check_frag( opts_meta.out() );
    return fastFrag.create( frag );    
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
    
    // <div class="options_container">
    //     <h3>Twitter Enhance</h3>
    //     <p>Display a shorten button on twitter.com when I enter a long URL</p>
    //     <div>
    //         <input type="checkbox" name="enhance_twitter" value="" id="enhance_twitter">
    //         <label for="enhance_twitter">Enhance Twitter</label>
    //     
    //     </div>
    // </div>    
    
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