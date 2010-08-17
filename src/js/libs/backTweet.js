/*
    http://backtweets.com/search.json?q=http://www.paulcarvill.com/2009/09/why-front-end-developers-are-so-important-to-the-future-of-businesses-on-the-web/&key=41d4096077ddacef8a7a
    
*/

(function(){
    
    var host="http://backtweets.com/search.json", backTweet = function( api_key ) {
        return new bType( api_key );
    }
    
    window.backTweet = backTweet;
    
    function bType( api_key ) {
        return this.init( api_key );
    }
    bType.prototype = {
        params : {
            'key' : '',
            'itemsperpage' : 20
        },
        init : function( api_key ) {
            this.params.key = api_key
            return this;
        },
        
        fetch : function( query, callback ) {
            var params = extend( {}, this.params, { 'q' : query } );

            apiRequest({
                'url' : host,
                'data' : params,
                success : function(jo) {
                    console.log(jo)
                    if(callback) callback(jo);
                }
            });
        }
    }
    
    function buildparams( obj ) {
        // todo, handle errors / types better
        var params = [], a, i;
        for(var k in obj ) {  
            if(obj[k] && obj[k].length > 0 && typeof obj[k] === "object") {
                a = obj[k];
                for(i=0; i<a.length; i++) { params[params.length] = k + "=" + encodeURIComponent(a[i]);  }
            } else if( obj[k] ){
                params[params.length] = k + "=" +encodeURIComponent( obj[k] );
            }

        }
        return params.join("&");
    }    
    
    function extend() {
        var target = arguments[0] || {}, length = arguments.length, i=0, options, name, copy;
        for( ; i<length; i++) {
            if( (options = arguments[i] ) !== null) {
                for(name in options) {
                    copy = options[ name ];
                    if( target === copy ) { continue; }
                    if(copy !== undefined ) {
                        target[name] = copy;
                    }
                }
            }
        }

        return target;
    }    
    
    function apiRequest( obj ) {
        var xhr = new XMLHttpRequest(), 
            message, ajax_url, post_data=null;
        ajax_url = obj.url + "?" + buildparams( obj.data )    
        xhr.open("GET", ajax_url, true);  

        xhr.onreadystatechange = function() {
             if (xhr.readyState == 4) {
                 // do success
                 if(xhr.status === 200) {
                     try {
                          message = JSON.parse(xhr.responseText);
                      } catch(e) {
                          message = xhr.responseXML || xhr.responseText
                      }
                      obj.success( message );
                 } else {

                     // TODO
                     // handle errors better
                     var err_msg = { 'error' : xhr.responseText || "unknown", 'status_code' : xhr.status }
                     console.log("API invalid response, not 200", obj)                 
                     if(obj.error) { 
                         obj.error( err_msg );
                     }
                     else { obj.success( err_msg ); }                 

                 }

             }
        }
        xhr.send( post_data || null );

        return xhr;        
    }
    
  
    
})();
