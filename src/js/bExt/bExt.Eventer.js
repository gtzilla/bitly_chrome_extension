// 
//  Eventer.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-04-08.
//  Copyright 2011 the public domain. All rights reserved.
// 
if(!bExt) { var bExt={}; }
bExt.Eventer=function() {
    this.methods={
        'default' : function() {
            console.log('no listener assigned');
        }
    }
    this.is_chrome=chrome && chrome.tabs ? true : false;
    // common events
    this.common_actions=["page_loaded", "share"];
}


/*
    bitly Ext
    
        usage:
            var b = new bExt.Eventer();
            b.register("name", fn);
    
        Eventer
            
*/
bExt.Eventer.prototype={
    /* si  */
    register : function( name, fn_method ) {
        var fn_type=(typeof fn_method).toLowerCase();
        if(!fn_method) { return; } // quietly, do nothing
        if(fn_type === "function") {
            this.methods[name]=fn_method;
        } else if (fn_type === "object") {
            // ghetto ass extend
            for(var k in fn_method) { this.methods[k]=fn_method[k]; }
        }
    },
    
    trigger : function( name, payload ) {
        var evt_payload = new bExt.Evt( payload );
        this._event_direction( name, evt_payload );        
    },
    chrome_listen : function( request, sender, sendResponse  ) {
        try {
            chrome.extension.onRequest.addListener( this._chrome_listen._scope(this) );
        } catch(e){ console.log("Chrome JS object not present"); }
        
    },
    // webkit_listen : function() {}
    _chrome_listen : function( request, sender, sendResponse  ) {
        var evt_payload = new bExt.Evt( request, sender, sendResponse );
        /*
            request.action is not chrome specific
                we add 'action' so we have fewer listeners
            
            This is PARTY channel, anything inside chrome can listen
        */
        this._event_direction( request && request.action, evt_payload );
    },
    
    _event_direction : function( name, evt ) {
        if(!name) { return; }
        var data, fn=this.methods[name];
        if(fn && (typeof fn).toLowerCase() === "function") {
            data = fn.call(this, evt);
        }
    },
    
    _mklist : function(lst_or_str) {
        // int/float/NaN/undefined will get skipped here
        if(lst_or_str && (typeof lst_or_str).toLowerCase() === "string" ) {
            return [lst_or_str]
        }
        return lst_or_str
    },
    
    open_page : function( page_name ) {
        if(this.is_chrome && page_name !==  "" ) {
            this._open_chrome_page( page_name );
        } else {
            console.log("not chrome browser, no no name specificed", page_name);
        }
    },
    _open_chrome_page : function( page_name ) {
       bExt.open_page( page_name  );
    },
    
    add_js : function( tab_id, script_list) {
        script_list=this._mklist(script_list);
        for(var i=0; i<script_list.length; i++) {
            chrome.tabs.executeScript( tab_id, { file: script_list[i] });
        }
    },
    
    add_css : function(tab_id, styles_list) {
        // todo, for loop like the add js one, but points to css inject
        styles_list=this._mklist( styles_list );        
        for(var i=0; i<styles_list.length; i++) {
            chrome.tabs.insertCSS( tab_id, {file : styles_list[i]})
        }
    }
}

