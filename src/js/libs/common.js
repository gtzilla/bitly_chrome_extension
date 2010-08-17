/* common functions  */
function _id( name ) {
    return document && document.getElementById( name );
}

function _now() {
    return (new Date()).getTime();
}

function escaper( string ) {
    return (string && string.replace('&', "&amp;").replace('"', "&quot;").replace("'", "&#39;")
                 .replace('>', "&gt;").replace('<', "&lt;") ) || "";
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