var page_links, queried_matches = [],
    timeout_link, expander_visible = false, container, expanded_elements = [], get_more_links_timeout,
    fullUriRegex = new RegExp( "^((?:https?://){1}[a-zA-Z0-9]{0,3}\.{0,1}(?:[a-zA-Z0-9]{1,6}\.[a-z]{1,3}\\/[a-zA-Z0-9_]{2,20}))(?:[\\/ \\S]?)$", "gi"),
    false_positive_list = ["clp.ly", "seesmic.com", "wh.gov", "brizzly.com", "post.ly", "twitpic.com", 
                            "yfrog.com", "su.pr", 
                            "is.gd", "tinyurl.com", "twurl.nl", "twitter.com", "ow.ly", "mash.to"];


// unreal possibility
//http://ow.ly/2iBnE || http://bit.ly/2iBnE+
// bit.ly returns the google news page
// this is a link to the mashable article on the same topic
//  http://mashable.com/2010/07/29/google-search-blocked-china-report/
//  http://news.google.com/news/url?fd=R&sa=T&url=http://www.vindy.com/news/2009/jul/19/heritage-foundation-has-an-alternative-to-health/&usg=AFQjCNGkbpZcLvUGeznDlIAywfUhqa--OA
//  


function no_look_domains( url ) {
    // var matches = url.match(domains);
    // if(matches && matches.length > 0) return true;
    // return false;
    var test_string="";
    for(var i=0; i<false_positive_list.length; i++) {
            test_string = ("http://" + false_positive_list[i]).trim();
            if( url.indexOf( false_positive_list[i] ) > -1 ) {
                return true;
            }
    }
    return false;

}

/*
    the trim method native to a string maybe html5 specific, caution
*/

/*
    http://www.quirksmode.org/blog/archives/2008/01/using_the_assig.html
    http://paste.ly/4Y5
    var x = document.getElementsByTagName('div');
    for (var i=0,div;div=x[i];i++) {
        doSomething(div);
    }

*/

function find_short_links() {
    var links = document.getElementsByTagName("a"), 
        href, matches, final_matches=[], 
        url, i=0, elem;
        
    for ( ; elem=links[i]; i++ ) {
        href = elem.getAttribute("href")
        if(!href) continue;
        
        if(queried_matches.indexOf( href ) > -1 )  { continue; }

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

function findPos(obj) {
    var curleft = curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while(obj = obj.offsetParent)
    }
    
    return [curleft, curtop];
}

function brainResponse(jo) {
    console.log(jo, "the expanded urls");
    
    // start looking for more
    run_find_more_links();
    
    var links =  document.getElementsByTagName("a"), 
        href, bit_key, user_hash, bit_result, 
        possible_keywords = [], matched_results = [],
        body = document.getElementsByTagName("body")[0];
    
    container = document.getElementById("bitly_expanded_container") || document.createElement("div");
    if(!container.id || container.id === "") {
        container.id = "bitly_expanded_container";
        container.addEventListener('mouseover', function(e) {
            clearTimeout(timeout_link);
            expander_visible = true;
        });
        container.addEventListener('mouseout', closeBitlyUrlExpanderBox);
        container.addEventListener('click', function(e) {

            if(e.target.className === "bitly_url_expander_box_close") {
                //console.log("close it.");
                e.preventDefault();
                container.style.display="none";
                return false;
            }
        })
    }


    
    if(jo.total <= 0) return; // bail, no links
    
    var matches_links = find_link_elements_by_response( jo );   
     
    //console.log(matches_links)
    body.appendChild( container )
    
    for(var i=0; i<matches_links.length; i++) {
       
        //expanded_elements.push( matches_links[i].elem )
        // get the relative position of this element so it's not always calculated
        (function( result, elem_num  ) {
            var html = '', el = matches_links[elem_num].elem, positions = findPos( el );
            if(!result || result.error) return;
            //el.setAttribute("title", result.long_url)
            html += '<div class="bit_url_expander_box">'
                html += '<div class="bitly_url_clicksbox">';
                    html += '<ul>';
                        html += '<li class="bit_user_clicks_box"><a title="'+result.short_url+'+ Page" href="'+ result.short_url +'+">' + result.user_clicks + '</a></li>';
                        html += '<li>of</li>';
                        html += '<li class="bit_global_clicks_box"><a title="http://bit.ly/'+ result.global_hash +'+ Page" href="http://bit.ly/'+ result.global_hash +'+">' + result.global_clicks + "</a></li>";
                    html += '</ul>';
                html += '</div>';
                html += '<div class="bitly_url_infobox">'
                    html += '<h3><a title="'+result.long_url+'" href="'+ result.short_url +'">' + ( result.title || result.long_url ) + '</a></h3>'
                    html += '<p><a href="'+ result.long_url +'" class="bit_long_link_preview">'+result.long_url+'</a></p>'
                html += '</div>'
                html += '<a title="Close" class="bitly_url_expander_box_close" href="#">X</a>';
                html += '<a title="bit.ly, a simple URL shortener" class="bitly_home_promo" href="http://bit.ly/">bit.ly</a>';                
                html += '<div class="bit_clearer"><hr /></div>'
            html += '</div>'
            
            
            el.addEventListener('mouseover', function(e) {
                //console.log(e, positions);
                clearTimeout(timeout_link);                
                positions = findPos( el );
                var left_pos = ( positions[0] > e.pageX ) ? (e.pageX-e.offsetX) : positions[0];
                // TODO
                // animate this?
                container.style.display="block";                
                container.style.top = ( positions[1] + e.target.offsetHeight ) + "px";
                container.style.left = left_pos + "px";                
                container.innerHTML = html;
                
            })
            el.addEventListener('mouseout', closeBitlyUrlExpanderBox);
            
            
        })(matches_links[i].bit_result, i);


    }
    
    
 
}

function closeBitlyUrlExpanderBox(e) {
    timeout_link = setTimeout(function(){
        container.style.display="none";
    }, 280)    
}


function find_link_elements_by_response( jo ) {
    var links =  document.getElementsByTagName("a"), 
        href, bit_key, user_hash, 
        bit_result, i=0, elem,
        possible_keywords = [], matched_results = [];
        
    if(jo.total <= 0) return; // bail, no links
        
    //for(var i=0; i<links.length; i++) {
        
    for ( ; elem=links[i];i++ ) {        
        href = elem.getAttribute("href")
        //console.log(href)
        // TODO
            // careful with the continue statements
            // I could use lastindexof("/") and then check my value, 
            // might be faster b/c a split is a regex and has to create an array
        if(!href) continue;
        // bit_keys = href.split("/");        
        // user_hash = bit_keys.pop();
        // 
        // // note, this could miss keywords and other values, we'll pick those up via possible_keywords
        // if(!user_hash) continue;
        try{
            bit_result = jo.expand_and_meta[ href ]            
        } catch(e){}

        
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

function run_find_more_links() {
    
    //return;
    
    if(get_more_links_timeout) {
        clearTimeout(get_more_links_timeout);
        get_more_links_timeout = null;
    }
    
    get_more_links_timeout = setTimeout(function() {
        
        var matches = find_short_links();
        queried_matches = queried_matches.concat( matches );        
        callBrain(matches)
        
    }, 5500)
}

function callBrain( final_matches ) {
    //var body = document.getElementsByTagName("body")[0];
   
    if(final_matches.length > 0) {
        //port.postMessage({ "short_links" : final_matches, "type" : "expand_urls"})
        //console.log("expand found short links")
        chrome.extension.sendRequest({'action' : 'expand_and_meta', 'short_url' : final_matches }, brainResponse)        
    } else {
        run_find_more_links();
    }
    
    return;
}


function init() {
    console.log("running the expander script")
    var matches = find_short_links();    
    queried_matches = queried_matches.concat( matches );
    callBrain( matches );

}
// hi there, look for short urls
init();

