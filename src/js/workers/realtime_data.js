/*
    html5 workers

    time is in milliseconds for all timers
*/



var ssl_key, black_list=[], ajax_in_action,  timer, timer2,
    counter=0;
onmessage = function(evt) {


    if( evt.data.action === "start") {
        
        if(!evt.data.oauth_key ) { return; }        
        ssl_key = evt.data.oauth_key;
        black_list = evt.data.black_list || [];

        callRemote();
        
    } else {
        
        
        if(evt.data.oauth_key) { 
            ssl_key = evt.data.oauth_key;
        }        
        
        
        if(evt.data.black_list ) {
            black_list = evt.data.black_list || [];
        }

        callRemote();

    }

}

function handle_api_repsonses(jo) {

    if(jo && jo.data && jo.status_code===200) {
        
        var params = process_realtime( jo.data );
        postMessage( params );
        
    } else {
        postMessage(jo);
    }
    

    if(!navigator.onLine) { 
        //postMessage({"error": "Not on line"}); 
        return; 
    }
    
    timer = setTimeout(callRemote, 2000);

}

function callRemote(){
    if(ajax_in_action) {
        ajax_in_action.abort();
    }
    
    if(timer) {
        clearTimeout(timer);
        clearTimeout(timer2);
    }
    
    if(!navigator.onLine) { 
        //postMessage({"error": "Not on line"}); 
        return; 
    }

    timer2=setTimeout(function() {
        ajax_in_action = ajaxRequest( ssl_key, handle_api_repsonses );          
    }, 15000);

   
}

function process_realtime( data  ) {
    var links = data.realtime_links, notifications=[], remove_list=[];
    outerLoop:
    for(var i=0,link; link=links[i]; i++) {
        
                
        for(var j=0,short_url; short_url=black_list[i]; i++) {
            var pieces = short_url.split("/"), hash = pieces.pop();
            if( hash === link.user_hash ) {
                continue outerLoop;
            }
            // if( short_url.indexOf( link.user_hash ) > -1 ) {
            //     continue outerLoop;
            // }
        }
        

        var shorty = "http://bit.ly/" + link.user_hash;
        notifications.push( shorty );

        
    }
    
    
    return {
        'online': navigator.onLine,
        'notifications' : notifications,
        'trending_links' : data,
        'current_blacklist' : black_list
    }
}



function ajaxRequest( oauth_key, callback ) {
    var xhr = new XMLHttpRequest(), message, 
        post_data, url="https://api-ssl.bitly.com/v3/user/realtime_links";
    
    if(!oauth_key || oauth_key === "") { 
        postMessage({'error' : 'no auth key'})
        return; 
    }
    url += '?appid=chromeext&access_token=' + encodeURIComponent( oauth_key );
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
         if (xhr.readyState == 4) {
             // do success
             // if(xhr.status!=200) {
             //     if(callback) callback({'error' : true}, xhr.status);
             //     return;
             // }
             try {
                 message = JSON.parse(xhr.responseText)
             } catch(e) {
                 message = xhr.responseXML || xhr.responseText
             }
             callback( message, xhr.status );
         }
    }
    xhr.send();
    return xhr;
}









