/*
    filename : fastGrid
    http://unlicense.org/
    author: gregory tomlinson
    Wed Sep  8 21:09:30 EDT 2010
*/

(function() {
    
    // the fastFrag components
    /*
        Move away from static HTML and into JSON format
            Allows for finer grained control of display content with minimal DOM access
                (aka faster)
    */
    
    var fastGrid =  {
        
        popup : function() {
            return {}
        },
        
        options_page : function() {
            return {}
        },
        
        trending_page : function() {
            return {}
        }
    }
    
    window.fastGrid = fastGrid;
        
})();