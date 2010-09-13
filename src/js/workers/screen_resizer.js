note_prefs/*
    Worker Script
    
    screen_resizer
    
    Send a base64 encoded string from the browser screen capture to the server
        Downsize it, return a base64 string that can be used to render the image
        
    There is probably a better way to do this...
    
*/
var first_time = true, open_socket;
onmessage = function(e){
  if ( e.data.type === "resize" ) {
    // Do some computation
    
    if(first_time) {
        create_socket();
        open_socket.onopen = function() {
            open_socket.send(JSON.stringify( {'type':e.data.type, "screen_grab" : e.data.screen_grab, 'long_url' : e.data.long_url } ) )
        }        
        first_time=false;
    } else if( open_socket && open_socket.readyState === 1) {
        open_socket.send(JSON.stringify( { 'type':e.data.type, "screen_grab" : e.data.screen_grab, 'long_url' : e.data.long_url } ) )
    } else {
        create_socket();
        open_socket.onopen = function() {
            open_socket.send(JSON.stringify( {'type':e.data.type, "screen_grab" : e.data.screen_grab, 'long_url' : e.data.long_url } ) )
        }
    }


    

  }
};
function done(){
  // Send back the results to the parent page
  postMessage("done");
}

function create_socket() {
    open_socket = new WebSocket("ws://test.example/websocket/data/resize_image");

    open_socket.onclose = function(){
        //console.log('Shutting down connection to url:', arguments, open_socket, open_socket.URL)
        postMessage({ 'close' : 'socket closed' });
        open_socket=null;
    }
    open_socket.onmessage = function(event){
        // return the image
        postMessage( JSON.parse(event.data).data );
    }
}