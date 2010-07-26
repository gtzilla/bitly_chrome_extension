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
    
    user : "", key : "", x_login : null, x_apiKey : null,
    
    init : function( user, APIKey ) {
        // setup defaults an handle overrides
        this.user = user;
        this.key = APIKey;
        return this;
    },
    
    shorten : function( long_url, callback ) {
        // there will need to be somecallback
        
        /*
            I'm catch it internally, and make sure the data is good, then send the payload out via the callback
        */
        //TODO
        // use x_login here as the chrome ext is really doing the work
        
        /*
            if options:
                see if type if object or function - if function, use as callback, 
                typeof(options) === "Function" || 
        */
        
        var shorten_params = {
            'format' : 'json',
            'longUrl' : long_url,
            'domain' : 'bit.ly',
            'login' : this.user,
            'apiKey' : this.key
        }
        
        if(this.x_login && this.x_apiKey) {
            shorten_params.x_login = this.x_login;
            shorten_params.x_apiKey = this.x_apiKey; 
        }
        
        ajaxRequest({
            'url' : host + urls.shorten + "?" + buildparams( shorten_params ),
            'success' : function(jo) {
                console.log(jo, "bit.ly shorten response");
                if(callback) callback( jo, long_url );    // send back the long url as a second arg
            }
        });
    },
    
    expand : function(  short_urls, callback ) {
        if(typeof short_urls === "string") {
            // there is only one
        } else if(short_urls.length > 0) {
            
        }
        var expand_params = {
            'format' : 'json',
            'shortUrl' : short_urls,
            'domain' : 'bit.ly',
            'login' : this.user,
            'apiKey' : this.key            
        }
        
        if(this.x_login && this.x_apiKey) {
            expand_params.x_login = this.x_login;
            expand_params.x_apiKey = this.x_apiKey; 
        }        
        
        ajaxRequest({
            'url' : host + urls.expand + "?" + buildparams( expand_params ),
            'success' : function(jo) {
                console.log(jo, "bit.ly response: ", urls.expand);
                if(jo.status_code === 200) {
                     if(callback) callback( jo.data, long_url );
                }
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
    }
    
}  
// make the magic
BitlyAPI.fn.init.prototype = BitlyAPI.fn;

var basic_params = {
    'format' : 'json',
    'login' : '',
    'apiKey' : '',
    'domain' : 'bit.ly'
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
                 message = JSON.parse(xhr.responseText)
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

