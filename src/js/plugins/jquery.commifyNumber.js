/*
    
    name: commifyNumber
    file: jquery.commifyNumber.js
    author: gregory tomlinson
    copyright: (c) 2010 bit.ly
    Dual licensed under the MIT and GPL licenses.
    ////////////////////////////////////
    ////////////////////////////////////
    dependencies: jQuery 1.4.2
    ////////////////////////////////////
    ////////////////////////////////////            

*/

(function($){
    
    $.extend({ commifyNumber : function( num ) {
            //TODO: check for num == null
            var i, num_string_array = (num+"").split("").reverse();
            for( i=3; i<num_string_array.length; i+=4) {
                num_string_array.splice(i,0,",");
            }
            return num_string_array.reverse().join("");
        }
    });
    

    
})(jQuery);