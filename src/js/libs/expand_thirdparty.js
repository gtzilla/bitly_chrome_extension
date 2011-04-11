// 
//  expand_thirdparty.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-02-12.
//  Copyright 2011 the public domain. All rights reserved.
// 
(function(){
    window['expand_thirdparty']={
        google : expand_google_shortlink,
        isgd : expand_isgd_shortlink
    }
    
    function startapp() {

        
    }
    
    function expand_google_shortlink( short_url ) {
        // https://www.googleapis.com/urlshortener/v1/url?shortUrl=http://goo.gl/fbsS        
        var url="https://www.googleapis.com/urlshortener/v1/url?shortUrl="+short_url
        open_remote(url,"GET",function(jo) {
            console.log(jo);
        });
    }
    
    function expand_isgd_shortlink(short_url) {
        // http://is.gd/rV9Wer
        var url = "http://is.gd/forward.php?format=json&shorturl="+short_url;
        open_remote(url,"GET",function(jo) {
            console.log(jo);
        });        
    }
    
    // function expand_tinyurl(short_url) {
    //     // http://tinyurl.com/6fmqp2o
    //     // http://preview.tinyurl.com/6fmqp2o
    //     open_remote(short_url.replace("http://", "http://preview."), "GET", function(jo) {
    //         // console.log("doc head", jo);
    //         console.log(typeof jo, jo.replace(/\n/gm, "").replace(/\r/gm, ""))
    //         var matches = jo.replace(/\n/gm, "").replace(/\r/gm, "").match(/(following)/gmi); // [^http]{1,}(http[^ ]{2,})
    //         console.log(matches);
    //     })
    // }
    
    function open_remote(url, type, callback) {
        var xhr = new XMLHttpRequest(), message;

        xhr.open(type, url);
        // xhr.setRequestHeader        
        
        xhr.onreadystatechange=function() {
            console.log("yup", xhr.getAllResponseHeaders())
            if (xhr.readyState == 4) {
                // do success
                if(xhr.status === 200) {
                    try {
                         message = JSON.parse(xhr.responseText);
                         if(message && message.status_code === 200) {
                             message = message.data;
                         } else {  /*throw error back?*/ }
                     } catch(e) {
                         // NOT JSON
                         message = xhr.responseXML || xhr.responseText
                     }
                     callback( message );
                } else {
                    // non 200 status
                    callback( xhr.responseText || xhr.responseXML );
                }
            }            
        }
        xhr.send();
    }
})();