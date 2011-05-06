// 
//  bExt.metrics.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-05-06.
//  Copyright 2011 the public domain. All rights reserved.
// 

(function(window, undefined){
    
window.bExt.metrics = {
    
    init : function() {
        
        var r_meta = bExt.info.get("realtime") || {},
            popup_history=bExt.info.get("popup_history") || [];
            
        console.log("realtime", r_meta);
        console.log("popup", popup_history);
        
        
    },
    
    
    
    
}
    
})(window);