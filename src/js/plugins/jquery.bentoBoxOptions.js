/*
    
    name: bentoBoxOptions
    file: jquery.bentoBoxOptions.js
    author: gregory tomlinson
    copyright: (c) 2010 gregory tomlinson | gregory.tomlinson@gmail.com
    Dual licensed under the MIT and GPL licenses.
    ////////////////////////////////////
    ////////////////////////////////////
    dependencies: jQuery 1.4.2
    ////////////////////////////////////
    ////////////////////////////////////    
    
    Powers the 'options' drop down and appends the 'options' items to the end of the bento box        

*/

(function($){
    
    $.fn.bentoBoxOptions = function( options ) {

        var el=this, o = $.extend(true, {}, defaults, options ),
            listItemsDropDownBox, shortenUrls=[], shortenedItemListOpen = false;

        el.trigger('shareAccounts', { 'accounts' : o.accounts || [] })

        // visual design complexity requires this.. ideally would be attaching to el direclty, but design is rendered via js... though it could be display:none...
        $('<div class="bentoBoxOptions"></div>').appendTo(el);
        
        el.find('.bentoBoxOptions').html( render_options_open_button() );        
        

        
        var actions = el.find('.shortenOptionsTopLevel .shortenOptionsAction');
        actions.toggle(function(e) {
            e.preventDefault();
            initiate_options_boxes();
            el.trigger('track', { 'plugin:bentoBoxOptions' : 'shortenPageOption: open bento box options button' } )                        
            
        }, function(e){
            e.preventDefault();
            var items = el.find('.bentoBoxOptionsItem');
            items.slideUp('fast', function() {
                $(this).remove();
            });
            
            el.trigger('track', { 'plugin:bentoBoxOptions' : 'shortenPageOption: close bento box options button' } )                
                    
        });
        
        el.bind('refreshLinkedAccountsView', function(e,data) {
            initiate_options_boxes();            
        })
        
        /*
            Externally triggered Event
        */
        el.bind('openOptions', function(e) {
            e.preventDefault();
            actions.click();
        });
        
        el.bind('shareAccounts', function(e,data) {
            console.log('this is an event for shareAccounts')
            o.accounts = data.accounts;
        });             
        
        //getList();

        
        el.find('.bento_box_settings_controls input[type=checkbox]').live('change', function(e) {
            el.trigger('errorMessage', {
                text : "Saving Preferences is not supported yet"
            });                
            return;
            // TODO: we have no actual data store or api access to these preferences yet. save them locally

            var $this = $(this), checked = $this.attr('checked'), name = $this.val();             
            o[name] = checked;             
            var data =  { 'key': name, 'value' : checked };
            // actually save it somewhere
            $this.trigger('bentoBoxOptionsPreferences', data );   
             el.trigger('track', { 'plugin:bentoBoxOptions' : name + ' : ' + checked  } )            
        })
        
  
        
        
        return this;
        
        
        /****************************************************************** EVENTS ******************************************************************/
        

        
        /* draw and attach all the panels */
        function initiate_options_boxes() {
            action_shorten_settings();
            //action_instructions();
            // action_share_settings();
            action_warning_settings(); 
            action_clear_message_box_settings();                     
            //add_twitter_account_event_submission();
        }
        
        function basicShortenSuccess(jo)  {
            document.location.reload()
        }
        
        function action_shorten_settings() {
            
            if(el.find('.shortenSettingsBox').length > 0 ) return;
            
            var html = "", checked = "checked";
                html += '<div class="shortenSettingsBox bento_box_settings_controls">'
                    html += '<form action="#" method="get">';
                    html += '<ul>'
                    
                        if(!o.basicShortener) {
                            checked = (o.auto_shorten) ? "checked" : "";
                            html += '<li><input type="checkbox" name="autoShortenCheckBox" value="auto_shorten" id="autoShortenCheckBoxField" '+checked+' />'
                            html += '<label for="autoShortenCheckBoxField">Auto-shorten long links. Turn this off if you want to manually shorten links.</label></li>';                        
                        }

                    
                    html += '</ul>'
                    html += '</form>';                    
                    //html += '<a class="closeOptionItem" href="">X</a>'
                html += '</div>'

            addOptionItem(html);
        }
        
        function action_warning_settings() {
            if(o.accounts.length <= 0) return;
            var html = '';
            html += '<div class="bento_box_settings_controls">'
                html += '<ul>'
                var checked = (o.auto_warn_share) ? "checked" : ""
                    html += '<li><input type="checkbox" name="autoWarnEmptyShareMessage" value="auto_warn_share" id="autoWarnEmptyShareMessage" '+checked+' />'
                    html += '<label for="autoWarnEmptyShareMessage">Always warn me before sharing messages without links or that only contain links.</label></li>';
                html += '</ul>'
            html += '</div>'
            
            addOptionItem(html);
        }
        
        function action_clear_message_box_settings() {
            if(o.accounts.length <= 0) return;
            var html = '';
            html += '<div class="bento_box_settings_controls">'
                html += '<ul>'
                var checked = (o.auto_clear_share) ? "checked" : ""
                    html += '<li><input type="checkbox" name="autoClearShareMessage" value="auto_clear_share" id="autoClearShareMessage" '+checked+' />'
                    html += '<label for="autoClearShareMessage">Always clear my shared message when it\'s successful.</label></li>';
                html += '</ul>'
            html += '</div>'
            
            addOptionItem(html);
        }        

                
/*        function action_share_settings() {
            console.log("o.accounts:", o.accounts)
            // build html to show accounts you will share to
            
            //addOptionItem(html);            
        }
*/        
        function addOptionItem( html ) {
            var item = $('<div class="bentoBoxOptionsItem" style="display:none;"></div>').html( html ).insertBefore('.bentoBoxOptions').slideDown('normal');     
                                
        }
        
        function render_options_open_button() {
            var html = '';
            html += '<div class="shortenOptionsTopLevel">'
                html += '<a class="shortenOptionsAction" title="Manage Shorten Box and Social Sharing" href="#">Options <span class="shortenActionsOptionsExplainerText">(share setup, settings)</span></a>'
            html += '</div>'
            
            return html;
        }
        

        
        function _renderTopEdgeInputBoxWrapper() {
            var html = "";
            
            html += '<div class="inputBoxContainer">';
                html += '<b class="leftEdge"></b>';
                html += '<b class="rightEdge"></b>';
                
            return html;            
        }
        
        function _renderBottomEdgeInputBoxWrapper() {
            return '</div>'
        }          
        
        
        function success(jo) {
            
        }
    }
    
    var defaults = {
        params : {
            
        },
        // linked accounts for twitter and facebook
        accounts:[],
        auto_shorten : true,
        auto_warn_share : false,
        basicShortener : false,
        auto_clear_share : false
    }
    
    
})(jQuery);