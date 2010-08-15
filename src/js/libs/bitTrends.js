/*
    
    Dependency: common.js, timeFormat.js
    
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
            // ingore first
            
            //todo
            // error handle, make sure I have
                // this.realtime_bits
                // this.cache.meta has data in it...
            
            
            var current_trend = dataStich( this.realtime_bits.realtime_links, this.cache.meta ),
                trends = this.trends_list.slice(0), html;
            
            // todo
            // check the timestamp whether to 'shift' array or not, aka if they are the same, remove it.
            trends.shift();
            current_trend = addTrendingData( current_trend, trends );
            //
            html = drawTrendElements( current_trend )
            console.log(trends.length, this.trends_list.length)
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
        },
        trends_list : []
        
        
    
    }
    
    // find percent change formular
    // ((current_value/old_value) - 1)*100 ... if oldvalue is 0, it's gonna throw an error
    // Take the new, "current value" and divide it by the old, obsolete value. Subtract 1.00 (or 100%) from the result.
    function _q( query, context ) {
        // returns list, not a live collection...
        var d_context = context || document;
        return d_context.querySelectorAll( query )
    }
    
    function addTrendingData( current_trend, trends ) {
        console.log(arguments)
        //trends = trends.slice(0,10)
        var i=0, trend, key, j=0, past_trend, past_realtime, past_realtimes, ii=0;
        
        outerLoop:
        for( ; trend=current_trend[i]; i++) {
            key = trend.user_hash;
            
            for(j=0; past_trend = trends[j]; j++) {
                // console.log( past_trend );
                // console.log(past_trend.realtime_links)
                // console.log(past_trend.realtime_links)
                past_realtimes = past_trend.realtime_links;
                for(ii=0; past_realtime=past_realtimes[ii]; ii++) {
                    //console.log(past_realtime)
                    if(key === past_realtime.user_hash && trend.clicks !== past_realtime.clicks) {
                        console.log(trend.user_hash, trend.clicks, past_realtime.clicks, past_trend.timestamp )
                        
                        trend.past_timestamp = past_trend.timestamp;
                        trend.past_clicks = past_realtime.clicks;
                        trend.depth=j;
                        if(past_realtime.clicks !== 0) {
                            trend.percent_change = ((trend.clicks/past_realtime.clicks-1)*100);
                            
                            
                            trend.time_diff = timeFormat( past_trend.timestamp );
                        } else {
                            trend.percent_change=100
                        }
                        
                        continue outerLoop;
                    }
                    // change in last 5 minutes....
                    // if something
                    // should be about to break at least this loop.
                }
                console.log("---marker---")
            }
                
                console.log("+++++++++---switch marker---")
        }
        
        console.log(current_trend)
        
        return current_trend;
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
        html += '<div class="bitTrendsOuterContainer" id="bitTrends">';
        for( ; url=urls[i]; i++) {
            
            html += '<div bit_hash="'+url.user_hash+'">';
                
                html += '<div class="bit_trend_clicks">' + url.clicks + '</div>';
                html += escaper( url.title || url.long_url );
                if(url.time_diff) {
                    html += '<div>';
                        html += 'Changed: ' + Math.round( url.percent_change ) +"%";
                        html += url.time_diff;
                        html += ' from ' + url.past_clicks + ' clicks';
                    html += '</div>';
                }

                
                html += '<div>Total: ' + commify( url.user_clicks )  + " of " + commify( url.global_clicks )  + '</div>';
            html += '</div>';
        }
        
        html += '</div>';
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