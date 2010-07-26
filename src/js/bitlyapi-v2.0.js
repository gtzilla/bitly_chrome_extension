/*
    A BITLY JS API
        - Little wrapper object to handle bit.ly API calls
            api.bit.ly
*/

(function() {

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
    return new BitlyAPI.fn.init( user, APIKey )
} 

var buildparams = function( obj ) {
    // todo, be more complex
    var params = [], a;
    for(var k in obj ) {
        if(typeof obj[k] === "string") {
            // check has own property
            params[params.length] = k + "=" +encodeURIComponent( obj[k] );
        } else {
            // could be an object or an array
            a = obj[k];
            if(a.length > 0) {
                for(var i=0; i<a.length; i++)
                params[params.length] = k + "=" + encodeURIComponent(a[i]);
            }
        }

    }
    return params.join("&");
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
    
    init : function( user, APIKey ) {
        // setup defaults an handle overrides
        this.bit_request.login = user;
        this.bit_request.apiKey = APIKey;
        this.user = user;
        this.key = APIKey;
        return this;
    },
    
    shorten : function( long_url, callback ) {
        // there will need to be somecallback
        
        // TODO
        // this is NOT copying a new object, it's constantly changing the original - bad!
        

        var shorten_params = copy_obj( this.bit_request );
        shorten_params.longUrl = long_url;        
        
        ajaxRequest({
            'url' : host + urls.shorten + "?" + buildparams( shorten_params ),
            'success' : function(jo) {
                console.log(jo, "bit.ly shorten response");
                if(callback) callback( jo, long_url );    // send back the long url as a second arg
            }
        });
    },
    
    expand : function(  short_urls, callback ) {

        var expand_params = copy_obj( this.bit_request );
        expand_params.shortUrl = short_urls;

        
        ajaxRequest({
            'url' : host + urls.expand + "?" + buildparams( expand_params ),
            'success' : function(jo) {
                console.log(jo, "bit.ly response: ", urls.expand);
                if(callback) callback( jo, long_url );    // send back the long url as a second arg
            }
        });        
    },
    
    info : function( callback ) {
        
    },
    
    auth : function( callback ) {
        
    },
    
    set_credentials : function( x_login, x_apiKey) {
        // we use this once the person is logged in
        this.x_login = x_login;
        this.x_apiKey = x_apiKey;
        
        // set as default
        this.bit_request.x_login = x_login;
        this.bit_request.x_apiKey = x_apiKey;        
    }
    
}  
// make the magic
BitlyAPI.fn.init.prototype = BitlyAPI.fn;

function copy_obj( obj ) {
    var copy = {};
    for(var k in obj) {
        copy[k] = obj[k];
    }
    return copy;
}

function chunk(array, chunkSize) {
    // when I get more than N urls, need to make multiple calls
    // the paradox:
    // checking that chunkSize is a num costs N amount, proper usage would requie no error handling and faster code?
   var base = [], i, size = chunkSize || 5;
   for(i=0; i<array.length; i+=chunkSize ) { base.push( array.slice( i, i+chunkSize ) ); }	
   return base;
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
                 if(obj.error) obj.error();
                 console.log("status is not 200")
                 return;
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
             
             //console.log(message)
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

