/*
    A BITLY JS API
        - Little wrapper object to handle bit.ly API calls
            api.bit.ly
*/

(function() {

// TODO
// move this info to settings file
var host = "http://api.bit.ly", 
    ssl_host = "https://api-ssl.bit.ly",
    urls = {
        'shorten' : '/v3/shorten',
        'expand' : '/v3/expand',
        'info' : '/v3/info',
        'auth' : '/v3/authenticate',
        'oauth' : '/oauth/access_token',
        'accounts' : '/v3/user/share_accounts',
        'domains' : '/v3/all_domains',
        'share' : '/v3/user/share',
        'clicks' : '/v3/clicks',
        'lookup' : '/v3/lookup'
    }, errors = [];


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
        access_token : null,
        x_login : null, x_apiKey : null
    },
    
    oauth_client : {
        client_id : null,
        client_secret : null,
        x_auth_username : '',
        x_auth_password : ''
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
        bitlyRequest( host + urls.shorten, shorten_params, callback);        
    },
    
    expand : function(  short_urls, callback ) {

        this.count+=1;
        internal_multiget( urls.expand, 'shortUrl', short_urls, this.bit_request, callback);        
    },
    
    expand_and_meta : function( short_urls, callback ) {
        // 1. run an expand,
        // 2. run an info
        // 3. run a clicks
        // stitch all, return data
        var requests = 3, final_results = {};
        
        function sticher( response ) {
            requests-=1;            
            // clicks || info || expand
            var items = [], item_hash, store;
            try {
                items = response.clicks || response.info || response.expand;
            } catch(e) {}
            
            
            for(var i=0; i<items.length; i++) {
                
                if(items[i].error) continue;
                
                item_hash = items[i].short_url
                if(!final_results[ item_hash ] ) {
                    final_results[ item_hash ] = items[i];
                } else {
                    // merge in new values
                    // if I was using jQuery, I would just call $.extend({}, obj1, obj2)
                    store = final_results[ item_hash ]
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
                callback( {'expand_and_meta' : final_results, 'list_results' : list_results, 'total' : count } );
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
    
    clicks_by_url : function( long_urls, callback ) {
        this.count+=1;
        // todo
        // not working
        var request_count = 2;
        function sticher( jo ) {
            request_count -= 1;
            
            if(jo.lookup) {
                
            }
        }
        
        this.lookup(long_urls, sticher);
    },
        

    info : function( short_urls, callback ) {
        this.count+=1;        
        internal_multiget( urls.info, 'shortUrl', short_urls, this.bit_request, callback );        
    },
    
    lookup : function(long_urls, callback) {
        this.count+=1;        
        internal_multiget( urls.lookup, 'url', long_urls, this.bit_request, callback );
    }, 
    
    share_accounts : function( callback ) {
        if(!callback) callback = function(){ console.log(arguments); }
        // this is an oauth endpoint -- /v3/user/share_accounts
        
        var share_params = { 'access_token' : this.bit_request.access_token }

        this.count+=1;
        bitlyRequest( ssl_host + urls.accounts, share_params, callback);        
    },
    
    bitly_domains : function( callback )  {
        // 
        var params = { 'access_token' : this.bit_request.access_token }        
        //http://api.bit.ly/v3/all_domains
        bitlyRequest( ssl_host + urls.domains, params, callback);  
    },
    
    share : function( params, callback ) {
        var share_params = copy_obj(params);
        share_params.access_token = this.bit_request.access_token;
        
        this.count+=1;
        bitlyRequest( ssl_host + urls.share, share_params, callback);        
    },
    
    auth : function( username, password, callback ) {
        // call the set credentials  when this is run
        var self = this, auth_params = copy_obj( this.oauth_client );

        auth_params.x_auth_username = username;
        auth_params.x_auth_password = password;        
        ajaxRequest({
            'url' : ssl_host + urls.oauth,
            'type' : "POST",
            'data' : buildparams( auth_params ),
            'success' : function( url_param_string ) {
                if(typeof object === "object") { 
                    callback({'error' : url_param_string }); 
                    return;
                }
                var oauth_info = parse_oauth_response( url_param_string );
                if(!oauth_info) {
                    console.log('error');
                    errors.push({'error' : 'auth', 'data' : url_param_string })
                    oauth_info = { 'error' : 'unknown issue with auth' }
                } else {
                    self.set_credentials( oauth_info.login, oauth_info.apiKey, oauth_info.access_token );
                }


                if(callback) callback( oauth_info );
            }
        });        
        
    },
    
    set_domain : function( api_domain ) {
        var types = ["bit.ly", "j.mp"];
        if(types.indexOf(api_domain) > -1 ) {
            this.bit_request.domain = api_domain;
            return true;
        } else {
            this.bit_request.domain = types[0];
        }
        
        return false;
    },
    
    set_oauth_credentials : function( client_id, client_secret ) {
        this.oauth_client.client_id = client_id;
        this.oauth_client.client_secret = client_secret;
    },
    
    set_credentials : function( x_login, x_apiKey, access_token) {
        
        // set as default
        this.bit_request.x_login = x_login;
        this.bit_request.x_apiKey = x_apiKey;   
        this.bit_request.access_token = access_token;                
    },
    
    remove_credentials : function() {
        delete this.bit_request.x_login;
        delete this.bit_request.x_apiKey;        
    }
    
}  
// make the magic happen, allows var b = BitlyAPI("whatever", "R_whatever")
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

function parse_oauth_response( url_string ) {
    //access_token=4bf1cbe01cf1a4806da981c7bf452a28ba2194c6&login=exttestaccount&apiKey=R_0d3f58015f6030b3183d9fbce2f4723b
    var items = ( url_string && typeof url_string === "string" ) && url_string.split("&")
    if(!items) return null;
    var response = {}
    for(var i=0; i<items.length; i++) {
        var params = items[i].split("=");
        response[ (params[0]) ] = params[1]
    }
    
    return response;

}

function is_large_arrary( array ) {
    if( typeof array !== "string" && array.length > 15) { return true; }
    return false;
}

function internal_multiget( path, param_key, urls_list, params, callback ) {
    // props to @jehiah for the above naming convention.
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
            bitlyRequest( host + path,  bit_params, stitch);                      
        }
    } else {
        bit_params[ param_key ] = urls_list;  
        //console.log("try to send ", bit_params)
        bitlyRequest( host + path,  bit_params, callback);                
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

function bitlyRequest( api_url, params, callback, error_callback ) {
    ajaxRequest({
        'url' : api_url + "?" + buildparams( params ),
        'success' : function(jo) {
            //console.log(jo, "bit.ly response: ", api_url);               
            if(callback) callback( jo );    // send back the long url as a second arg
        },
        error : error_callback || callback
    });    
}

function ajaxRequest( obj ) {
    // outside of the ext, this lib needs JSONP
    // 7/25/2010 - for google chrome ext
    var xhr = new XMLHttpRequest(), message;
    xhr.open(obj.type || "GET", obj.url, true);  
    if(obj.data) {
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    }         
    xhr.onreadystatechange = function() {
         if (xhr.readyState == 4) {
             // do success
             if(xhr.status!==200) {
                 // TODO
                 // handle errors better
                 console.log("API invalid response error", obj)                 
                 if(obj.error) { 
                     console.log("API invalid response error")
                     obj.error();
                 }
                 else { obj.success({ 'error' : 'unknown' }); }
                 console.log("status is not 200")
             } 
             try {
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

