/*
    html5 workers
    http://robertnyman.com/2010/03/25/using-html5-web-workers-to-have-background-computational-power/
*/
var timer;
onmessage = function(evt) {
    //evt.data

    if(!evt.data || !evt.data.realtime_links) { return; }
    
    
    var results = processRealtimeResultsResponse( evt.data );
    postMessage({'action' : 'analyzed_links', 'results' : results });
    if(results.watch_list.length > 0 ) {
        startTimer();        
    }

}

function processRealtimeResultsResponse(jo) {
    var link, links = jo && jo.realtime_links, curr_time = (new Date()).getTime(), 
        w_list = jo.watch_list || [], final_watch_links = [],
        old_time=curr_time - (1000*60*60*24), dead_links=[], short_urls;
    short_urls=[];
    for(i=0; link=links[i]; i++) {
        for(j=0; item=w_list[j]; j++) {
            hash = (item.short_url.split("/")).reverse().shift();
            // todo
            // drop out links after 1 day
            
            if(item.timestamp < old_time) {
                dead_links.push(short_url);
            } else if( hash === link.user_hash && item.threshold <= link.clicks ) {
                short_urls.push( item.short_url );
                break;
            }
        }   
    }  
    
    
    // strip the dead
    for(i=0; i<w_list.length; i++) {
        if( dead_links.indexOf( w_list[i] ) === -1 ) { final_watch_links.push( w_list[i]); }
    }
    // leave 'dead_links' in so the background page can strip fron localstorage and localsql
    // we are trimming here to avoid 
    return { 'dead_links' : dead_links, 'short_urls' : short_urls, 'watch_list' : final_watch_links }  
}

function startTimer() {
    if(timer) clearTimeout(timer);
    setTimeout(timerComplete, 30000);
}


function timerComplete() {
    postMessage({ 'action' : 'realtime'});
}