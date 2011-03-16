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
function _copy( obj1 ) {
    // http://my.opera.com/GreyWyvern/blog/show.dml/1725165
    // derivative of prototype method, don't want to mess with native types (object, boolean, string etc)
    var i, newObj = (obj1 instanceof Array) ? [] : {};
    for (i in obj1) {
      if (obj1[i] && typeof obj1[i] == "object") {
        newObj[i] = _copy( obj1[i] );
      } else { newObj[i] = obj1[i]; }
    } return newObj;        
}



