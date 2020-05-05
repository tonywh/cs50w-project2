document.addEventListener('DOMContentLoaded', () => {

  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
  
  // Get username
  var username = localStorage.getItem('username');
  while ( username == null || username == "" ) {
    username = prompt( "Set display name:");
  }
  localStorage.setItem('username',username);
  document.querySelector("#username").innerHTML = username;

  // When connected ...
  socket.on('connect', () => {

    configTextInputForm('#submit-message');
    document.querySelector('#submit-message').onsubmit = () => {
      return false;
    };

    configTextInputForm('#submit-channel');
    document.querySelector('#submit-channel').onsubmit = () => {
      const name = document.querySelector('#submit-channel .text').value;
      document.querySelector('#submit-channel .text').value = "";
      document.querySelector('#submit-channel .submit').disabled = true;
      socket.emit('submit channel',{'name': name});
      console.log('Submitted channel ' + name);
      return false;
    };

    console.log('Loaded');
  });

  // When a new message is announced ...
  socket.on('messages', data => {
    console.log('Message announcement');
  });

  // When a new channel is announced ...
  socket.on('channels', data => {
    console.log('Channel announcement');
    channels = data.channels;
    console.log(channels);
    listChannels();
  });

});

function configTextInputForm(name) {
  document.querySelector( name + ' .submit').disabled = true;
  document.querySelector(name + ' .text').onkeyup = () => {
      if (document.querySelector(name + ' .text').value.length > 0)
          document.querySelector(name + ' .submit').disabled = false;
      else
          document.querySelector(name + ' .submit').disabled = true;
  };
}

function listChannels() {
  // Find and clear the document's channel list 
  list = document.querySelector('#channel-list');
  list.innerHTML = "";

  // Add list item for each channel
  channels.forEach( (item) => {
    li = document.createElement('li');
    li.innerHTML = item.name;
    li.value = item.id;
    list.append(li);
  });
}
