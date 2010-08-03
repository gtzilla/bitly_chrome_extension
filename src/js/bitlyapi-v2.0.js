/*
    A BITLY JS API
        - Little wrapper object to handle bit.ly API calls
            api.bit.ly
*/

(function() {

// TODO
// move this info to settings file
var host = "http://api.bit.ly", 
    urls = {
        'shorten' : '/v3/shorten',
        'expand' : '/v3/expand',
        'info' : '/v3/info',
        'auth' : '/v3/authenticate',
        'clicks' : '/v3/clicks'
    }


var BitlyAPI = function(  user, APIKey, settings  ) {
    // this should be an object
    if(settings && settings.host ) host = settings.host;
    return new BitlyAPI.fn.init( user, APIKey )
} 

// TODO
// check to make sure there is no NameSpace collision
window.BitlyAPI = BitlyAPI;

BitlyAPI.fn = BitlyAPI.prototype = {
    
    bit_request : {
        login : "",
        apiKey : "",
        format : 'json',
        domain : 'bit.ly',
        x_login : null, x_apiKey : null
    },
    
    version : "2.0",
    count : 0, // internal request counter, this is the number of times certain methods are called
    
    init : function( user, APIKey ) {
        // setup defaults an handle overrides
        this.bit_request.login = user;
        this.bit_request.apiKey = APIKey;
        return this;
    },
    
    shorten : function( long_url, callback ) {

        var shorten_params = copy_obj( this.bit_request );
        shorten_params.longUrl = long_url;        
        this.count+=1;
        bitlyRequest( urls.shorten, shorten_params, callback);        
    },
    
    expand : function(  short_urls, callback ) {

        this.count+=1;
        internal_multiget( urls.expand, 'shortUrl', short_urls, this.bit_request, function(jo) {
            console.log("working", jo)
            callback(jo)
        } );        
    },
    
    expand_and_meta : function( short_urls, callback ) {
        // 1. run an expand,
        // 2. run an info
        // 3. run a clicks
        // stitch all, return data
        var requests = 3, final_results = {};
        function sticher( response ) {
            requests-=1;
            //console.log(response, "the expand and meta sticher")
            
            // clicks || info || expand
            var items = [];
            try {
                items = response.clicks || response.info || response.expand;
            } catch(e) {}
            
            
            for(var i=0; i<items.length; i++) {
                
                // blend data
                //console.log(items[i])
                if(items[i].error) continue;
                
                var item_hash = items[i].user_hash
                if(!final_results[ item_hash ] ) {
                    final_results[ item_hash ] = items[i];
                } else {
                    // merge in new values
                    // if I was using jQuery, I would just call $.extend({}, obj1, obj2)
                    var store = final_results[ item_hash ]
                    for(var k in items[i]) {
                        if( store[k] ) continue;
                        store[k] = items[i][k]
                    }
                }
                
            }
            
            if(requests<=0) {
                // put it all together
                var list_results = [], count=0;
                for(var key in final_results) {
                    count+=1;
                    list_results.push( final_results[key] )
                }
                console.log("merged up data is", final_results)
                callback( {'expand_and_meta' : final_results, 'list_results' : list_results, 'total' : count } )
            }
        }
        this.expand( short_urls, sticher );
        this.clicks( short_urls, sticher);
        this.info( short_urls, sticher );
    },
    
    
    clicks : function(short_urls, callback) {
        // yet another one that needs stitching...
        this.count+=1;        
        internal_multiget( urls.clicks, 'shortUrl', short_urls, this.bit_request, callback );          
    },
    
    info : function( short_urls, callback ) {
        this.count+=1;        
        internal_multiget( urls.info, 'shortUrl', short_urls, this.bit_request, callback );        
    },
    
    auth : function( username, password, callback ) {
        // call the set credentials  when this is run
        var self = this, auth_params = copy_obj( this.bit_request );
        auth_params.x_login = username;
        auth_params.x_password = password;        
        ajaxRequest({
            'url' : host + urls.auth + "?" + buildparams( auth_params ),
            'type' : "POST",
            'success' : function(jo) {
                console.log(jo, "bit.ly response: ", urls.auth); 
                if( jo.authenticate.successful ) {
                    self.set_credentials( jo.authenticate.username, jo.authenticate.api_key )              
                }
                if(callback) callback( jo );
            }
        });        
        
    },
    
    set_credentials : function( x_login, x_apiKey) {
        
        // set as default
        this.bit_request.x_login = x_login;
        this.bit_request.x_apiKey = x_apiKey;        
    },
    
    remove_credentials : function() {
        delete this.bit_request.x_login;
        delete this.bit_request.x_apiKey;        
    }
    
}  
// make the magic happen, allows var b = BitlyAPI("whatever")
//                                  b.shorten("http://google.com")
BitlyAPI.fn.init.prototype = BitlyAPI.fn;


/*
    Utilities
        Namespace contained by outter closure function
*/
function copy_obj( obj ) {
    var copy = {};
    for(var k in obj) {
        copy[k] = obj[k];
    }
    return copy;
}

function is_large_arrary( array ) {
    if( typeof array !== "string" && array.length > 15) { return true; }
    return false;
}

function internal_multiget( path, param_key, urls_list, params, callback ) {
    // props to @jehiah for the above naming convention...
    var collection = [], request_count=0, chunks = [],
        bit_params = copy_obj( params ), key_name = "expand";
    function stitch( response ) {
        request_count-=1;
        for(var k in response) {
            if(response[k] && response[k].length >= 0) key_name = k
        }
        collection = collection.concat( response[key_name] );
        if(request_count <= 0) {
            var final_respone = {}
            final_respone[key_name] = collection; // required syntax, JS can't turn var into obj keys otherwise
            if(callback) callback( final_respone )
        }
    }
     
    if( is_large_arrary( urls_list )  ) {
        chunks = chunk( urls_list, 15  );
        for(var i=0; i<chunks.length; i++) {
            // break into arrays of length < 15 - bit.ly API has a limit on # per request
            request_count+=1;
            bit_params[ param_key ] = chunks[i];                  
            bitlyRequest( path,  bit_params, stitch);                      
        }
    } else {
        bit_params[ param_key ] = urls_list;  
        //console.log("try to send ", bit_params)
        bitlyRequest( path,  bit_params, callback);                
    }
}

function chunk(array, chunkSize) {
    // when I get more than N urls, need to make multiple calls
    // the paradox:
    // checking that chunkSize is a num costs N amount, proper usage would requie no error handling and faster code?
   var base = [], i, size = chunkSize || 5;
   for(i=0; i<array.length; i+=chunkSize ) { base.push( array.slice( i, i+chunkSize ) ); }	
   return base;
}


function buildparams( obj ) {
    // todo, be more complex
    var params = [], a;
    for(var k in obj ) {
        if(typeof obj[k] === "string") {
            // check has own property
            params[params.length] = k + "=" +encodeURIComponent( obj[k] );
        } else if(obj[k] && obj[k].length > 0) {
            // could be an object or an array
            a = obj[k];

            for(var i=0; i<a.length; i++) {
                params[params.length] = k + "=" + encodeURIComponent(a[i]);                    
            }

        }

    }
    return params.join("&");
}

function bitlyRequest( api_path, params, callback ) {
    ajaxRequest({
        'url' : host + api_path + "?" + buildparams( params ),
        'success' : function(jo) {
            console.log(jo, "bit.ly response: ", api_path);               
            if(callback) callback( jo );    // send back the long url as a second arg
        },
        error : callback
    });    
}

function ajaxRequest( obj ) {
    // outside of the ext, this lib needs JSONP
    // 7/25/2010 - for google chrome ext
    var xhr = new XMLHttpRequest(), message;
    xhr.open(obj.type || "GET", obj.url, true);           
    xhr.onreadystatechange = function() {
         if (xhr.readyState == 4) {
             // do success
             if(xhr.status!=200) {
                 // TODO
                 // handle errors better
                 if(obj.error) obj.error();
                 else obj.success({ 'error' : JSON.parse(xhr.responseText) })
                 console.log("status is not 200")
                 return;
             } 
             try {
                 console.log(xhr, "the xhr")
                 message = JSON.parse(xhr.responseText);
                 if(message.status_code === 200) {
                     message = message.data;
                 } else {
                     // throw error back
                     
                 }
             } catch(e) {
                 // NOT JSON
                 console.log("not json")
                 message = xhr.responseXML || xhr.responseText
             }
             obj.success( message )
         }
    }
    xhr.send( obj.data || null );
    
    return xhr;    
    
}  

    
})();


/*
    Usage
    
    
    var bitly = bitlyAPI("user", "R_324234ASDF23232323")
    bitly.shorten( http://some.com/url/whatever, func_callback  )
*/

