/*
    
    Dependency: common.js, timeFormat.js, fastFrag.js
    
    This 'script' is really just an interface to the trends DOM structure
        
        It does the following:
            Draws the trend data on init
            
            Provides methods to:
                update
                show certain data

*/

(function() {
    
    var bitTrends = function( el, realtime_bits, opts ) {
        return new bTrend( el, realtime_bits );
    }, settings = {
        
        base_domain : "bit.ly"
    };
    window.bitTrends = bitTrends;
    var trend_height = 75;
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
                trends = _copy( this.trends_list ), html, results;

            trends.shift();
            current_trend = addTrendingData( current_trend, trends );
            //
            html = drawTrendElements( current_trend );
            results = fastFrag.create( html )
            this.el.innerHTML = "";
            this.el.appendChild( results );
        
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
                trends = _copy(this.trends_list), html, trend_change_elem;

            current_trend = addTrendingData( current_trend, trends );            
            for(i=0; i<old_bits.length; i++) { old_bit_hash_keys.push( (old_bits[i]).user_hash  ) }
            
            for(i=0; i<current_trend.length; i++) { 
                bit_hash_keys.push( (current_trend[i]).user_hash  ); 
                var t = current_trend[i];
                 if( old_bit_hash_keys.indexOf( t.user_hash ) === -1 ) { 
                        missing_elements_list.push( t ); 
                }
            }
            
            for(i=0; item=el_items[i]; i++) {
                
                old_bit = item.getAttribute("bit_hash")

                
                for( j=0; new_bit = current_trend[j]; j++ ) {
                

                    if( old_bit === new_bit.user_hash ) {
                        // hash match
                        
                        // J is where the element needs to go...
                        trend_change_elem = _q(".changed_trend", item);
                        var t_elem = _q(".bit_trend_clicks", item);
                        t_elem.innerHTML = "";
                        t_elem.appendChild( fastFrag.create( _drawClicks( new_bit )  ) )
                        //t_elem.innerHTML = ;
                        trend_change_elem.innerHTML = "";
                        trend_change_elem.appendChild( fastFrag.create( _drawChanged( new_bit ) ) )
                                               
                        break;
                    }
                }
                    
            }            
            
            // now deal with missinng elements
            

            
            // TODO
            // refactor and cleanup, yuck
            
            for(i=0;i<el_items.length; i++ ) {
                var b_hash = el_items[i].getAttribute("bit_hash");
                if(bit_hash_keys.indexOf( b_hash ) === -1 ) {
                    el_items[i].parentNode.removeChild( el_items[i] );
                    // todo
                    // todo: serious
                    // todo: now move everything from here - down, up
                    // 2-length, move by 75  pixels up (top)
                    // this case is hard to fall into.. creating a solution is difficult
                }
            }            
            
            var counter = 0;
            //console.log("The missing elements are", missing_elements_list);
            for(var k in missing_elements_list) {
                var bit_trend_item = missing_elements_list[k],
                    el_position = (el_items.length+counter)*trend_height,
                    results = fastFrag.create({
                    type : "item",
                    css : "bit_trend_item",
                    attributes : {
                        bit_position : el_position,
                        bit_hash : bit_trend_item.user_hash,
                        style : 'top:' + el_position +'px;'

                    },
                    content : _drawItem( bit_trend_item )                
                });
                bitTrendsBox.appendChild( results );
                counter+=1;
            }
            
            // update 'current'
            this.realtime_bits = realtime_bits;

            // now let's move / animate the elements
            var trend_el, b_pos;            
            for(i=0; i<current_trend.length; i++) {
                // alright, now find this elements position...

                try{
                    trend_el= _q("[bit_hash~='"+ current_trend[i].user_hash +"']", bitTrendsBox);
                } catch(e){
                    // take this node out??
                }
                b_pos = trend_el.getAttribute("bit_position")*1
                if( i*trend_height === b_pos ) {
                    //console.log("position is the same")
                } else {
                    trend_el.setAttribute("bit_position", (i*trend_height) )
                    emile(trend_el, "top:"+ (i*trend_height)  +"px;", { 
                            duration: 1700
                          });                    
                                      
                }

            }
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
    

        
    function addTrendingData( current_trend, trends ) {

        var i=0, trend, key, j=0, past_trend, past_realtime, past_realtimes, ii=0;
        
        outerLoop:
        for( ; trend=current_trend[i]; i++) {
            key = trend.user_hash;
            
            for(j=0; past_trend = trends[j]; j++) {
                past_realtimes = past_trend.realtime_links;
                for(ii=0; past_realtime=past_realtimes[ii]; ii++) {
                    //console.log(past_realtime)
                    if(key === past_realtime.user_hash && trend.clicks !== past_realtime.clicks) {
                        //console.log(trend.user_hash, trend.clicks, past_realtime.clicks, past_trend.timestamp )
                        
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
                }
            }
                
        }
        
        return current_trend;
    }
    
    function dataStich( realtime_list, bitly_meta ) {
        var key, i=0, realtime, meta, final_results=[], tmp_obj={};
        
        for( ; realtime=realtime_list[i]; i++) {
            key = "http://"+settings.base_domain+"/" + realtime.user_hash;
            meta = bitly_meta[key];
            if(!meta) continue;
            tmp_obj = extend( {}, realtime, meta );
            final_results.push( tmp_obj );
        
        }
        
        return final_results;
        /*
        
        notes:
            this method dates the { user_hash : '', clicks : '' } object from the realtime respond
                and add the data from the expand_and_meta call, created one, massive object
            
            This object is for purposes of display
                it might also help to supress on calls to expand and meta, if I have the data already I don't need it
                but another this can deal with that...
        */
    }
    
    
    function drawTrendElements( current_trend_list ) {
        
        var i=0, urls = current_trend_list, url,
            item, html = "", height=trend_height, structure, structure_items = [];

        for( ; url=urls[i]; i++) {
            
            structure_items.push({
                type : "item",
                css : "bit_trend_item",
                attributes : {
                    bit_position : (i*height),
                    bit_hash : url.user_hash,
                    style : 'top:' + i*height +'px;'

                },
                content : _drawItem( url )                
            })
            
                            
        }
        
        structure = {
            css : "bitTrendsOuterContainer",
            id : "bitTrendsBox",
            content : structure_items
        }
        
        return structure;
    }
    
    function _drawItem( url ) {
        
        var structure = [{
            css : "bit_trend_clicks",
            content : _drawClicks( url )
        },{
            css : "bit_trends_meta",
            content : [ _drawHead( url ), {
                css : "changed_trend",
                content : _drawChanged( url )
            }, {
                css : "bit_hash_value",
                attributes : {
                    style : "display:none;"
                },
                content : url.user_hash
            }]
        },{
            css : "hr",
            content : {
                type : "hr"
            }
        }];
        
        return structure;

    }
    
    function _drawClicks( url ) {
        var structure = [{
            css : "click_number",
            content : commify( url.clicks )
        }, {
            css : "smallText",
            content : "clicks"
        }]
        return structure;
    }
    function _drawHead( url ) {
        
        return {
            css : "bit_trend_title",
            content : [{
                css : "treadHeader",
                content : {
                    type : "h3",
                    content : {
                        type : "a",
                        content : url.title || url.long_url,
                        attributes : {
                            href : url.long_url
                        }
                    }
                }
            },{
                css : "longlink",
                content : {
                    type : "a",
                    content : url.long_url,
                    attributes : {
                        href : url.long_url
                    }
                }
            }]
        }
                
    }
    
    function _drawChanged(url) {
        var diff = [], structure, dir = "up";
        diff.push({
            type : "a",
            attributes : {
                href : 'http://'+settings.base_domain+'/'+url.user_hash+'+',
                target : "new"
            },
            content : ' more info +'
        })
        structure = diff
        
        return structure;

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
    
    function _copy( obj1 ) {
        // http://my.opera.com/GreyWyvern/blog/show.dml/1725165
        // derivative of prototype method, don't want to mess with native types (object, boolean, string etc)
        var i, newObj = (obj1 instanceof Array) ? [] : {};
        for (i in obj1) {
          if (obj1[i] && typeof obj1[i] == "object") {
            newObj[i] = _copy( obj1[i] );
          } else { newObj[i] = obj1[i]; }
        } return newObj;        
    }    

})();