/*
    name : urlParams, urlParamGet
    file : jquery.urlParams.js
    http://jquery-howto.blogspot.com/2009/09/get-url-parameters-values-with-jquery.html    
    Dual licensed under the MIT and GPL licenses.
    ///////////////////////////
    ///////////////////////////        
    dependencies : jQuery 1.4.2
    ///////////////////////////
    ///////////////////////////
        
*/

(function() {
    $.extend({
      urlParams: function(){
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
          hash = hashes[i].split('=');
          vars.push(hash[0]);
          vars[hash[0]] = hash[1];
        }
        return vars;
      },
      urlParamGet: function(name){
        return $.urlParams()[name];
      }
    });
    
})(jQuery);


