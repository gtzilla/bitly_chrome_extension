var bitly = {}, page_port, rejects = new RegExp( "(//js-kit.com)+" );
bitly.find_images = function() {
    console.log('working')
    var page_images = document.getElementsByTagName("body")[0].getElementsByTagName('img') || [];

    var img_width = 0, image_urls = [], img_src;
    for(var i=0; i<page_images.length; i ++) {
        img_width = page_images[i].naturalWidth; // NOTE - this is chrome / html5 specific
        img_height = page_images[i].naturalHeight; // NOTE - this is chrome / html5 specific          
        img_src = page_images[i].getAttribute("src");
        
        //bail if no source
        if(!img_src) continue;
        
        if(img_width > 80 && img_height > 50) {
            if(img_src.indexOf('/') === 0 ) img_src = "http://" + document.location.host + img_src;
        
            if(img_src.indexOf('http') !== 0 && img_src.indexOf('data:image') !== 0 ) img_src = document.location.href + img_src;
            
            if( contains_junk( img_src ) ) continue;
            
            image_urls.push( img_src );
        }

    }
    // fix the relative url issue....
    var params = { 'image_elements' : image_urls };    

    return params;
}

function contains_junk( img_url ) {
    var matches = img_url.match(rejects)
    if(matches && matches.length > 0) return true;
    
    return false;
}

bitly.images_page_connection_listener = function(port) {
    page_port = port;
    page_port.onMessage.addListener(function(  message  ) {
        var images = bitly.find_images();
        
        page_port.postMessage(images);     

    });
    
    var images = bitly.find_images();            
    page_port.postMessage(images);                 
}


chrome.extension.onConnect.addListener( bitly.images_page_connection_listener );
console.log("bit.ly")
    

