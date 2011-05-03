// 
//  bExt.OptionMeta.js
//  bitly_chrome_extension
//  
//  Created by gregory tomlinson on 2011-05-03.
//  Copyright 2011 the public domain. All rights reserved.
// 


(function( window, undefined) {
/*
    Representation of each 'setting' UI Controls Parent
    
        Such that, a Title, desc, and event method are assigned
*/

window.bExt.OptionMeta = function( meta_obj  ) {
    this.__m=$.extend( {}, this.__m, meta_obj );
    this.set_label();
    this.set_id();

    return this;
}

window.bExt.OptionMeta.prototype = {
    
    // add this to set event for this object
    'event_method' : null,        
    'el_selector' : null, // a jQuery query selector string    
    
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
        value : ""
    }
}
    
})(window);