// 
//  bEvt.Evt.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-04-11.
//  Copyright 2011 the public domain. All rights reserved.
// 
if(!bExt) { var bExt={}; }
bExt.Evt=function(request, sender, callback) {
    // an Ext Event Wrapper / Representation
    this.__finished=false;
    this.url=sender.tab && sender.tab.url;
    this.domain_host=bExt.match_host( this.url );
    this.tab_id=sender && sender.tab && sender.tab.id || null;
    this.__cb=callback && (typeof callback === "function") && callback || function(){};
    // return this;
}


bExt.Evt.prototype={
    /*
        usage
            new bExt.Evt( request, sender, sendResponse );
    */
    // bExt.Evt.callback
    callback : function( data ) {
        var cb=this.__cb;
        if(this.__finished){  return; }
        this.__finished=true;
        if(cb && (typeof cb).toLowerCase() === "function") {
            cb( data || {} );
        }
    }
}