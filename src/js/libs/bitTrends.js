/*

    Dependency: common.js for escaper

    This 'script' is really just an interface to the trends DOM structure
    
        It does the following:
            Draws the trend data on init
            
            Provides methods to:
                update
                show certain data
                
*/

(function() {
    
    var bitTrends = function( el, realtime_bits, settings ) {
        return new bTrend( el, realtime_bits );
    }
    window.bitTrends = bitTrends;
    
// all the real work, this was all a $.fn.whatever really is anyway, except it inherited the jQuery info    
    function bTrend( el, realtime_bits ) {

        return this.init( el, realtime_bits );
    }
    bTrend.prototype = {
        
        init : function(el, realtime_bits) {
            // draw the page, first time
            this.el = el;            
            this.realtime_bits = realtime_bits;
            return this;
        },
        
        draw : function() {
            console.log(this.realtime_bits.realtime_links, this.cache.meta)
            var current_trend = dataStich( this.realtime_bits.realtime_links, this.cache.meta ), 
                html = drawTrendElements( current_trend );
                
            this.el.innerHTML = html;
            
        },
        
        update_trends : function( trends_list ) {
            /*
                this is the array of history data, when this is updated
                    the display should update...
            */
            this.trends_list = trends_list;
        },
        
        update_realtime : function( realtime_bits ) {
            if(!bitTrends) return;
            var el_items = _q("div", bitTrends );
            
            console.log(el_items);
            //this.realtime_bits = realtime_bits;
            
            // todo
            // redraw, fancy style...            
        },
        
        update_meta : function( expand_and_meta ) {
            extend(this.cache.meta, expand_and_meta);
            console.log( this.cache.meta )
        },
        
        cache : {
            // stuff to cache, like expand data
            meta : {}
        }
        
        
        
    }
    
    // find percent change formular
    // ((current_value/old_value) - 1)*100 ... if oldvalue is 0, it's gonna throw an error
    // Take the new, "current value" and divide it by the old, obsolete value. Subtract 1.00 (or 100%) from the result.
    function _q( query, context ) {
        // returns list, not a live collection...
        var d_context = context || document;
        return d_context.querySelectorAll( query )
    }
    
    function dataStich( realtime_list, bitly_meta ) {
        var key, i=0, realtime, meta, final_results=[], tmp_obj={};
        
        for( ; realtime=realtime_list[i]; i++) {
            key = "http://bit.ly/" + realtime.user_hash;
            meta = bitly_meta[key];
            if(!meta) continue;
            tmp_obj = extend( {}, realtime, meta );
            final_results.push( tmp_obj );
            
        }
        
        return final_results;
        /*
            this method dates the { user_hash : '', clicks : '' } object from the realtime respond
                and add the data from the expand_and_meta call, created one, massive object
                
            This object is for purposes of display
                it might also help to supress on calls to expand and meta, if I have the data already I don't need it
                but another this can deal with that...
        */
    }
    
    
    function drawTrendElements( current_trend_list ) {
        
        var i=0, urls = current_trend_list, url,
            item, html = "";
        html += timeFormat( realtimes_from_cache.timestamp );
        html += '<div class="bitTrendsOuterContainer" id="bitTrends">'
        for( ; url=urls[i]; i++) {

            html += '<div bit_hash="'+url.user_hash+'">'
                
                html += '<div class="bit_trend_clicks">' + url.clicks + '</div>'
                html += escaper( url.title || url.long_url )
                html += '<div>Total: ' + commify( url.user_clicks )  + " of " + commify( url.global_clicks )  + '</div>';
            html += '</div>'                    
        }
        
        html += '</div>'
        console.log(html)
        // you don't have to get elements by ID anymore?? They are just page vars?!
        return html;        
    }
    
    function extend() {
        var target = arguments[0] || {}, length = arguments.length, i=0, options, name, copy;
        for( ; i<length; i++) {
            if( (options = arguments[i] ) !== null) {
                for(name in options) {
                    copy = options[ name ];
                    if( target === copy ) { continue; }
                    if(copy !== undefined ) {
                        target[name] = copy;
                    }
                }
            }
        }

        return target;
    }    
    
    
    
})();