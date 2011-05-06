/* common functions  */
function _id( name ) {
    return document && document.getElementById( name );
}

function _now() {
    return (new Date()).getTime();
}

function escaper( string ) {
    return (string && string.replace(/&/mgi, "&amp;").replace(/"/mgi, "&quot;").replace(/'/mgi, "&#39;")
                 .replace(/>/mgi, "&gt;").replace(/</mgi, "&lt;") ) || "";
}

function commify( num ) {
    var i=3, num_string_array = (num+"").split("").reverse();
    for( ; i<num_string_array.length; i+=4) {
        num_string_array.splice(i,0,",");
    }
    return num_string_array.reverse().join("");    
}
function _q( query, context ) {
    // returns single element
    // cotentext is optional, expects DOM element
    context = context || document;
    return context.querySelector( query )
}
function _qAll( query, context ) {
    // returns list, not a live collection..., context is optional
    context = context || document;
    return context.querySelectorAll( query );
}


/* 
    curtousey of digiwhack.me project with http://unlicense.org
*/
function _pClass( elem, css_class_name ) {
    // do, probably need a flag
    var regex = new RegExp( css_class_name ), obj = elem, p;
    do {
        if( regex.test( obj.className ) ) {
            p = obj;
        }
    } while( !p && (obj = obj.parentNode));   
    return p;
}
function hasClass(ele,cls) {
    return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}
function addClass(ele,cls) {
    if (!hasClass(ele,cls)) ele.className += " "+cls;
}
function removeClass(ele,cls) {
    if (hasClass(ele,cls)) {
        var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
        ele.className=ele.className.replace(reg,' ');
    }
}




