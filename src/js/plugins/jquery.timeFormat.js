/*
    name : timeFormat
    file : jquery.timeFormat.js
    author : gregory tomlinson
    Dual licensed under the MIT and GPL licenses.
    ///////////////////////////
    ///////////////////////////        
    dependencies : jQuery 1.4.2
    ///////////////////////////
    ///////////////////////////
    
*/

(function($) {
    
    /*
        Format the time by:
            1. taking existing timestamp from server
            2. calculate current time
            3. find difference
            4. Display:
                    Now
                    2 mins ago
                    3 hours ago
                    1 day ago
                    January 15
    */
    
    $.timeFormat = function( timestamp ) {
        // extend the defaults settings
        var time = handleDate( timestamp );
        return time;
    }
    
    
    function handleDate( timestamp ) {
        var n=new Date(), t, ago = " ";
        if( timestamp ) {
          t =   Math.round( (n.getTime()/1000 - timestamp)/60 );
          ago += handleSinceDateEndings( t, timestamp );
        } else {
            ago += "";
        }
        return ago;
    }    
    
    function handleSinceDateEndings( t, original_timestamp ) {
        var ago = " ", date;
        if( t <= 1 ) {
            ago += "Now";
        } else if( t<60) {
            ago += t + " mins ago";
        } else if( t>= 60 && t<= 120) {
            ago += Math.floor( t / 60 ) + " hour ago"
        } else if( t<1440 ) {
            ago += Math.floor( t / 60 )  + " hours ago";
        } else if( t< 2880) {
            ago +=  "1 day ago";
        } else if( t > 2880  && t < 4320 ) {
            ago +=  "2 days ago";
        } else {
            date = new Date( parseInt( original_timestamp )*1000 ) 
            ago += months[ date.getMonth() ] + " " + date.getDate();
        }
        return ago;
    }
    
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


})(jQuery);
