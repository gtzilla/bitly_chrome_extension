(function(){



    function timeFormat( timestamp ) {
        // extend the defaults settings
        var time = handleDate( timestamp );
        return time;
    }

    window.timeFormat = timeFormat;

    function handleDate( timestamp ) {
        if(!timestamp) return " ";
        var curr_time=(new Date()).getTime()/1000, t, ago = " ", 
            milli_check = ((timestamp+"").length > 12);
            
        timestamp /= ((milli_check) ? 1000 : 1);
        t = Math.round( (curr_time - timestamp)/60 );
        ago += handleSinceDateEndings( t, timestamp );

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


    
})();
