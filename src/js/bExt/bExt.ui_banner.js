// 
//  bExt.ui_banner.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-05-03.
//  Copyright 2011 the public domain. All rights reserved.
// 

(function(window, undefined){


var settings = {
    box : "#top",
    delay : 20
}

window.bExt.ui_banner = {
    
    init : function( opts ) {
        settings=jQuery.extend({}, settings, opts);
        $(settings.box).prepend( fastFrag.create( frag_struct() ) );        
        setTimeout(function(){
            $(document.body).addClass("page_loaded");
        },  settings.delay || 20 ); // must be at least 1
    }
    
}

function frag_struct() {
    return {
        id : "blueBanner",
        content : {
            type : "ul",
            css : "ext_nav_list",
            content : [{
                type : "li"//,
                // content : {
                //     type : "a",
                //     css : "",
                //     content : "Metrics",
                //     attr : {
                //         href : chrome.extension.getURL("metrics.html")
                //     }
                // }
            }]
        }
    }
}
    
})(window);