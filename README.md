bitly Chrome Extension
==========

This is the official [bitly](http://bit.ly/) chrome extension. Shorten and Share, right from your browser, instantly

Installing
-----

The current release can be installed from [chrome.bit.ly](http://chrome.bit.ly/)

Development releases can be build by getting the source and loading as an unpacked extension

Source Code: [github.com/bitly/bitly_chrome_extension](http://github.com/bitly/bitly_chrome_extension)

Please see notes on setting up valid Oauth credentials

Bitly OAuth Credentials
-------
You will need to create and add a file to the js directory, so that

    js/bitly_oauth_credentials.js
    
This file will contain valid credentials to use when contacting bit.ly. This is to facilitate easier re-purposing of code contained within the project. The file bitly_oauth_credentials.js.sample has been added as a reference guide

    var bitly_oauth_credentials={
        client_id : "____YOUR_BITLY_OAUTH_CLIENT_ID____",
        client_signature : "____YOUR_BITLY_OAUTH_SIGNATURE___"
    }


Features / Description
-----
- Shorten and Share, right from your browser, instantly
- Shares to any of your linked social accounts, such as [Twitter](http://twitter.com) and [Facebook](http://facebook.com/)
- Expands all [bitly](http://bit.ly/) links, including white-label domains, such as [4sq.com](http://4sq.com/). Can be easily disabled.
- Easy and safe direct login to [bitly](http://bit.ly/)
- Captures selected page text, which can be quickly shared.
- Supports both [bitly](http://bit.ly/) and [j.mp](http://j.mp/) APIs
- Works with both HTTPS and HTTP sites
- Quickly copy short links to your clipboard.
- Uses new [bitly](http://bit.ly/) SSL [oauth](http://oauth.net/) for authentication. You're credentials are never sent as clear text.
- Right click "shorten and copy" your link with bit.ly


Note to users experiencing problems directly after install: Chrome doesn't allow execution of content scripts on already open pages. If you try this immediately after install on existing tabs, it won't work, so we recommend to restarting Chrome after installing the extension.

WishList
-----

* Custom Keywords
* User Shorten History / Activity Feed
* Realtime / Trending links for user X
* User Metics, clicks, country, referrers


Contributing
-----



Known Issues
-----
- Short Url expansion and page selection text do not work on [Google Extension Gallery](https://chrome.google.com/extensions/)
