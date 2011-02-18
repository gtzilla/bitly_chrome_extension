
/*
    We *hopefully* have access to the XMLHTTPRequest Object from here, nothing else unless we load it. 
*/

onmessage = init


var timer, polling_urls, current_request;

function init( evt  ) {
    /*
        init the API key and login values
        
        evt.data.login
        evt.data.apiKey
        // short urls to start
        ;
    */
    //polling_urls = evt.data.shortUrl;
    onmessage = dataHandler;
    //start_poll();
    makeRemoteCall();
}

function start_poll() {
    if(timer){ clearTimeout(timer); }
    timer = setTimeout(makeRemoteCall, 20000)
}

function makeRemoteCall() {
    
    if(current_request) {
        current_request.abort();
    }
    
    // todo pull this value from the init values!!!
    current_request = ajaxRequest({
        url : '',
        success : function(jo) {
            postMessage(jo)
        }
    })
    
}

function dataHandler(evt) {
    // listen for changes to shortURLs
    //polling_urls = evt.data.shortUrl;    
    start_poll();
}


function ajaxRequest( obj ) {
    var xhr = new XMLHttpRequest(), message, post_data;
    
    xhr.open(obj.type || "GET", obj.url, true);
    xhr.onreadystatechange = function() {
         if (xhr.readyState == 4) {
             // do success
             if(xhr.status!=200) {
                 if(obj.error) obj.error({'error' : true }, obj.url, xhr.status);
                 return;
             }
             try {
                 message = JSON.parse(xhr.responseText)
             } catch(e) {
                 message = xhr.responseXML || xhr.responseText
             }
             obj.success( message, obj.url, xhr.status )
         }
    }
    xhr.send( null );
    return xhr;
}