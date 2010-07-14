/*
    name : eventTracker
    file : jquery.eventTracker.js
    author : gregory tomlinson
    copyright: (c) 2010 bit.ly
    Dual licensed under the MIT and GPL licenses.
    ///////////////////////////
    ///////////////////////////
    dependencies : jQuery 1.4.2
    ///////////////////////////
    ///////////////////////////
        
        Events: Track

*/

(function() {
    
    $.fn.eventTracker = function( options ) {
        // extend the defaults settings
        var el = this, queue=[];
        el.bind('track', eventTrack)
        return this;
        
        
        function eventTrack(e,data) {
            if(!pageTracker) {
                queue.push(data)
                return;
            }
            console.log('data for eventTrack', data, pageTracker)
            
            //TODO: enable event tracking
            return;
            transmitEventObject(data);
            processQueue();
        }
        
        function processQueue() {
            for(var i=0; i<queue.length; i++) {
                transmitEventObject(queue[i])
            }
            queue = [];
        }
        
        function transmitEventObject( data ) {
            for(var k in data ) {
                //var evnt = data.events[i]
                try {
                    pageTracker._trackEvent(k, data[k]);
                } catch(err) { return false;  }
            }
            return true;
        }
    }
})(jQuery);
