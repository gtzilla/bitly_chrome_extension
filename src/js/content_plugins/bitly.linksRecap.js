/*
*   bitly.linksRecap.js
*       
*
*
* */
var bitly={};
(function(namespace,undefined){

    var lR = function() {
    }

    lR.prototype = {
    

        init : function() {
            console.log("link Recapper");
        },
        find_links : function() {
           /* var links = jQuery("a[href]");*/
            /*console.log(links);*/
        }
    }

    namespace.linksRecap=new lR();

})(bitly);


bitly.linksRecap.init();
bitly.linksRecap.find_links();
