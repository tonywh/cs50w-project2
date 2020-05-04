document.addEventListener('DOMContentLoaded', () => {

  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
  
  // Get username
  var username = localStorage.getItem('username');
  while ( username == null || username == "" ) {
    username = prompt( "Display name: ?");
  }
  document.querySelector("#username").innerHTML = username;

  // When connected, configure buttons
  socket.on('connect', () => {
    //
    // Message submit form
    //
    document.querySelector('#submit-message #submit').disabled = true;
    document.querySelector('#submit-message #message').onkeyup = () => {
        if (document.querySelector('#submit-message #message').value.length > 0)
            document.querySelector('#submit-message #submit').disabled = false;
        else
            document.querySelector('#submit-message #submit').disabled = true;
    };
    document.querySelector('#submit-message').onsubmit = () => {
      return false;
    };

    //
    // Channel submit form
    //
    document.querySelector('#submit-channel #submit').disabled = true;
    document.querySelector('#submit-channel #channel').onkeyup = () => {
        if (document.querySelector('#submit-channel #channel').value.length > 0)
            document.querySelector('#submit-channel #submit').disabled = false;
        else
            document.querySelector('#submit-channel #submit').disabled = true;
    };
    document.querySelector('#submit-channel').onsubmit = () => {
      return false;
    };

  });

  // When a new message is announced ...
  socket.on('message', data => {
  });

  // When a new channel is announced ...
  socket.on('message', data => {
  });

});
