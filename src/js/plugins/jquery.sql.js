/*
    name : sql
    file : jquery.sql.js
    author : gregory tomlinson
    copyright: (c) 2010 bit.ly
    Dual licensed under the MIT and GPL licenses.
    ///////////////////////////
    ///////////////////////////
    dependencies : jQuery 1.4.2, bitly_settings.js
    ///////////////////////////
    ///////////////////////////

*/

(function() {
    
    $.extend(true, {
        sql : {
            
            createTable : function( tableName, schema, callback, error ) {
                try {
                    db.transaction(function(tx) {
                        tx.executeSql("CREATE TABLE " + tableName + " " + schema, [], callback, error )
                    });
                } catch(e) {
                    console.log('Couldnot create table: ', tableName, e)
                }
            },
            dropTable : function( tableName, callback, error ) {
                db.transaction(function(tx) {
                  tx.executeSql("DROP TABLE " + tableName, [], callback, error);
                });
            },
            
            upgradeTable : function() {
                //TODO
                // this is for upgrading the table if things have changed....
            },
            
            select : function(tableName, columns_array, where_clause, callback, error) {
                // this is a simple array of all the things you want back
                // ["*"]
                if(!error) error = function(e){ console.log('error on select', e) }
                db.transaction(function(tx) {
                    var sql = "Select * FROM " +  tableName + " " + where_clause
                   tx.executeSql(sql, [], callback, error)
                });
            },
            
            sqlRaw : function(rawSQL, value_arguments, callback, error) {
                // YOU really, really better know what your doing if you run this... REALLY KNOW
                db.transaction(function(tx) {
                   tx.executeSql(rawSQL, value_arguments, callback, error)
                });
            },
            
            insert : function( tableName, inserts_array, callback, error ) {
                if(!error) error = function(e){ console.log('error on select', e) }
                db.transaction(function(tx) {
                  tx.executeSql("INSERT INTO " + tableName +
                                " (id, title, share_text, url, long_url, global_hash, image, timestamp) VALUES (?,?,?,?,?,?,?,?)",
                                inserts_array, callback, error);
                });
            },
            
            deleteFrom : function(tableName, callback, error) {
                if(!error) error = function(e){ console.log('error on select', e, arguments) }
                db.transaction(function(tx) {
                  tx.executeSql("DELETE FROM " + tableName, callback, error);
                });
            },
            
            insertMulti : function( tableName ) {
                // use this to insert many items in one transaction
            },
            
            update : function() {
            
            },
            
            init : function() {
                try {
                    db = window.openDatabase( bitly_settings.db_name, bitly_settings.db_ver, bitly_settings.db_desc, 5000000);
                } catch(e) {
                    console.log("ERROR with local DB", e, arguments);
                    return
                }
            }
        
        },
        updateSQLOptions : {
            // TODO
            // do stuff here
        },
    })
    
    var defaults = {
        // really the bitly_settings is a conf file
    }, db;
    $.sql.init();

})(jQuery);
// kick it off...
