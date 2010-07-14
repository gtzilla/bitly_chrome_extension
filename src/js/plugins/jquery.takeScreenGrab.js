/*
    name : takeScreenGrab
    file : jquery.takeScreenGrab.js
    author : gregory tomlinson
    copyright: (c) 2010 bit.ly
    Dual licensed under the MIT and GPL licenses.
    ///////////////////////////
    ///////////////////////////
    dependencies : jQuery 1.4.2
    ///////////////////////////
    ///////////////////////////

*/

(function() {
    
    $.fn.takeScreenGrab = function( options ) {
        // extend the defaults settings
        var el = this, o = $.extend(true, defaults, options),
            capsule_container = el.find('.shortenedBitlyListListBox'),
            active_capturing=false;
        $(renderHTML()).appendTo( capsule_container );
        capsule_container.find('.takeScreenGrab').live('click', function(e) {
            
            e.preventDefault();
            if(active_capturing) return;
            // change the button state...
            active_capturing = true;
            $(this).html('saving')
            var $this = $(this);
            
            chrome.tabs.getSelected(null, function(curr_tab) {
                
                chrome.tabs.captureVisibleTab(null, function( image_data ){
                    
                    // adder( data )
                    // $('#sidebarOuterBento').append( $('<img />').attr('src',data) )
                    var params = { 'screen_grab' : image_data, 'current_tab' : curr_tab }
                    chrome.extension.sendRequest(params, function(jo) {
                        //$bento_box_elem.trigger('updateTextArea', jo.data);
                        console.log(jo)
                        for(var i=0; i<jo.photos.length; i++) {
                            
                            console.log('trigger the event now')
                            
                            /*
                                todo
                                fix this to trigger a different event, or change the bento box, if you
                                don't want these added to the  shortenscomplete list...
                            */
                            
                            capsule_container.trigger('updateTextArea', {'url' : jo.photos[i].MediaUrl } );
                        }
                        active_capturing = false;
                        $this.html('Take Screen Grab')
                    });
                
                });
            });
        
        })
        
        return this;
    
        
        function renderHTML() {
            var html = "";
            html += '<div class="activeScreenGrab">'
                html += '<a href="#" class="takeScreenGrab">Take Screen Grab</a>'
            html += '</div>'
            
            return html;
        
        }
        
        function success(jo) {
            if(!jo || !jo.data) console.log('ERROR: Cannot conntect to service', jo)
        }
        
        function error( e ) {
            console.log('ERROR:', this, e)
        }
    
    }
    
    function connector( url, params, callback, error ) {
        var str = $.param( params );
        $.ajax({
            dataType: 'json',
            data : str,
            'url' : url,
            success: callback,
            'error' : error
        });
    }
    
    var defaults = {
        messageClearInterval : 5000
    };

})(jQuery);
