/*
    name : extensionToolBar
    file : jquery.extensionToolBar.js
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
    
    $.fn.extensionToolBar = function( options ) {
        // extend the defaults settings
        var el = this, o = $.extend(true, defaults, options), 
            metrics_box, flotBox, out_container,
            $toolbar;
        /*
            ISSUES
            
            refreshing the page will not close the socket (since it's on the backend...)
            
            I need to attach an even to the tab from the background page... and deal with that refresh / create / destroy from there
        */
        
        chrome.extension.onConnect.addListener(function(port) {
            console.log('the on connect in checkurl fires' , port)
            if(!$toolbar) $toolbar = $('<div id="_bitly_extension_toolbar" />').appendTo(el);
            port.onMessage.addListener(function(  message  ) {
                console.log(message, "add listener is check url as a content script!")
                
                buildToolBar( message, port )
                
                if(message.hash) buildMetricsGraph(message)
                else if(message.clicks && message.clicks[0].global_clicks > 0) {
                    // standard click data?
                    var total_global_clicks = message.clicks[0].global_clicks
                    $('<span />').html('Total Clicks: ' + total_global_clicks).appendTo($toolbar)
                }
            });
        });
        return this;
    
        function buildToolBar( message, port ) {
            if(!out_container) {
                out_container = $('<div id="_bitly_metrics_container"></div>').appendTo($toolbar)
                $('<a />').addClass('_bitly_close_toolbar').attr('href', '#').html('Close').appendTo($toolbar)
                $('<a href="#"></a>').html('My Tracking Metrics').appendTo($toolbar).toggle(function(e) {
                    e.preventDefault();
                    $("#_bitly_metrics_container").animate({
                        top : '-205px'
                    });
                }, function(e) {
                    e.preventDefault();
                    $("#_bitly_metrics_container").animate({
                        top : '30px'
                    });                    
                })
                $('<a href="http://bit.ly/'+message.hash+'+"></a>').html('Info Page+').appendTo($toolbar)
                $toolbar.find('._bitly_close_toolbar').bind('click', function(e) {
                    e.preventDefault();
                    // send the close...
                    port.postMessage({'command' : 'close'})
                    $toolbar.remove();
                    $toolbar=null; out_container=null; flotBox=null; $toolbar=null;
                })                    
                
            }            
        }
        
        function buildMetricsGraph( message ) {
            var series, i=0, r, points=[], totalClicks = 0, maxValue=1; 
                clicks = message.clicks;

            for(; i<clicks.length; i++) {
                r = clicks[i];
                //console.log( r.date );
                points.push( [ r.ts*1000, r.clicks ] );
                totalClicks += r.clicks;
            }
            
            if(totalClicks === 0) {
                console.log('BAILING: not drawing graph because there is no click data...')
                //$toolbar.find('._bitly_close_toolbar').click();
                return;
            }
            
            if(!flotBox) flotBox = $('<div class="innerWeeklyClickSummaryContainer"></div>').appendTo(out_container);
            // if(totalClicks <= 0 ) return;
            // el.slideDown();
            series = {"data" : points, "label" : "Past hour" };
            plot = $.plot( flotBox, [series], o.graphOptions )                
            console.log('Graph has been drawn to page via flot')            
        }
    
    }
    
    var defaults = {
        
        graphOptions : {

            colors: ["#77C8FC"],
            xaxis: {
                mode: "time",
                //timeformat: ""
                timeformat: "%h:%M%p",
                ticks : 3,
                position : "bottom"                
                
            },

            yaxis: { 
                
                min: 0,
                tickDecimals : 0,
                position : "left"
                
            },
            /* change in 0.6 */
            series : {
                bars: {
                    show: true,
                    // minTickSize: [1, "day"],
                    lineWidth: 0, // in pixels
                    barWidth: 30*1000, // in units of the x axis
                    //barWidth : 1,
                    fill: true,
                    fillColor: "#77C8FC"
                }
            },
            legend: {
                show: false
            },
            grid: {hoverable: false, clickable: true, borderWidth: 0, show:true, 
                    markings: [ { xaxis: { from: 0, to: 1 } }],
                    backgroundColor : '#EFEFEF', borderColor:'#999999'}                

        }        
    };
    
})(jQuery);
$(document.body).extensionToolBar();