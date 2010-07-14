/*
	name : backTweet
	file : jquery.backTweet.js
	author : gregory tomlinson
	Dual licensed under the MIT and GPL licenses.
	///////////////////////////
	///////////////////////////		
	dependencies : jQuery 1.4.2, jquery.commifyNumber.js
	///////////////////////////
	///////////////////////////	

*/

(function($) {

	$.fn.backTweet = function( sourceUrl, hash, displayNumber, options ) {
		// extend the defaults settings
		var el = this, o = $.extend(true, {}, defaults, options), 
		    counter = 0, tweets, bx=null, timer = null, h = hash, displayNumber=displayNumber || 3;
		bx = el.find('.tweetsBox');
		o.params.q = sourceUrl;
		connector(o.url, o.params, success);
		return this;
		
		function success(jo) {
	       tweets = jo.tweets;
	       if(tweets.length > 0 ) {
	           //tweetLinkTest();
	           createHeader(  jo.totalresults );
	           createTweet();
	           //createAttribution();
	        }
		}
		
		function createTweet() {
		    var d = _createTweet();
		    d.fadeIn('normal', tweetComplete).appendTo(bx);	 
		}
		function _createTweet() {
		    // replace the links with bit.ly hash.. WARNING. This could replace links that aren't the correct match. review noted this chance is very low
		    var tweet =  tweets[counter].tweet_text.replace(/<[^>]+>(http.{8,}?)<\/[^>]+>/gmi, '<a href="http://bit.ly/'+ h +'">bit.ly/'+h+'</a>');
		    return $('<div />').addClass('singleBackTweetBox').html( "@<a href='http://twitter.com/"+ tweets[counter].tweet_from_user +"'>" +tweets[counter].tweet_from_user + "</a>: " + tweet );		    
		}
		
		function removeTweet() {
		    bx.find(':first').slideUp('fast', addTweet);
		}
		
		function addTweet() {
		    bx.find(':first').remove();
            _createTweet().fadeIn('normal').appendTo(bx)		    
		}
		
		function tweetComplete() {
		    counter +=1;
		    console.log(displayNumber, "displayNumber")
		    if(counter < tweets.length && counter < displayNumber ) {
		        createTweet();
		    } else if(tweets.length > counter) {
		        timer = setInterval( timerAddTweet, 10000 )
		    }
		}
		
		function timerAddTweet() {
		    counter +=1;
		    if(counter < tweets.length) {
		        // TODO: remove one 
		        removeTweet();
		    } else {
		        clearInterval(timer);
		    }
		}
		
		function createHeader( results  ) {
		    var img = '<img class="backTypeIcon" src="/s/graphics/backtype_sm.png" width="16" height="16" alt="back type" border="0" />', 
		        verbage = results==1 ? 'Tweet' : 'Tweets', d = $('<span />').addClass('tweetsCounterHeadline').html( '<a href="http://www.backtype.com/">' + img + ($.commifyNumber(results)) + " " + verbage + '</a>')
		    d.prependTo(el);
		}
		
		function createAttribution() {
		    $('<div />').addClass('tweetAttributionPartner').html('<a href="http://backtype.com">Tweet Stream via BackType</a>').fadeIn('fast').appendTo(el);
		}

	}
	
	
	var defaults = {
		tweetDisplayNumber : 3,
		url : 'http://backtweets.com/search.json',
		params : {
	        itemsperpage : 60,
	        key : '1029305fc11efb95c3a4',
	        q : ''			
		}
		
	};
	

	
	function connector(url, params, callback) {
		var str = $.param( params );
		$.ajax({
			dataType: 'jsonp',
			data : str,
			jsonp: 'callback',
			'url' : url,
			success: callback			
		});
	}

})(jQuery);
