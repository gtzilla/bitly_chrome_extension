// 
//  bEvt.Evt.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-04-11.
//  Copyright 2011 the public domain. All rights reserved.
// 
// if(!bExt) { var bExt={}; }

bExt.Evt=function(request, sender, callback) {
    // an Ext Event Wrapper / Representation
    this.__finished=false;
    if(arguments.length > 1) {
         this.original_args=arguments;
         // request settingss
         this.page_name=request && request.page_name;
         this.account_id=request && request.account_id;
         this.is_active=request && request.active || false;
         this.short_url=request && request.short_url;
         this.long_url=request && request.long_url;         
         this.share_text=request && request.share_text;
         this.share_link=request && request.share_link;
         this.api_domain=request && request.api_domain;         
         
         this.url=sender && sender.tab && sender.tab.url;
         this.is_http=this._find_http();
         this.domain_host=bExt.match_host(  this.long_url || this.url );
         
         // support for Chrome request Tab ID or sent value (popup)
         this.tab_id=request && request.tab_id || sender && sender.tab && sender.tab.id || null;
         
         this.__cb=callback && (typeof callback === "function") && callback || function(){ this.__finished=true; };
         
    } else {
        var data=arguments[0];
        if(data.callback){ 
            this.__cb=data.callback
        }
    }
    
    return this;
}


bExt.Evt.prototype={
    /*
        usage
            new bExt.Evt( request, sender, sendResponse );
    */
    // bExt.Evt.callback
    _find_http : function() {
        var url = this.long_url || this.url || "";
        return ((url.trim()).indexOf("http") === 0) || false;
    },
    
    callback : function( data ) {
        var cb=this.__cb;
        if(this.__finished){  return; }
        this.__finished=true;
        if(cb && (typeof cb).toLowerCase() === "function") {
            cb( data || {} );
        }
    }
}
