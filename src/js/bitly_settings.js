/*
    this file is required once
*/

var bitly_settings = {
    host : "api.bitly.org",
    // this is the key to put the general bit.ly data in localstorage
    local_key : "bitly_data_vr1",
    
    db_name : 'bitly_chrome_ext',
    // changing this value can cause an INVALID_STATE_ERR and cause the  entire operation to fail
    db_ver : '0.3',
    db_desc : 'bit.ly local storage',
    shortens_table : 'shortens_t', 
    users_table : 'users_t',    
    bitly_data_table : 'bitly_data_t',
    schemas : {
        bitly_data : "(id UNIQUE, bitly_data TEXT)",
        users : "(login UNIQUE, apiKey TEXT, accounts Text)",
        urls : "(id UNIQUE, title TEXT, share_text TEXT, url TEXT, long_url TEXT, global_hash TEXT, image TEXT, timestamp REAL)"
    }
    
}