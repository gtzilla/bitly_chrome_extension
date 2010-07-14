/*
	name : chunk
	file : jquery.chunk.js
	author : gregory tomlinson
	Dual licensed under the MIT and GPL licenses.
	///////////////////////////
	///////////////////////////		
	dependencies : jQuery 1.3.2
	///////////////////////////
	///////////////////////////	

*/

(function($) {

	$.chunk = function( array, chunkSize ) {
	   var base = [], i, size = chunkSize || 5;
	   for(i=0; i<array.length; i+=chunkSize ) { base.push( array.slice( i, i+chunkSize ) ); }	
	   return base;
	}

})(jQuery);
