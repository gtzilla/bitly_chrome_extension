var port = chrome.extension.connect({ "name" : "url_expander"}), page_links,
    timeout_link, expander_visible = false,
    domains = new RegExp( "(twitpic\.com|yfrog\.com|su\.pr|is\.gd|tinyurl\.com|twurl\.nl|twitter\.com|ow\.ly)+" ),
    fullUriRegex = new RegExp( "^((?:https?://){1}[a-zA-Z0-9]{0,3}\.{0,1}(?:[a-zA-Z0-9]{1,8}\.[a-z]{1,3}\\/[a-zA-Z0-9_]{2,20}))(?:[\\/ \\S]?)$", "gi");


// unreal possibility
//http://ow.ly/2iBnE || http://bit.ly/2iBnE+
// bit.ly returns the google news page
// this is a link to the mashable article on the same topic
//  http://mashable.com/2010/07/29/google-search-blocked-china-report/
//  http://news.google.com/news/url?fd=R&sa=T&url=http://www.vindy.com/news/2009/jul/19/heritage-foundation-has-an-alternative-to-health/&usg=AFQjCNGkbpZcLvUGeznDlIAywfUhqa--OA
//  
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
        //href = (links[i].innerHTML).trim()
        href = links[i].getAttribute("href")
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
    return final_matches;
}

function brainResponse(jo) {
    console.log(jo, "the expanded urls");
    
    var links =  document.getElementsByTagName("a"), 
        href, bit_key, user_hash, bit_result, 
        possible_keywords = [], matched_results = [],
        container, body = document.getElementsByTagName("body")[0];
    
    container = document.getElementById("bitly_expanded_container") || document.createElement("div");
    if(!container.id || container.id === "") {
        container.id = "bitly_expanded_container";
        container.addEventListener('mouseover', function(e) {
            expander_visible = true;
        });
    }


    
    if(jo.total <= 0) return; // bail, no links
    
    var matches_links = find_link_elements_by_response( jo );    
    console.log(matches_links)
    body.appendChild( container )
    
    for(var i=0; i<matches_links.length; i++) {
       
        
        // get the relative position of this element so it's not always calculated
        (function( result, elem_num  ) {
            var html = '';
            html += '<div class="bit_url_expander_box">'
                html += '<ul><li><a href="'+ result.short_url +'+">' + result.user_clicks + "</a></li>"
                html += '<li>of</li>'
                html += '<li><a href="'+ result.short_url +'+">' + result.global_clicks + "</a></li>"
                html += '</ul>'
                html += '<p><a href="'+ result.long_url +'">' + trimTitle( result.title || result.long_url ) + '</a></p>'
                html += '<div class="bit_clearer"><hr /></div>'
            html += '</div>'
            
            matches_links[elem_num].elem.addEventListener('mouseover', function(e) {
                console.log(result, e, e.screenX, e.target.offsetWidth)
                container.style.display="block";                
                container.style.top = (e.pageY + e.target.offsetHeight) + "px";
                container.style.left = (e.pageX - e.target.offsetWidth) + "px";                
                container.innerHTML = html;
                
            })
            matches_links[elem_num].elem.addEventListener('mouseout', function(e) {
                if(expander_visible) return;
                container.style.display="none"
            });
            
        })(matches_links[i].bit_result, i);

        
        // result is good, add event listener, wrap this data in via a closure

    }
    
    
    // this idea is to handle AJAX pages, like twitter, where a full page refresh can add urls
    // consider an ONHOVER, check instead...
    // document.addEventListener('click', function(e) {
    //     console.log('document got click... ')
    //     if(timeout_link) { clearTimeout(timeout_link); timeout_link=null; }
    //     timeout_link = setTimeout(function() {
    //         find_short_links();
    //     }, 500)
    // })    
}

function trimTitle( str ) {
    return str
}

function find_link_elements_by_response( jo ) {
    var links =  document.getElementsByTagName("a"), 
        href, bit_key, user_hash, bit_result, 
        possible_keywords = [], matched_results = [];
        
    if(jo.total <= 0) return; // bail, no links
        
    for(var i=0; i<links.length; i++) {
        href = links[i].getAttribute("href")
        //console.log(href)
        // TODO
            // careful with the continue statements
            // I could use lastindexof("/") and then check my value, 
            // might be faster b/c a split is a regex and has to create an array

        if(!href) continue;
        bit_keys = href.split("/");        
        user_hash = bit_keys.pop();
        
        // note, this could miss keywords and other values, we'll pick those up via possible_keywords
        if(!user_hash) continue;
        bit_result = jo.expand_and_meta[ user_hash ]
        
        if(!bit_result) {
            possible_keywords.push( links[i] )
            continue;
        } else {
            matched_results.push( {'elem' : links[i], 'bit_result' : bit_result } )
        }
    }
    
    for(var i=0; i<possible_keywords.length; i++) {
        href = possible_keywords[i].getAttribute("href");
        var bit_obj = jo.expand_and_meta;
        for(var k in bit_obj) {
            if(bit_obj[k].short_url === href) {
                matched_results.push(  {'elem' : links[i], 'bit_result' : bit_obj }  )
                break;
            }
        }
    }
    
    return matched_results;
    
    /// loop over the possible keywords
      
}

function callBrain( final_matches ) {
    if(final_matches.length > 0) {
        //port.postMessage({ "short_links" : final_matches, "type" : "expand_urls"})
        console.log("expand found short links")
        chrome.extension.sendRequest({'action' : 'expand', 'short_url' : final_matches }, brainResponse)        
    }
    
    return;
}

/*
    1. create doc frag
    2. create correct 'hover' structure, save this value to be cloned
    3. find all the links, attached hover events to these links
    4. clone from saved value, display info

*/

function init() {
    var matches = find_short_links();
    callBrain( matches );

}
init();

