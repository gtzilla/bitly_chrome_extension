/*
    name : localStorage
    file : jquery.localStorage.js
    author : gregory tomlinson
    copyright: (c) 2010 bit.ly
    Dual licensed under the MIT and GPL licenses.
    ///////////////////////////
    ///////////////////////////
    dependencies : jQuery 1.4.2
    ///////////////////////////
    ///////////////////////////
    
    This is for CHROME local Storage: ref docs: http://www.rajdeepd.com/articles/chrome/localstrg/LocalStorageSample.htm#section3

*/

(function($) {
    $.extend(true, { localStorage  : {
        get : function( itemKey ) {
            var item = window.localStorage.getItem( itemKey )
            try{
                var json_item = JSON.parse(item);
                return json_item
            } catch(e) {
                console.log('Error getting key', itemKey, e)
            }
            return null;
        },
        set : function(itemKey, itemValue) {
            try{
                window.localStorage.removeItem( itemKey );
            } catch(e) {}
            var response = window.localStorage.setItem( itemKey, window.JSON.stringify( itemValue ) );
            if(response) return response;
            
            return null;
        },
        remove : function( itemKey ) {
            window.localStorage.removeItem(  itemKey );
            console.log('Removing item from local storage: ' , itemKey )
        },
        resetStorage : function() {
            window.localStorage.clear();
            console.log('Attention: Just deleted all local storage!');
        }
    }});
})(jQuery);
