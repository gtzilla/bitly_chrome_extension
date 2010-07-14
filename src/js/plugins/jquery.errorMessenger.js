/*
    name : errorMessenger
    file : jquery.errorMessenger.js
    author : gregory tomlinson
    copyright: (c) 2010 bit.ly
    Dual licensed under the MIT and GPL licenses.
    ///////////////////////////
    ///////////////////////////
    dependencies : jQuery 1.4.2, jquery.escapeHTML.js
    ///////////////////////////
    ///////////////////////////
    
    Event listeners: errorMessage

    usage:
    el.trigger('successMessage', { text : 'this is a nice little test message here blagh blah' })
    el.trigger('errorMessage', { text : 'something went wrong' })

*/

(function($) {
    
    $.fn.errorMessenger = function( options ) {
        // extend the defaults settings
        var el = this, o = $.extend(true, defaults, options), timer, elements=[];
        
        el.bind('errorMessage', messageHandler)
        el.bind('statusMessage', messageHandler)
        el.bind('successMessage', successMessageHandler)
        return this;
        
        function statusMessageHandler( e, data) {
            renderMessage( data.text, "" );
        }
        
        function successMessageHandler(e,data) {
            renderMessage( data.text, "successMessage" );
        }
        
        function messageHandler(e,data) {
            renderMessage( data.text, "topErrorMessage" );
            el.trigger('track', { 'plugin:errorMessenger' : data.text } )
        }
        
        function renderMessage( text, cssClass ) {
            console.log('render message', text)
            renderHTML(  text , cssClass)
        }
        
        function renderHTML( text, cssClass ) {
            var html  = '';
            html += '<div class="'+cssClass+' basicOverlayMessageContainer" style="display:none;">'
                html += '<div class="basicOverlayMessageContainerInner">' ;
                html += '<span class="messageIconContainer"></span>'
                html += '<div class="basicMessageTextContainer">'  + $.escapeHTML( text ) + '</div>'
                html += '<div class="hr"><hr /></div>'
                html+= '</div>'
            html += '</div>'
            d = $(html).appendTo(el)
            d.slideDown();
            elements.push( d );
            setCleanup();
        }
        function setCleanup() {
            timer = setTimeout( cleanupMessage, o.messageClearInterval );
        }
        
        function cleanupMessage() {
            var d = elements.pop();
            if(!d) return;
            d.slideUp('normal', function() {
                d.remove();
            });
            
            if( elements.length > 0 ) {
                setCleanup();
            }
        }
    }
    
    var defaults = {
        messageClearInterval : 3000
    };

})(jQuery);
