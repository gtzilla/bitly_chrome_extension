// 
//  bExt.OptionMeta.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-05-03.
//  Copyright 2011 the public domain. All rights reserved.
// 
// requires jQuery via the $.extend function

(function( window, undefined) {
/*
    Representation of each 'setting' UI Controls Parent
    
        Such that, a Title, desc, and event method are assigned
*/

window.bExt.OptionMeta = function( meta_obj  ) {
    this.__m=jQuery.extend( {}, this.__m, meta_obj );
    this.event_extras=[]; // reset it, or the previous instance value will remain when the list contains an Object
    this.set_label();
    this.set_id();
    this.set_uuid();
    return this;
}

window.bExt.OptionMeta.prototype = {
    
    // add this to set event for this object
    'event_method' : null,        
    'el_selector' : null, // a jQuery query selector string    
    
    'event_extras' : [], // { selector : "css query selector", event_method : function(e){ .. } }
    
    'event_dom_refresh' : null,
    
    set_id : function() {
        if(!this.__m.id && this.__m.title !== this.__m.label ) {
            this.__m.id=(this.__m.title + "_" + this.__m.label).replace(/[^a-zA-Z0-9]/gi, "_").toLowerCase();
        } else {
            this.__m.id=(this.__m.title).replace(/[^a-zA-Z0-9]/gi, "_").toLowerCase();
        }
    },
    
    set_label : function() {
        if(!this.__m.label) {
            this.__m.label=this.__m.title;
        }
    },
    
    set_uuid : function() {
        this.__m.uuid = window.btoa(  Math.random()*1000  + "_" + (new Date()).getTime() + "_" + this.title );
    },
    
    get : function( name ) {
        return this.__m[ name ];
    },
    
    set : function( name, value ) {
        return this.__m[name]=value;
    },
    
    out : function() {
        return this.__m;
    },
    __m : {
        evt_type : "change",
        evt_track : "bind",
        id : null,
        title : null,
        label : null,
        enabled : null,
        type : "checkbox",
        desc : null,
        value : "",
        uuid : null
    }
}
    
})(window);