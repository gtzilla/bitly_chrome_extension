var port = chrome.extension.connect({ "name" : "url_expander"}), page_links,
    timeout_link,
    domains = new RegExp( "(twitpic\.com|yfrog\.com|su\.pr|is\.gd|tinyurl\.com|twurl\.nl|twitter\.com)+" ),
    fullUriRegex = new RegExp( "^((?:https?://){1}[a-zA-Z0-9]{0,3}\.{0,1}(?:[a-zA-Z0-9]{1,8}\.[a-z]{1,3}\\/[a-zA-Z0-9_]{2,20}))(?:[\\/ \\S]?)$", "gi");

port.onMessage.addListener(function(msg) {
    console.log("I hear", msg)
    if( msg.expands.length > 0) {
        expand_links(msg.expands)
    }
});

function expand_links( long_urls  ) {
    var links = document.getElementsByTagName("a"), href
    
    for(var i=0; i<links.length; i++) {
        href = links[i].innerHTML, text = links[i].innerHTML;
        if(!href || href === "") continue;
        for(var j=0; j< long_urls.length; j++) {
            if(long_urls[j].error) continue;
            if(text === long_urls[j].short_url) {
                links[i].innerHTML = long_urls[j].long_url
                // I could pu the bit.ly back to fix the backtype item here
            }
        }
    }
}

function no_look_domains( url ) {
    var matches = url.match(domains);
    if(matches && matches.length > 0) return true;
    return false;
}

/*
    the trim method native to a string maybe html5 specific, caution
*/
function find_short_links() {
    console.log("running the expander script")
    var links = document.getElementsByTagName("a"), href, matches, final_matches=[], url
    for(var i=0; i<links.length; i++) {
        href = (links[i].innerHTML).trim()
        if(!href) continue;
        matches = href.match(fullUriRegex)
        if(!matches) continue;
        for(var j=0; j<matches.length; j++) {
            url = matches[j].trim()
            if( no_look_domains( url ) ) { continue; }
            
            if( url.indexOf(document.location.host) == -1  ) {
                final_matches.push(url)
            }
        }
    }
    console.log(final_matches)
    if(final_matches.length > 0) {
        port.postMessage({ "short_links" : final_matches, "type" : "expand_urls"})
    }

}

function init() {
    find_short_links();
    
    document.addEventListener('click', function(e) {
        console.log('document got click... ')
        if(timeout_link) { clearTimeout(timeout_link); timeout_link=null; }
        timeout_link = setTimeout(function() {
            find_short_links();
        }, 500)
    })
}
init();

