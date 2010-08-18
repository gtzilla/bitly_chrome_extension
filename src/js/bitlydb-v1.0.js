/*
    A wrapper to interact with local SQL and make it as simple as local storage, sorta
*/

(function() {

    var default_desc = "A local SQL DB", default_size = 5000000, default_version = 1
        bitlyDB = function( name, options ) {
            if(!options) options = {};
        
            return new BitDatabase( name, options );
            
        }
    
    function BitDatabase( name, options ) {
        return this.init( name, options )
    }
    
    window.bitlyDB = bitlyDB;
    BitDatabase.prototype = {
        // hmmm,right now, you can make different objects and interect with diff tables, but will always be same db
        init : function( name, options ) {
            this.db = window.openDatabase( name, options.version || default_version, 
                                            options.description || default_desc, options.size || default_size );
                                            
                                            
            return this;
        },
        
        find : function( key, callback ) {
            var sql_string = "SELECT * FROM " + this.settings.table + " WHERE itemKey=?";
            this.db.transaction(function(tx) {
                tx.executeSql(sql_string, [key], function(tx, sql_result) {
                    
                    var db_results = [], db_value, result, i=0;
                    for( ; i<sql_result.rows.length; i++) {
                        result=sql_result.rows.item(i)
                        try {
                            db_value = JSON.parse( result.itemValue );
                        } catch(e) { db_value = result.itemValue }
                    }
                    
                    if(callback) callback(db_value)
                }, function(tx, error) {
                    console.log("error", error, tx)
                });
            })
        },
        
        save : function( key, value, callback ) {
            var self=this, no_table = "no such table"
                saved_value = (typeof value === "string") ? value : JSON.stringify( value )
                sql = "UPDATE " + this.settings.table + " SET itemValue=? WHERE itemKey=?";
            this.db.transaction(function(tx) {

                tx.executeSql( sql, [saved_value, key], 
                    function(tx, sql_result){
                        if(sql_result.rowsAffected === 0) {
                            // check to make sure update worked, fall back to insert
                            setTimeout(function(){
                                self.add(key, value, callback);                                
                            }, 15)

                        } else {
                            callback(tx, sql_result)
                        }
                    }, 
                    function(tx, sql_error) {
                        console.log("sql error", sql_error, tx);
                        if(sql_error.code === 1 && sql_error.message.indexOf( no_table ) > -1 ) {
                            // do an insert, if that fails, create the table and do everything
                            console.log("attempt to insert or create table")
                            self.add( key, value, callback )
                        }
                });
            })
            
        },
        
        remove : function( key, callback) {
            
            var sql = "DELETE FROM " + this.settings.table + " WHERE itemKey=?";
            this.db.transaction(function(tx) {
                tx.executeSql( sql, [key], callback, function(tx, sql_error) {
                    console.log("error deleting", tx, sql_error)
                    
                })
            })
            
        },
                
        add : function( key, value, callback ) {
            console.log(key, value)
            var saved_value = (typeof value === "string") ? value : JSON.stringify( value );
                items = [ key, saved_value ], attempts = 0, 
                self=this, no_table = "no such table";

            
            function add_insert_error(tx, sql_error) {
                if(sql_error.code === 1 ) {
                    // create a table here... 
                    attempts += 1;
                    if(sql_error.message.indexOf( no_table ) > -1) {
                        self.create_table( function() {
                            if(attempts > 5 ) return;
                            
                            setTimeout(function() {
                                self.insert( items, null, callback, add_insert_error );
                            }, 20);

                        })                            
                    }

                }                
            }
            
            this.insert( items, null, callback, add_insert_error );

        },
        
        insert : function( values, columns, callback, error ) {
            // todo
            // replace table_insert_handler
            var markers = [], i=0, columns = columns || ["itemKey", "itemValue"], 
                sql_string = "INSERT INTO " + ( this.settings.table || "bitly" );

            for(; i<columns.length; i++) { markers.push("?"); }
            // default "INSERT INTO bitly (itemKey, itemKey) VALUES(?,?)"
            sql_string += " (" + columns.join(', ') + ") VALUES ("+ markers.join(',') +")";


            try {
                this.db.transaction(function(tx) {
                    tx.executeSql( sql_string, values || [], callback, error);
                });            
            } catch(e) {
                console.log("try/catch error", e, this.db)
            }            
        },
        
        drop_table : function( callback ) {
            var sql = "DROP TABLE " + this.settings.table, 
                no_table = "no such table", callback = callback || function(){ console.log("drop table", arguments); };
            this.db.transaction(function(tx) {
                tx.executeSql( sql, [], callback, function(tx, sql_error) {
                    console.log("error in drop", sql_error, tx)

                });
            })
        },        
        
        create_table : function( callback, error ) {

            var self = this;
            if(!error) {
                error = function(tx,sql_error) {
                    console.log("error creating table")
                }
            }
            this.db.transaction(function(tx) {
                //tx.executeSql( sql_string, obj.values || [], obj.success, obj.error);
                tx.executeSql("CREATE TABLE " + self.settings.table + " " + self.settings.schema, [], callback, error )                
            });
        },
        
        set_table : function( table_name ) {
            this.settings.table = table_name;
        },
        
        settings : {
            table : "bitly",
            schema : "(itemKey UNIQUE, itemValue TEXT)"
        }
        
    }
    
})();