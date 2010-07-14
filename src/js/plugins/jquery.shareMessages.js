/*
    name : shareMessages
    file : jquery.shareMessages.js
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
    
    $.fn.shareMessages = function( options ) {
        // extend the defaults settings
        var el = this, o = $.extend(true, defaults, options);

        el.bind('socialShareSuccess', socialShareSuccessEvent)

        return this;
        
        
        /************************** EVENTS *************************/
        
        function socialShareSuccessEvent(e, data) {
            //TODO: nothing currently defines this response format
            // this will change
            console.log(data)
            
            link_elements = el.find('.linkCapsule_topLevelContainer');
            console.log(link_elements)
            var tweet_text = "Your shared content</span>"
            link_elements.each(function(idx,elem) {
                
                $elem = $(elem);
                var hash = $elem.attr('hash')
                for(var i=0; i<data.shares.length; i++) {
                    for(var j=0; j<data.links.length; j++) {
                        var url = data.links[j];
                        if(data.shares[i].error) {
                            continue;
                        }
                        if( url.indexOf(hash) > 1 ) {
                            var html  = "<p class='sharedLinkPermalink'>";
                            html += '<a target="_blank" href="' + data.shares[i].link + '">'+data.shares[i].link+'</a>';
                            //html += ': ' + data.text 
                            html += '</p>'
                            $('<div class="sharedLinkPermalinkContainer" />').html( html )
                                        .css('display', 'none').insertAfter($elem).fadeIn();
                            break;
                        }
                    }
                }
                
            })
        }
    }
})(jQuery);
