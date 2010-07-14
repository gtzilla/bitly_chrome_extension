/*
    Bit.ly Brain File
    
    Requirements:
        $.connector, $.sql, $.localStoreage, jquery-1.4.2.js
    
        chrome.browserActions
        
    Variables:
        bitly
        bitly.user_data

*/

function auth_query_listener( port ) {
    var current_port=port;      
    if(current_port.name !== "auth") { 
        console.log('bailing; wrong port', current_port.name);
        return; 
    }
    
    current_port.onMessage.addListener(
        /* 
        @param {dict} msg
            @key {string} username
            @key {string} password
        */
        function(msg) {
        
        // validate good data
        console.log(msg, "auth_query_listener")
        var errors = [], user_data = msg, params = {};
        
        if($.trim(msg.username) === "") {
            errors.push("missing username")
        }
        if($.trim(msg.password) === "") {
            errors.push("missing passsword")
        }            
        
        if(errors.length>0) {
            current_port.postMessage( {'type' : msg.type, 'error' : errors, 'data' : {} } );                                    
            return;
        }
        params.login = 'chromext'
        params.apiKey = 'R_042ce7bde03d756e0448b28b1f2c4aa3'
        params.x_login = msg.username
        params.x_password = msg.password
        $.connector('/v3/authenticate', params, function(jo) {
            // store to bitly_data... will need later
            console.log(jo, "auth this thing yo")
            
            if( jo && jo.status_code === 200 && jo.data.authenticate && jo.data.authenticate.successful === true) {
                bitly.user_data.login = jo.data.authenticate.username;
                bitly.user_data.apiKey = jo.data.authenticate.api_key;                    
                // TODO: get a list of accounts
                // bitly_data.accounts = jo.accounts;
                // $.localStorage.set( bitly_settings.local_key , bitly_data );
                $.localStorage.set('user_data', bitly.user_data);
                
                var sql = "INSERT INTO "+ bitly_settings.users_table +" (login,apiKey,accounts) VALUES(?,?,?)";
                console.log(sql, "sql for insert")
                var args = [ jo.login, jo.apiKey, JSON.stringify( { 'accounts' : [] }) ]
                $.sql.sqlRaw( sql, args, function(jo) {
                    console.log(jo,arguments,"saving login info")
                })
                chrome.browserAction.setPopup({ "popup" : "bitly_bento.html"}) 
                current_port.postMessage( {'type' : msg.type, 'success' : {}, 'data' : {} } );                                                                                         
            } else {
                console.log('error!', jo);
                if (jo.status_code === 200) {
                    errors.push('Invalid Username or Password');
                } else {
                    errors.push(jo.status_txt || 'Invalid Username or Password');
                }
                current_port.postMessage( {'type' : msg.type, 'error' : errors, 'data' : {} } );                                    
                // TODO: post back something else as an error?
                // current_port.postMessage( jo );
            }
            
        }, function(e) {
            console.log(e, 'oooops, error in connect auth')
            errors.push('Unknown Error');
            current_port.postMessage( {'type' : msg.type, 'error' : errors, 'data' : {} } );                                    
        } )
        
    })
}