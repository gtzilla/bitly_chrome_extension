/*
    name : validateUrl
    file : jquery.validateUrl.js
    author : gregory tomlinson, Jehiah Czebotar
    copyright: (c) 2010 bit.ly
    Dual licensed under the MIT and GPL licenses.
    ///////////////////////////
    ///////////////////////////        
    dependencies : jQuery 1.4.2
    ///////////////////////////
    ///////////////////////////
    
*/

(function($) {
    
    /*
        Determine if a valid URI/URL is contained in a string of text
        
        Return null or an ARRAY of URI matches
        
        -- The crown jewel of auto / smart shortening
        
        http://en.wikipedia.org/wiki/Generic_top-level_domain
        http://en.wikipedia.org/wiki/Country-code_top-level_domain
        http://en.wikipedia.org/wiki/Top-level_domain#Reserved_TLDs (note the IDN tld's are not in this list)        
        
    */
    
    $.validateUrl = function( string_value ) {
        // extend the defaults settings
        matches = string_value.match( fullUriRegex );
        if(!matches) return null;
        return matches;
    }
    
    var protocolPattern = "(?:(https?|ftp|itms)://)?",
        ipPattern = "(?:[0-9]{1,3}\\.){3}(?:[0-9]{1,3})",
        tldPattern = "(?:[^\\s\\!\"\\#\\$\\%\\&\\'\\(\\)\\*\\+\\,\\.\\/\\:\\;\\<\\=\\>\\?\\@\\\\[\\]\\^\\_\`\\{\\|\\}\\~]+\\.)+(?:aero|arpa|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|local|example|invalid|test|[a-z]{2})(?::[0-9]+)?",
        domainPattern = "(?:" + tldPattern + "|" + ipPattern + ")",
        pathPattern = '(?:\\/?[\\S]+)?',
        fullUriRegex = new RegExp( "(" + protocolPattern + domainPattern + pathPattern + ")", "gi");
    

})(jQuery);
