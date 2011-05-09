// 
//  bExt.metrics.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-05-06.
//  Copyright 2011 the public domain. All rights reserved.
// 

(function(window, undefined){

var settings = {
    box : "#middle",
    canvas : null,
    canvas_elem : null,
    ctx : null,
    width : 900,
    height : 450
}, __lst=[], drawing_opts = {
    start_time : null
};
// framing.. for animation... hmmm
window.bExt.metrics = {
    /*
        Info
            
            This API is planning to use the new window.webkitRequestAnimationFrame API
                
                This became available in chrome 10
                    https://developer.mozilla.org/en/DOM/window.mozRequestAnimationFrame#AutoCompatibilityTable
            
            Mozilla docs
                
                https://developer.mozilla.org/en/DOM/window.mozRequestAnimationFrame
    */
    init : function( opts ) {
        settings=jQuery.extend(true, {}, settings, opts );
        var r_meta = bExt.info.get("realtime") || {},
            popup_history=bExt.info.get("popup_history") || [],
            links, params={
                'hash' : []
            };
            
        console.log("realtime", r_meta);
        console.log("popup", popup_history);
        
        links=r_meta.realtime_links;
        for(var i=0; i<links.length; i++) {
            params.hash.push( links[i].user_hash );
        }

        bExt.api.clicks_by_minute( params, bExt.metrics_evts.clicks_by_minute);

    },
    
    assemble : function() {
        var canvas_id="bitly_metrics_canvas_tag";
        settings.canvas="#"+canvas_id;
        
        $(settings.box).append(fastFrag.create(search_frag() ) )
                       .append( fastFrag.create( canvas_frag( canvas_id, settings.width, settings.height ) ) );
        
        console.log(settings.width)
        settings.canvas_elem = document.getElementById( canvas_id );
        settings.ctx = settings.canvas_elem.getContext("2d");    
    },
    
    track_data : function( metrics_meta_obj  ) {
        var m = new bExt.metrics.Meta( metrics_meta_obj  );
        __lst.push( m );
        
        return m;
        
    },
    
    
    
    request_animation : function() {
        window.webkitRequestAnimationFrame(bExt.metrics.canvas_framerate, settings.canvas_elem);
    },
    
    // http://www.highcharts.com/
    canvas_framerate: function( time_code ) {
        if(!drawing_opts.start_time) { drawing_opts.start_time=time_code; }
        var context=settings.ctx, 
            total_w=settings.width,
            total_h = settings.height-20,
            m_meta, clicks, contine_draw=false;
        console.log("this", this, time_code);
        
        
        context.beginPath();
        context.lineWidth = 4;
        context.strokeStyle = "black"; // line color        
        
        
        for(var i=0; i<__lst.length; i++) {
            m_meta = __lst[i];
            
            clicks=m_meta.get("clicks");
            var pos = m_meta.get("pos"), 
                target_start=clicks[m_meta.get("pos")],
                target_end=clicks[m_meta.get("pos")+1] || 0;
            
            
            // context.clearRect( 0, 0, total_w, total_h  );   
            console.log(target_start, "target_start", pos, context, (total_h-target_start));
            
            context.beginPath();            
            context.arc(pos*10, total_h-(target_start*10), 10, 0, Math.PI*2, true); 
            // context.arc(50, 40, 30, 0, Math.PI*2, false);             

            // context.fill();
            // context.moveTo(pos*10,total_h-target_start*10);
            // context.lineTo((pos+1)*10,total_h-target_end*10);
            // context.lineTo(pos*10,total_h-target_start*10);
            // context.lineTo(10,300);                
            // context.lineWidth = 15;
            // context.strokeStyle = "black"; // line color
            context.stroke();            
            context.closePath();
                        
            if(pos<clicks.length-1) {
                contine_draw=true;
            }
            console.log(clicks[m_meta.get("pos")], "count")
            m_meta.increment();
        }
        context.closePath();
        // if(i % 7 && i !== paint_graph.length-1) {continue;}
        
        // instructions, an array or methods -- lineTo, moveTo etc
        
        /*
            [{
                name : "lineTo",
                args : [arg1,arg2,arg3]
            }]
            
            context[item.name].apply( context, items.args || [] );
        */
        
        // context.clearRect( 0, 0, total_w, total_h  );          
        // context.moveTo(50,0);
        // context.lineTo(100,300);
        // context.lineTo(10,10);
        // context.lineTo(10,300);                
        // context.closePath()
        // context.stroke();        
        // if not complete, recall  bExt.metrics.request_animation();
        
        if(contine_draw) {
            bExt.metrics.request_animation();
        }
    }
    
    
}

function search_frag() {
    
    return {
        content : [{
            type : "form",
            content : [{
                type : "input",
                id : "search_links",
                attr : {
                    type : "text",
                    name : "search_links",
                    value : "Search for links"
                }
            }, {
                type : "input",
                attr : {
                    type : "submit",
                    value : "Add to Chart"
                }
            }]
        }]
    }
    
}

function canvas_frag( canvas_id, w, h ) {
    
    return {
        id : "bitly_metrics_canvas_tag_box",
        content : {
            type : "canvas",
            id : canvas_id,
            attrs : {
                "width" : w,
                "height" : h
            }
        }
        
    }
}


window.bExt.metrics_evts = {
    
    clicks_by_minute : function( jo ) {
            
            /// I GET THE GLOBAL HASH BACK!!!
            // I CAN NOW CALL AND GET THE DATA FOR THE GLOBAL HASH
            // THEN I CAN CHART THEM AGAINT EACH OTHER
            console.log("clicks by minute", jo);
            var clicks_meta = jo.clicks_by_minute;
            console.log("clicks_meta", clicks_meta)

            
            for(var k in clicks_meta) {
                var meta = bExt.metrics.track_data( clicks_meta[k] );
                console.log(meta)
                
            }
            bExt.metrics.request_animation();             
            

    }
    
}


/*
    Represent the bitly data used to draw the graph
*/
window.bExt.metrics.Meta = function( opts ) {
    this.__m=jQuery.extend(true, {}, this.__m, opts);
    this.__m.clicks.reverse();
    return this;
}

window.bExt.metrics.Meta.prototype = {
    
    graph : function( ctx ) {
        // ctx == context for canvas element
    },
    
    points : function() {
        // track the elemt points and their divs
        
    },
    
    increment : function() {
        this.__m.pos+=1;
    },    
    
    out : function() {
        return this.__m;
    },
    get : function( k ) {
        return this.__m[k];        
    },
    

    
    set : function(k, value) {
        return this.__m[k]=value;
    },
    "event_method" : null, // the event method and context to use when handling events
    "__m" : {
        "clicks" : [],
        "hash" : null,
        "user_hash" : null,
        "is_complete" : false,
        "pos" : 0        
        
    }
    
}
    
})(window);