// 
//  bitly.hovercard.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2010-12-14.
//  Copyright 2010. All rights reserved.
//  --- dependency: libs/common.js


// var regex_pattern = "(http(?:s)?:\/\/(?:[^/]){1,}?\.(?:[^/]{2,})/(?:[^ ]){1,})",
var regex_pattern = "(http:\/\/([^/]){1,}?\.(?:[^/]{2,})/(?:[^ /]){3,})", timer_interval,
    regex = new RegExp( regex_pattern, "gmi" ),
    false_positive_list = ["clp.ly", "seesmic.com", "wh.gov", "brizzly.com", "post.ly", "twitpic.com", 
                            "yfrog.com", "digg.com", "twitgoo.com", "ficly.com", "google.com", "paste.ly",
                            "su.pr", "venmo.com", "blippy.com", "felttip.com", "github.com", "cnt.to",
                            "is.gd", "tinyurl.com", "twurl.nl", "twitter.com", "ow.ly", "mash.to"];
function is_a_link( txt_string ) {
    var matches;
    if(txt_string && txt_string !== "") {
        matches = txt_string.match( regex );
    }
    
    return matches;
}

function look_for_links() {
    console.log("check for links");
    var links = document.getElementsByTagName("a"), href, matches, query_bitly_link_set=[];
    for(var i=0,link; link=links[i]; i++) {
        href = link.getAttribute("href");

        var exsiting = link.getAttribute("bitly_hovercard"); // has attribute check...
        if(exsiting && exsiting === "1") { continue; }
        matches = is_a_link( href );
        if(matches) {
            var clean_domains = check_domain( matches );
            if(clean_domains && clean_domains.length > 0 ) {
                link.setAttribute("bitly_hovercard", 1);
                console.log("matches... please?", clean_domains);
                // todo, make sure that I don't actually need this
                var p = _pClass(link, ".stream-tweet"), d=document.createElement("div");
                if(p && p.getAttribute("bit_link")) { continue; }
                d.innerHTML="Show";
                if(p){ 
                    p.appendChild(d); 
                    p.setAttribute("bit_link", href);
                    query_bitly_link_set.push( href );
                }    


            }

        }
        

    }
    
    expand_links_and_meta( query_bitly_link_set );
    // console.log("neato query_bitly_link_set", query_bitly_link_set)
    // let's loop and check
    // return query_bitly_link_set;
}

function expand_links_and_meta( link_set ) {
    if(!link_set || link_set.length <= 0 ) {
        return;
    }
    chrome.extension.sendRequest({'action' : 'expand_and_meta', 'short_url' : link_set }, brainResponse);
    
    
}
function brainResponse( jo ) {
    console.log("found these", jo);
    var found_links = document.querySelectorAll("a[bitly_hovercard='1']"),
        parents = document.querySelectorAll(".stream-tweet[bit_link]"), 
        short_link, data = jo.expand_and_meta;
        
    for(var i=0,elem; elem=parents[i]; i++) {
        short_link = elem.getAttribute("bit_link");
        var link_meta = data[short_link];
        if(link_meta) {
            (function(data_elem, global_hash ) {
                chrome.extension.sendRequest({'action' : 'recommend_this_link', 'hash' : global_hash }, function(jo) {
                    console.log("for this one", data_elem, jo)
                    if(jo && jo.info) {
                        draw_recommend( data_elem, jo.info );
                    }
                });                
            })(elem, link_meta.global_hash);
        
            // console.log(link_meta, short_link);
            elem.appendChild( draw_data_card(link_meta) )
        }
    }
    // console.log(found_links, "umm found umm?");
    
    // console.log("then also", parents);
}

function draw_recommend( elem, cool_links ) {
    var html="<ul>", d=document.createElement("div"), title;
    for(var i=0; i<cool_links.length; i++) {
        console.log( cool_links[i], "cool link info" );
        title=cool_links[i].title || "http://bit.ly/" + cool_links[i].global_hash;
        html += '<li><a target="new" href="http://bit.ly/'+cool_links[i].global_hash +'">' + title + '</li>';
    }
    html += '</ul>'
    d.innerHTML=html;
    elem.appendChild(d);
}

function draw_data_card( link_data ) {
    var d = document.createElement("div"), 
        html="", 
        title = link_data.title || link_data.long_url || "";
    html += '<div>';
        html += '<h4>'+ title +'</h4>';
        html += '<div><a href="'+link_data.long_url+'">'+ link_data.long_url +'</a></div>';
    html += '</div>';
    html +="<div>created by <a target='new' href='http://bit.ly/u/"+link_data.created_by+"'>" + link_data.created_by + "</a></div>";
    d.innerHTML=html;
    return d;
}

function check_domain( match_list ) {
    var final_matches=[];
    for(var i=0; i<match_list.length; i++) {
        var domain_name = match_list[i].split("http://")[1].split("/")[0] || "";
        if( false_positive_list.indexOf( domain_name ) < 0 ) {
            final_matches.push( match_list[i] );
        } 
    }
    
    return final_matches;
}

function main() {
    look_for_links();
    timer_interval = setInterval( look_for_links, 5500 );
    //look_for_links();
}
function decay_check() {
    // like after a while of getting nothing, kinda like turn this off or something
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