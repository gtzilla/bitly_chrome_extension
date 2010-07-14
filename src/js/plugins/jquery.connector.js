/*
    name : connector
    file : jquery.connector.js
    author : gregory tomlinson
    copyright: (c) 2010 bit.ly
    Dual licensed under the MIT and GPL licenses.
    ///////////////////////////
    ///////////////////////////        
    dependencies : jQuery 1.4.2
    ///////////////////////////
    ///////////////////////////
        
*/

(function($) {
    
    $.extend({
        /*
        @param {string} url path component of endpoint
        @param {dict} params for this call
        @param {function} callback function
        @param {function} error function
        */
        connector : function( url, params, callback, error ) {
            connector(url, params, callback, error);
        },
        /*
        @param {dict} options
        */
        connectorSetup:function(options) {
            defaults = $.extend(true, {}, defaults, options);
        }
    });
    
    function connector( url, params, callback, error ) {
        console.log(url, params, 'Standard AJAX connection in progress')
        var str = $.param( params );
        $.ajax({
            type: 'POST',
            dataType: 'json',
            data : str,
            'url' : defaults.host + url,
            success: callback,
            'error' : error
        });
    }
    
    var defaults = {
            host : 'http://api.bitly.org'
        };
    
})(jQuery);
