var bitly;


if(!BitlyAPI) return;

function init_api() {
    // get from local storage?
    // use the 
    
    var b = BitlyAPI();
        b.auth("exttestaccount", "whatever", function() {
            test_realtime();
            
            
        })
    return b;                                
}



var bitly = init_api();

function test_realtime() {
    bitly.realtime(function(jo) {
        console.log("word", jo)
    })
}

function test_shorten() {
    bitly.shorten("http://jehiah.cz", function(response) {
        console.log("woo-hoo a callback", response)
    });                
}

function test_expand( the_url_or_urls ) {
    bitly.expand("http://gt-co.de/b9jSS9");
    bitly.expand(["http://gt-co.de/9r2DgB", "http://gt-co.de/b9jSS9"])
}

function test_overload() {
    var many_urls = ["http://bit.ly/aYOnWr", "http://gt-co.de/9r2DgB", "http://gt-co.de/b9jSS9", "http://bit.ly/bn8RFF", "http://bit.ly/dfD4Ya", "http://bit.ly/9lksmy", "http://bit.ly/bHLvTA", "http://bit.ly/bHLA", "http://bit.ly/9ZRrsZ", "http://bit.ly/bMKKxB", "http://bit.ly/bjlNiP", "http://bit.ly/d5Hz9n", "http://bit.ly/9ozQ28", "http://bit.ly/9m6y86", "http://bit.ly/9JdS3p", "http://bit.ly/bmGYxY", "http://bit.ly/bVr7fH", "http://bit.ly/9mBQBV"]
    bitly.expand( many_urls, function(response) {
        console.log(response, " final overload call, right?");
    } );
}

function run_tests() {
    bitly.auth("exttestaccount", "whatever", function(response) {
        console.log("callback for auth is -->", response)
        
        
        test_shorten();
        //test_expand();  
        test_overload();                  
        
    });
    
    

    

}



