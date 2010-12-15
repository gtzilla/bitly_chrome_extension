// 
//  bitly.hovercard.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2010-12-14.
//  Copyright 2010. All rights reserved.
// 
// var regex_pattern = "(http(?:s)?:\/\/(?:[^/]){1,}?\.(?:[^/]{2,})/(?:[^ ]){1,})",
var regex_pattern = "(http:\/\/(?:[^/]){1,}?\.(?:[^/]{2,})/(?:[^ ]){3,})", timer_interval,
    regex = new RegExp( regex_pattern, "gmi" );
function is_a_link( txt_string ) {
    var matches;
    if(txt_string && txt_string !== "") {
        matches = txt_string.match( regex );
    }
    
    return matches;
}

function look_for_links() {
    console.log("check for links")
    var links = document.getElementsByTagName("a"), href, matches;
    for(var i=0,link; link=links[i]; i++) {
        // party
        href = link.getAttribute("href");
        // has attribute check...
        var exsiting = link.getAttribute("bitly_hovercard")
        if(exsiting && exsiting === "1") {
            
            continue;
        }
        matches =is_a_link( href );
        console.log("matches... please?", matches);
    }
    // let's loop and check
}

function main() {
    look_for_links();
    //timer_interval = setInterval( look_for_links, 5500 );
    //look_for_links();
}

main();


/*
    Items to note
        Hovercard
            appear above link in drawing it will appear 'off screen' (screen height)
*/

/*
    Flow
    
        1. attach hover event to any link that matches REGEX (it's a link)
        2.      -- when activated, show a loading state
        
                        Create Element Structure as follows
                    Start:
                    parentElement
                        linkelement
                    
                    Finish
                    parentElement
                        linkelement                        
                    position: absolute to most 'relative' image ?? or something, maybe fixed to screen pos... i dunno
                    
        
        3. Onhover
                ---- see if card exists, only ask for clicks if so
                
                ---- send info for this link to brain
                ----    If it's a short URL in the whitelist, do the clicks thing
                        
                        
                        (optional)
                        If it's a long url, see if anyone shortened it????
                
                Send Buckshot request -- clicks, info, decode etc, let return to page as soon as received
                
        4. OnResponses, draw in card -- if it still exists
        
        
    
    Stack Arch
        .. element that sends request needs to get them -- in async fashion.. 
        
        var href = el.getAttribute("href")
        var matches = href.match( regex );
        if(matches) {
            // callbrain
            
            function(brain_response) {
            
                el.parentNode.appendChild( new_hovercard  )
            }
        }
                        
*/