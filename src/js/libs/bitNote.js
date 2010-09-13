/*
    filename : bitNote
    http://unlicense.org/
    author: gregory tomlinson
    Sat Sep 11 21:48:26 EDT 2010
*/

(function() {
    
    var notification;
    function notification_close_action( evt ){
        console.log("close the", evt, arguments)
    }
    function notification_display_action(evt) {
        console.log("note is diplayed", evt)        
    }    
    
        
    var bitNote =  {
        
        html : "notification.html",

        show : function( on_note_display, callback ) {
            notification = webkitNotifications.createHTMLNotification( 'notification.html' );
            // html url - can be relative
            
            notification.ondisplay = on_note_display || notification_display_action;
            notification.onerror = callback || function() { console.log(  "error" );  }
            notification.onclose = callback || notification_close_action;
            notification.show();
            return notification;
        }
    }
    
    window.bitNote = bitNote;
        
})();