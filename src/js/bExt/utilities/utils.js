// 
//  utils.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-04-08.
//  Copyright 2011 the public domain. All rights reserved.
// 
bExt.utils={
    
    open_page: function( page_name ) {
        
        try {
            var url =  chrome.extension.getURL( page_name ),
                curr_tab, i=0,
                createTab=true, params = { 'selected' : true, 'url' : url };
            chrome.tabs.getAllInWindow(null, function(tab_array) {

               for(; curr_tab=tab_array[i]; i++) {

                   if( curr_tab.url === url ) {
                       createTab=false;
                       chrome.tabs.update( curr_tab.id, params);
                       break;
                   }
               }
                if(createTab) { chrome.tabs.create( { 'url' : chrome.extension.getURL(page_name) }) }
            });
            
        } catch(e){}
    }
    
    
}