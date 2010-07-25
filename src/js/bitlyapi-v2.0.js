/*
    A BITLY JS API
        - Little wrapper object to handle bit.ly API calls
            api.bit.ly
*/

(function() {


var bitlyAPI = function(  user, APIKey  ) {
    
    return new bitlyAPI.fn.init()
}  

bitlyAPI.fn = bitlyAPI.prototype = {
    
    user : "", key : "",
    
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
    },
    
    expand : function(  short_url, callback ) {
        
    },
    
    info : function() {
        
    }
    
}    
    
})();


/*
    Usage
    
    
    var bitly = bitlyAPI("user", "R_324234ASDF23232323")
    bitly.shorten( http://some.com/url/whatever, func_callback  )
*/

