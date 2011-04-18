/*
    A wrapper to interact with local SQL and make it as simple as local storage, sorta
    
    
    TODO
    this wrapper should check 'this.db' and see if it's currently doing a transaction (such as table create) and cue accordingly to avoid simultaneous requests that could cause write lock
    
    Research required:
        this.db properties and if a 'availble' / busy flag is available.
*/

(function() {

    var default_desc = "A local SQL DB", default_size = 5000000, default_version = 1,
        sqlDB = function( name, options ) {
            if(!options) options = {};
        
            return new DBWrapper( name, options );
            
        }
    
    function DBWrapper( name, options ) {
        return this.init( name, options )
    }
    
    window.sqlDB = sqlDB;
    DBWrapper.prototype = {
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
                    console.log("error", error, tx);
                    throw (error.message || "");
                });
            })
        },
        
        save : function( key, value, callback ) {
            var self=this, no_table = "no such table"
                saved_value = (typeof value === "string") ? value : JSON.stringify( value );
                // todo
                // clean this up so SET is pulled from the table schema value in this.settings.schema
                // shoud be able to write simple regex based on def pattern (name TYPE, name TYPE) etc
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
                        if(sql_error.message.indexOf( no_table ) > -1 ) {
                            // do an insert, if that fails, create the table and do everything
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
            var saved_value = (typeof value === "string") ? value : JSON.stringify( value );
                items = [ key, saved_value ], attempts = 0, 
                self=this, no_table = "no such table";
            function add_insert_error(tx, sql_error) {
                console.log("error with add_insert_error", tx, sql_error, key, value );
                if(sql_error.message.indexOf( no_table ) > -1  ) {
                    // create a table here... 
                    attempts += 1;

                    self.create_table( function() {
                        if(attempts > 5 ) return;
                        
                        setTimeout(function() {
                            self.insert( items, null, callback, add_insert_error );
                        }, 20);

                    }, add_insert_error );
                } else if( sql_error.code > 0 ) {
                    attempts += 1;
                    console.log("error code", sql_error.code, "re-attempt", attempts);
                    setTimeout(function() {
                        self.save( key, value, callback );                        
                    }, 30 );

                }
            }
            if(attempts>5) {
                if(callback) callback({ 'error' : 'attempt excepted'});
                console.log("attempts exceeeded", attempts)
                return;
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
                    console.log("error creating table", error)
                }
            }
            console.log(this, "trying to make table now....")
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