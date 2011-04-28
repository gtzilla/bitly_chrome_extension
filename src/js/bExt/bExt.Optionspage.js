// 
//  bExt.Optionspage.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-04-28.
//  Copyright 2011 the public domain. All rights reserved.
// 


(function( window, undefined) {
    
window.bExt.Optionspage = function() {
    
    console.log("built!")
    return this;
}
window.bExt.Optionspage.prototype={
    
    
    basic : function() {
        
        
        var opts_page_meta = bExt.OptionMeta({
            title : "Twitter Enhance",
            label : "Enhance Twitter",
            desc : "Display a shorten button on twitter.com when I enter a long URL"
        });
    }
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
        content : [{
            type : "h3",
            content : meta.title
        },{
            type : "p",
            content : meta.desc
        },{
            content : [{
                type : "input",
                id : meta.id,
                attrs : {
                    name : meta.id,
                    type : meta.type
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
    if(!this.__m.id) {
        this.__m.id=(this.__m.title + "_" + this.__m.label).replace(/[^a-z0-9]/gi, "_").toLowerCase();
    }
    
    return this;
}

window.bExt.OptionMeta.prototype = {
    __m : {
        id : null,
        title : null,
        label : null,
        type : "checkbox",
        desc : null
    }
}
    
})(window);