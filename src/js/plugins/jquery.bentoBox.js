/*
    name : bentoBox
    file : jquery.bentoBox.js
    author : gregory tomlinson
    Dual licensed under the MIT and GPL licenses.
    ///////////////////////////
    ///////////////////////////        
    dependencies : jQuery 1.4.2,  jquery.errorMessenger.js, jquery.escapeHTML.js, jquery.validateUrl.js
    ///////////////////////////
    ///////////////////////////
    
    Events Triggered: 
    
    
*/

(function($) {
    
    $.fn.bentoBox = function( long_url, short_url, options ) {
        // extend the defaults settings
        var el = this, o = $.extend(true, defaults, options), display_html = "", 
            specials = new RegExp("[.$*+?|^()\\[\\]{}\\\\]", "g"),
            long_url = long_url || "",
            short_url = short_url || "",
            shortenActionMessage, sharePromoBox,
            total_shorten_this_session = 0, shareTextArea, shareCountBox, shareCountLength, shareBoxColor = "#777777",
            shortensInProgress=[], invalidURIs = [], shortensCompleted = [], customNamesQueue = [], 
            customNamesQueueInProgress = [], afterShortenEventsQueue = [], linkedAccounts = [], keywordUrls = [];

        init();
        init_attaach_events();

        return this;
        
        
        // start it up!
        function init() {
            /*
                Create the Bento Box and share Box HTML
            */
            var title = o.shareTitle || "";

            $display_html = renderShare( long_url, short_url, title );
         
            el.find('.replaceWithBentoBoxInsidePlugin').append( $display_html );            

            shareCountBox = $('#shareTextCounterBox');
            
            $('#manuallyShortenButton').live('click', function(e) {
                e.preventDefault();
                if(shareTextArea.val() === '') {
                    el.trigger('errorMessage', {
                        text : 'Enter a link first'
                    })
                    return;
                }
                validateTextAndShortenLinks();
            });
            
            shareTextArea = el.find('textarea').bind('paste', shareBoxPasteEvent)
                                .bind('keyup', shareBoxChangeEvent)
                                .bind('focus', removeSharePromoBox)
                                .bind('blur',function(e) {
                                                if(shareTextArea.val() === "") {
                                                    if(!sharePromoBox) sharePromoBox = renderSharePromo().appendTo(el)
                                                    sharePromoBox.fadeIn();
                                                } else {
                                                    // little too power user scary for most people
                                                    //validateTextAndShortenLinks();
                                                }
                                            });
                                            
            sharePromoBox = renderSharePromo().appendTo(el);                                            
            
            /*
                Edge Case: If the bookmarklet sends a URL that could not be shortened
                    about:blank
            */
            
            if( long_url !== '' && short_url === '') {
                value = shareTextArea.val()
                value += " " + long_url;
                shareTextArea.val( value );


                
            } 
            
            // sharePromoBox.live('click',function(e) {
            //     shareTextArea.trigger('focus');
            // })            
            
                        
            el.fadeIn();
            $('#shareOnSocialNetworksButton').live('click', saveSocialNetworkMessage)
                        
        }
        
        function init_attaach_events() {
            /*
                Custom Event: Shorten Complete
                    This event can be externally triggered when the sever has shorten already happened.
                    Specifically, when the bookmarklet or URL hack is used, this occurs
                    
                    This method is attached to the body in order to allow 'shortenComplete' from anywhere
            */
            
            $(document.body).bind('shortenComplete', shortenCompleteEvent);  
            
            el.bind('bentoBoxOptionsPreferences', function(e,data) {
                
                o[data.key] = data.value;
                
                if(data.key === "auto_shorten") {
                    el.trigger('autoShortenSetting');
                }
                
            })
            
            el.bind('autoShortenSetting', autoShortenSettingsChangeEvent);                
            el.bind('shareAccounts', shareAccountsEvent);     
            el.bind('hideProgressGraphic', hideProgressGraphicEvent)     
            
            el.bind('initiateShorten', function(e,data) {
                validateTextAndShortenLinks();
            });
            
            el.bind('updateTextArea', function(e,data) {
                console.log('I hear the update text are event!')
                var text_value = shareTextArea.val();
                
                text_value += " " + data.url;
                shortensCompleted.push(data.url);                
                shareTextArea.val( text_value )
                
                
            })
            
            el.bind('shorten_request_response', function(e,data) {
                
                
                success(data)
            })
        }
        
        
        /******************** EVENTS ************************************/
        
        function shortenCompleteEvent(e,data) {
            /*            
                Generally an externally triggered event
                OR
                When no custom events are in the queue: 
            */

            shortensCompleted.push(data.url);
            if(o.debug) { console.log('shortensCompleted', shortensCompleted); }
            
        
            // if(o.shareButtonAnimationEnabled && total_shorten_this_session === 0 ) {
            //     el.find('.inputButton').animate({
            //         marginTop : '19px'
            //     }, 400);
            // }
            total_shorten_this_session += 1;   
            upDateCounter();   
            el.trigger('track', { 'plugin:bentoBox' : 'Shorten Complete. Shortens this session:' + total_shorten_this_session } )                     
        }
        
        function shareAccountsEvent(e,data) {
            
            /*
                EXTERNAL Event
                Recieve External Data Concerning 
                linked_accounts used for social sharing
                
                This is used for displaying the current button state.
                
                It is NOT required taht all aaccount information is sent.
                
                Only require: type of if any accounts are enabled and account types available, 
            
            */
            if(o.debug)console.log(data)
            
            // show accounts that will be used when 'share' is pressed
            // TODO:
            // set the share button now...
        }
        
        function saveSocialNetworkMessage(e) {
            
            /*
                Event: generally via 'click'
                
                This method does the following:
                  1. animates the 'share' button to show a busy status
                  2. handle a valid submission
                  3. Make a remote connection to 'save' data to server.
                  4. Server is smart, all configuration for accounts is found there
                        This includes:
                            account authentication information
                            accounts to leverage
            */
            
            e.preventDefault();
            
            el.trigger('errorMessage', { text : 'Not Implemented Yet'});
            return;
            
            var $this = $(this), txt = shareTextArea.val();
            if( $.trim(txt) === '') {
                el.trigger('errorMessage', {
                    text : 'You don\'t have anything to share yet, shorten a link to get started'
                })
                return;
            }
            o.share_params.status_update = $.trim( txt );

            
            // look for all the links currently in the
            answer=true;
            var non_links_found = 0, links_found = 0;
            if( o.auto_warn_share ) {
                
                var items = $.trim(txt).split(/[\s]/), url_match, txt_token;
                for(var i=0; i<items.length; i++) {
                    txt_token = $.trim(items[i]);
                    url_match = $.validateUrl( txt_token )
                    if(o.debug) console.log(txt_token, "token", url_match)                    
                    if( url_match) {
                        links_found+=1;
                    } else if(txt_token) {
                        non_links_found+=1;                        
                    }
                }

                if(non_links_found > 0 && links_found === 0 ) answer = confirm("This message doesn't contain any links, share anyway?");
                else if(links_found > 0 && non_links_found === 0) answer = confirm("This message contains only links, share anyway?");
                
            } 
            
            if( answer ) {
                connector(o.share_url, o.share_params, function(jo){
                    share_success(jo, txt)
                }, share_error);      
                
                $this.parent().next().fadeIn();
                $this.parent().fadeOut();                          
            }

        }
        
        function _validate_contains_more_than_links() {
            
        }
        
        function shareBoxChangeEvent(e) {
            // this event triggers AFTER the paste event
            
            /*
                Listen for typing is textarea
                    1. update counter
                    2. check for valid URLs to shorten
            */
              
            upDateCounter();              
            if(!o.auto_shorten) return;            
          
            // SPACES or ENTER
            
            if(e.keyCode === 32 || e.keyCode === 13) {

                validateTextAndShortenLinks();
            }
            

        }
        
        function hideProgressGraphicEvent(e,data) {
            if(!shortenActionMessage) return;
            shortenActionMessage.remove();
            shortenActionMessage=null;            
        }
        
        function shareBoxPasteEvent(e) {
            
            /*
                Allow shortening when data is pasted into the textarea
            */
            
            if(!o.auto_shorten) return;                
            // set a timeout b/c the pasted value isn't there yet
            setTimeout( function() {
                upDateCounter();                   
                validateTextAndShortenLinks();
            }, 10);
        }
        
        /*
            EXTERNAL Event
            
            Plugin jquery.bentoBoxOptions.js
            
            Controls if auto shorten is on or off.
        
        */
        
        function autoShortenSettingsChangeEvent(e,data) {
            /*
                Display the 'shorten' button when user turns off auto shorten
            */
//            o.autoShorten=data.autoOn;
            
            if(o.auto_shorten) {
                el.find('.shortenButtonBox').slideUp('normal');
            } else {
                el.find('.shortenButtonBox').slideDown('normal');
            }            
        }   
        
        
        /****** Async Response Callback handlers ***********/    
        
        function success(jo, query_params) {
            if(o.debug) console.log(jo)
            /*
                Success to an async call to shorten a URL 
                OR 
                update with keyword
            */
            
            var pos;
            
            // TODO
            // this is a problem.. when the shorten fails, I cannot get the long_url back to remove...
            // if(!jo || !jo.data || !jo.data.url) {
            //     console.log('Error: link shortening failed!');
            //     var pos = $.inArray(query_params.url, shortensInProgress);
            //     if( pos > -1) {
            //         if(o.debug) console.log('bento box success:', shortensInProgress, query_params.url, pos)
            //         var item = shortensInProgress.splice(pos,1);
            //         invalidURIs.push(item)
            //     }
            //     
            //     el.trigger('hideProgressGraphic')                
            //     // bubble to the event handler!
            //     el.trigger('errorMessage', {
            //         text : "We've experienced an error trying to shorten that link: " + jo.status_txt
            //     });                
            //     
            //     return;
            // }
            
            if(!jo.data) {
                
                
                
                el.trigger('hideProgressGraphic')  
                el.trigger('errorMessage', {
                    text : "We've experienced an error trying to shorten that link: " + jo.status_txt
                });                
                
                return;
            }

            
            //pos = jQuery.inArray( jo.data.long_url, shortensInProgress);
            pos = checkShortensInProgress( jo.data.long_url, jo.data.url )
            if(pos > -1) shortensInProgress.splice(pos,1);
            
            if(shortensInProgress.length <= 0 && shortenActionMessage ) {
                // Hide the 'loading' icon.
                  el.trigger('hideProgressGraphic')
            }
            
            updateTextAreaWithLink( jo.data.long_url, jo.data.url, jo.data );


            /*
                Requests can be made to shorten that will not 
                result in the calling of 'shortenComplete' 
                
                This is useful when saving keywords or other custom activities.
            */
            
            if(afterShortenEventsQueue.length <= 0 ) {
                el.trigger('shortenComplete', jo.data );
            } else {
                if(jo.data.keyword) keywordUrls.push(jo.data.keyword)
                if(o.debug) console.log('Keyword Urls:', keywordUrls);
                customEventTriggerLoop_succes_helper( jo.data )               
            }

            // slow this down.. wait like 3 seconds            
            setTimeout(delayedHistoryRefreshCall, 3000);            
        }
        

        function customEventTriggerLoop_succes_helper( data ) {
            for(var i=0; i<afterShortenEventsQueue.length; i++) {
                // look through this queue and find any events to fire                    
                if(afterShortenEventsQueue[i].data.long_url === data.long_url) {
                    var params = $.extend(true, {}, afterShortenEventsQueue[i].data, data )
                    el.trigger( afterShortenEventsQueue[i].eventType, params );
                    afterShortenEventsQueue.splice(i,1);
                    // don't try to reshorten this!
                    shortensCompleted.push( data.url )
                }
            }            
        }

        /*
            AJAX Failure.
                
        */
        function error(e) {
            console.log('An error occurred while shortening the URL', e);
            
            if(shortensInProgress.length <= 1) {
                el.trigger('hideProgressGraphic')                 
            }            
            
            el.trigger('errorMessage', {
                text : "We've experienced an error trying to shorten that link, try again in a bit"
            });
        }
        
        
        function share_success(jo, share_text) {
            restoreShareButton();
            
            if(jo.status_code !== 200 ) {

                el.trigger('errorMessage', {
                    text : 'Not able to share message: ' + jo.status_txt
                });                
                return;
            } else if(jo.status_txt === 200 && jo.data.error) {
                el.trigger('errorMessage', {
                    text : 'Error with your share: ' + jo.data.error
                });                
                return;
            }

            el.trigger('successMessage', {
                text : 'Successfully shared your message'
            });
                        
            words = _checkForValidURLValue(share_text) || [];
            var shares = []
            for(var i=0; i<jo.data.length; i++) {
                if(!jo.data[i].error) {
                    shares.push(jo.data[i])
                }
            }
            if(shares.length > 0) {
                el.trigger('socialShareSuccess', { 'shares' : shares, links : words, text : share_text });
                el.trigger('track', { 'plugin:bentoBox' : 'Social Share Success' } )                
            }
            
            if(o.auto_clear_share) {
                setTimeout(function(){
                    shareTextArea.val('');                                     
                    shareTextArea.focus();
                    upDateCounter();
                }, 1000)

            }

        }
        
        function share_error() {
            el.trigger('errorMessage', {
                text : "Currently unable to share you're message"
            });
            
            restoreShareButton();
        }
        
        function restoreShareButton() {
            var $p, words, button = $('#shareOnSocialNetworksButton');
            $p = button.parent().fadeIn();
            $p.next().fadeOut();            
        }
        
        function updateTextAreaWithLink( long_url, shortUrl, data ) {
            var text_value = shareTextArea.val(), regex, pos=-1, i=0,
            safe_long_url = long_url.replace(specials, "\\$&");
            console.log(safe_long_url)
            long_url_no_http = long_url.substring(7);            
            safe_long_url_no_http = long_url_no_http.replace(specials, "\\$&");
            

            /*
                Add spaces below for easier use
            */               
            regex = new RegExp(safe_long_url, "i");
            regex_2 = new RegExp(safe_long_url_no_http, "i");
            
            text_value = text_value.replace(regex, shortUrl + " " )
                                    .replace(regex_2, shortUrl + " " );
            
            /*
                Do an extra edge case test:
                    Work flow
                    1. User shortens link
                    2. User renames link via keyword and saves, succesfully
                    3. user re-edits keyword and saves, successfully [fist keyword still works, lost in history]
                    4. UI textarea not able to correctly update #1 keyword url with #2 URL. 
                            Reason:
                            {
                                * status_code: 200
                                  data: {
                                      o hash: "96UL0o"
                                      o keyword: "neat_again"
                                      o url: http://bit.ly/neat_again
                                      o new_keyword: 1
                                      o global_hash: "bNn51L"
                                      o long_url: http://test.com
                                  }
                                * status_txt: "OK"
                            } 
                            
                    #1 keyword not returned, long_url points to original long URL.    
            */
            console.log('updateTextAreaWithLink', data.keyword, data)
            if(data.keyword) text_value = text_value.replace( data.hash, data.keyword+" " );
            pos = $.inArray( data.keyword, keywordUrls );
            for(; i<keywordUrls.length; i++) {
                //loop required, reason unknown at this time. Ideal would be using value of pos
                if(data.keyword) text_value = text_value.replace(keywordUrls[i], data.keyword+" ");
            }
            keywordUrls.splice(pos,1);
            shareTextArea.val(text_value);        
        }
        
        function delayedHistoryRefreshCall() {
            // fired from a set timeout b/c history system doesn't update fast enough
            el.trigger('refreshHistory');
        }
        
        
        /*
            Utility
                Find is this link was a 'shorten in progress' and return it's location in array
                Async Handler for multiple link shorten.
                    This case occurs if something pastes more than one link in at once
        */
        function checkShortensInProgress( url, short_url ) {
            var i=0;
            for(; i<shortensInProgress.length; i++) {
                if(o.debug) console.log('shortens in progress', shortensInProgress[i], ' url ', url, 'short url', short_url)
                if(url.indexOf( shortensInProgress[i] ) > -1 || short_url.indexOf( shortensInProgress[i] ) ) return i;
            }
            if(o.debug) console.log('Did not find a shorten in progress')
            return -1;
        }        
        
        
        
        /************************************************* Render Support Controls and Display Response *****************************************/
        /*
            Share & Shorten Box
        */
        function renderShare( long_url, short_url, title  ) {
            
            var html = "", display = "", 
                safe_title = decodeURIComponent( title ),
                boxContents = $.trim( safe_title + " " +  short_url );

            shortensCompleted.push(short_url)

            html += '<div class="shortenBentoBox">'
                html += '<div  class="type_share activeFingerTab">';
                    html += '<div class="shareContainer">'
                            html += '<div id="shareTextCounterBox" style="display:none;">140</div>'
                            html += '<form method="get">'
                                html += '<div class="shareTextBoxContainer">'
                                    html += '<textarea  tabindex="1" name="u" class="shareMessage">'+boxContents+'</textarea>'
                                html += '</div>'   
                            
            
                                html += '<div class="inputButton">'
                                    html += renderShortenButton();
                                    html += renderSocialNetworkShareButton();
                                    html += '<div class="hr"><hr /></div>'
                                html += '</div>'
                                html += '<div class="shortenedBitlyListListBox"></div>';                            
                            html += '</form>';                                      
                    html += '</div>';
                html += '</div>';
            html += '</div>'    
            html += '<div class="hr"><hr /></div>'            
            
            var $html = $(html);
            return $html;
        }
        
        function renderShortenButton() {
            var html ="";
            display = (o.auto_shorten) ? 'display:none;" ' : 'display:block;'
            html += '<div style="'+ display +'" class="shortenButtonBox">'
                html += '<div class="shortenButtonBoxInputContainer">'
                html += '<input title"Shorten your link" type="submit" class="submitButtonBackground" tabindex="2"  id="manuallyShortenButton" name="" value="Shorten" />'
                html += '</div>'

            html += '</div>'
        
            return html;
        }
        
        function renderLoginSocialNetwork() {
            return '<div id="shareOnSocialNetworkSignInButton" class="basicShareButtonContainer"><a title="Sign In to share on Twitter" href="/a/account">Sign In</a></div>'
        }
        
        function renderSocialNetworkShareButton() {
            var html = '<div class="shareButtonContainer basicShareButtonContainer">'
            html += '<div class="buttonActionContainer">'

                html += '<input title="Share your message on Twitter"  tabindex="3" style="display:none;" type="submit" class="submitButtonBackground shareButton_auth" id="shareOnSocialNetworksButton" name="" value="Share" />'

            html +='</div>'

            // html +='<div class="peekabooShare">'
            //     html += '<div class="peekabooMessageInner">'
            //     html += 'on Twtter'
            //     html += '<b class="results_bottomRight"></b>'
            //     html += '<b class="results_bottomLeft"></b>'
            //     html += '<b class="results_bottomBevel"></b>'
            // html += '</div>'
            // html += '</div>'

            html += '<div class="buttonActionContainer sharePreloader"></div></div>'
            return html
        }
        
        
        function renderSharePromo() {
            return $('<div style="display:none;" class="shortenAndSharePromo">Enter your long link here to get started</div>');
        }
        
        function renderFileShare() {
            /*drop.io?*/
        }
                
        function removeSharePromoBox(e){
            if(sharePromoBox) {
                sharePromoBox.fadeOut('fast', function(){
                    if(sharePromoBox) sharePromoBox.remove();
                    sharePromoBox=null;
                });
               
            }
        }
        

        
        //keypress, paste and sohorten event helper method
        function upDateCounter() {
            var value = shareTextArea.val(), length = value.length;
            shareCountLength = length;
            if(shareCountBox.css('display') !== 'block' && linkedAccounts.length > 0 && length > 0 ) shareCountBox.css('display', 'block')
            // terse
            // but effecient, don't want to update the element unless we have to (avoids skipped numbers)
            if(length >= 130 && shareBoxColor !== '#d40d12') {
                shareBoxColor = '#d40d12';
                shareCountBox.css({'color': shareBoxColor})                
            } else if(length > 120 && length < 130 && shareBoxColor !== '#5c0002') {
                shareBoxColor = '#5c0002';                
                shareCountBox.css({'color': shareBoxColor})
                
            } else if( length < 120 && shareBoxColor !== '#777777') {
                shareBoxColor = '#777777';
                shareCountBox.css({'color': shareBoxColor})
            }
            
            shareCountBox[0].innerHTML = 140 - length;            
        }
        

        function validateTextAndShortenLinks() {
            var links  =  _checkForValidURLValue( shareTextArea.val() );
            if(!links) return;
            safe_matches = _checkLinkIsShortenSafe( links );
            if(safe_matches && safe_matches.length <=0 ) return;            
            if(o.debug) console.log('safe_matches', safe_matches)
            transmitLinkCandidates( safe_matches )
            
        }
        

        function _checkForValidURLValue( text_string ) {
            // validate this is a link that needs to be shortened via a REGEX in jquery.validateUrl.js
            var url_checker = $.validateUrl( text_string );
            if(o.debug) console.log('_checkForValidURLValue', url_checker)
            return url_checker
        }
        
        function transmitLinkCandidates( links ) {
            
            shortensInProgress = shortensInProgress.concat( safe_matches );            
            if(!shortenActionMessage) shortenActionMessage = $('<div class="shorteningInActionMessage">Shortening..</div>').appendTo( el.find('.shareContainer') )            
            
            if(o.debug) {
                console.log('Calling server with this links', links)
            }
            
            if( !links ) return;
            var i=0;
            
            // pass this off to the background page, that is single state...
            // single websocket home...
 
            
            for(; i<links.length; i++) {        
                el.trigger('shorten_request', {'long_url' : $.trim( links[i]) } );
            }
           
        }
        

        
        function _checkLinkIsShortenSafe( matches ) {
            if(!matches) return;
            var blacklisted = false, shortenable_links=[], i=0, j=0;            
            for (; i<matches.length; i++) {
                
                blacklisted=false;
                
                if( $.inArray( matches[i], shortensInProgress) > -1 ) {
                    continue;
                } else if( $.inArray(matches[i], shortensCompleted) > -1 ) {
                    continue;
                } else if ( $.inArray(matches[i], invalidURIs) > -1 ) {
                    continue;
                }

                for(; j<o.blacklist.length; j++) {
                    if( matches[i].indexOf( o.blacklist[j] ) > -1 ) {
                        blacklisted=true;
                        continue;
                    }                      
                }
                
                if(!blacklisted) shortenable_links.push( matches[i] )
            }
            return shortenable_links;
        }
        
    }
    var defaults = {
        share_url : '/v3/api/future_share_endpoint/with/oauth',
        shareTitle : '',
        shorten_params : {
            url : ''
        },
        share_params : {
            status_update : ''
        },
        debug : false,
        url : '',
        params : {
            
        },
        blacklist : ["tinyurl.com", "is.gd", "ow.ly", "su.pr", "tweetphoto.com"], //TODO: this needs to be adaptable to all bitly.pro urls
        twitterEnabled : false,
        shareButtonAnimationEnabled : true,
        auto_shorten : true,
        auto_warn_share : false,
        auto_clear_share : false,
        tabs : ["Share",  "Custom Name"] //"Share Files",  , "Shorten"
        
    }, $bod;
    

    
    function connector(url, params, callback, error) {
        var str = $.param( params );
        $.ajax({
            dataType: 'json',
            data : str,
            traditional : true,
            jsonp: 'callback',
            'url' : url,
            success: callback,
            'error' : error        
        });
    }

})(jQuery);
