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
            //console.log(this.realtime_bits.realtime_links, this.cache.meta)
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
            //console.log(trends.length, this.trends_list.length)
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
            //var el_items = _q("div", bitTrends );
            var el_items = bitTrendsBox.getElementsByTagName("item"), 
                new_bit, i=0, j=0, item, new_bits = realtime_bits.realtime_links || [], 
                position, exisiting_elem=false, old_bit, move_element=false,
                old_bits = this.realtime_bits.realtime_links, href, missing_elements_list=[],
                bit_hash_keys = [], old_bit_hash_keys = [];

            
            var current_trend = dataStich( new_bits, this.cache.meta ),
                trends = this.trends_list.slice(0), html, trend_change_elem;

            // todo
            // check the timestamp whether to 'shift' array or not, aka if they are the same, remove it.
            trends.shift();
            current_trend = addTrendingData( current_trend, trends );            
            //console.log(new_bits)
            for(i=0; i<old_bits.length; i++) { old_bit_hash_keys.push( (old_bits[i]).user_hash  ) }
            
            for(i=0; i<current_trend.length; i++) { 
                bit_hash_keys.push( (current_trend[i]).user_hash  ); 
                var t = current_trend[i];
                console.log(old_bits)
                 if( old_bit_hash_keys.indexOf( t.user_hash ) === -1 ) { 
                        missing_elements_list.push( t ); 
                }
            }
            
            for(i=0; i<old_bits.length; i++) {
               
            }
            
            
            
            // you know what, I cannot move these until the end, b/c it's sequential, so I should just update it
            
            for(i=0; item=el_items[i]; i++) {
                
                old_bit = item.getAttribute("bit_hash")

                
                for( j=0; new_bit = current_trend[j]; j++ ) {
                

                    if( old_bit === new_bit.user_hash ) {
                        // hash match
                        
                        // J is where the element needs to go...
                        trend_change_elem = item.getElementsByClassName("changed_trend")[0]
                        var t_elem = item.querySelector("[class~=bit_trend_clicks]");
                        //console.log(t_elem)
                        t_elem.innerHTML = new_bit.clicks;
                        trend_change_elem.innerHTML = _drawChanged( new_bit );                        
                        //console.log("i, j", i, j);
                        //item.setAttribute("style", "top:"+ j*75  +"px")
                        break;
                    }
                }
                    
            }            
            
            // now deal with missinng elements
            

            
            // bail for now
            
            var counter = 0;
            console.log("I think the missing elements are", missing_elements_list)
            for(var k in missing_elements_list) {
                var bit_trend_item = missing_elements_list[k]
                var clone = document.querySelector("item").cloneNode(true);
                clone.setAttribute("bit_hash", bit_trend_item.user_hash );
                var t_elem = clone.querySelector("[class~=bit_trend_clicks]");
                var t_elem_1 = clone.querySelector("[class~=changed_trend]");  
                var t_elem_2 = clone.querySelector("[class~=bit_trend_title]");                  
                var t_elem_3 = clone.querySelector("[class~=bit_hash_value]");                                  
                              

                //console.log(t_elem, "cool")
                t_elem.innerHTML = bit_trend_item.clicks;  

                t_elem_1.innerHTML = _drawChanged( bit_trend_item );
                t_elem_2.innerHTML = _drawHead( bit_trend_item );
                t_elem_3.innerHTML = bit_trend_item.user_hash;
                // addend the element now to end of container...
                clone.setAttribute("style", "top:"+( (el_items.length+counter)*75 )+"px")
                this.el.appendChild( clone )
                counter+=1;
            }
            
            // now let's move / animate the elements
            

            //this.realtime_bits = realtime_bits;
            
            // todo
            // redraw, fancy style...
        },
        
        update_meta : function( expand_and_meta ) {
            extend(this.cache.meta, expand_and_meta);
            //console.log( this.cache.meta )
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
        //console.log(arguments)
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
                //console.log("---marker---")
            }
                
                //console.log("+++++++++---switch marker---")
        }
        
        //console.log(current_trend)
        
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
            item, html = "", height=75;
        html += timeFormat( realtimes_from_cache.timestamp );
        html += '<div class="bitTrendsOuterContainer" id="bitTrendsBox">';
        for( ; url=urls[i]; i++) {
            
            html += '<item style="top:'+  i*height +'px;" class="bit_trend_item" bit_hash="'+url.user_hash+'">';            
                html += _drawItem( url );
                html += '</item>';                 
        }
        
        html += '</div>';
        // you don't have to get elements by ID anymore?? They are just page vars?!
        return html;
    }
    
    function _drawItem( url, pos ) {
        var html = "";
                    
        html += '<div class="bit_trend_clicks">' + url.clicks + '</div>';
        html += _drawHead( url );

        html += '<div class="changed_trend">';                         
            html += _drawChanged( url );
        html += '</div>';
      
        
        html += '<div class="bit_hash_value">'+ url.user_hash +'</div>'
        //html += '<div>Total: ' + commify( url.user_clicks )  + " of " + commify( url.global_clicks )  + '</div>';
        return html;
    }
    function _drawHead( url ) {
        var html = "";
        html += '<div class="bit_trend_title">'
            html += '<a href="'+escaper(url.long_url)+'" target="new">' + escaper( url.title || url.long_url ) + '</a>';
        html += '</div>'
        
        return html;        
    }
    
    function _drawChanged(url) {
        var html = "";
        
        if(url.time_diff) {
            html += 'Changed: ' + Math.ceil( url.percent_change ) +"%";
            html += url.time_diff;
            html += ' from ' + url.past_clicks + ' clicks';            
        } else {
            html += "No change"
        }


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