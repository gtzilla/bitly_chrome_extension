/*
    name : escapeHTML
    file : jquery.escapeHTML.js
    author : gregory tomlinson, jehiah czebotar
    copyright: (c) 2010 bit.ly
    Dual licensed under the MIT and GPL licenses.
    ///////////////////////////
    ///////////////////////////
    dependencies : jQuery 1.4.2
    ///////////////////////////
    ///////////////////////////

*/

(function($) {
    
    $.escapeHTML = function( unsafe_html ) {
        if(!unsafe_html) return unsafe_html;
        var b = $('<b />').text( unsafe_html )
        return b[0].innerHTML.replace('\'','&#39;').replace('"','&quot;');
    }

})(jQuery);
