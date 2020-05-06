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

  // When connected do the rest
  socket.on('connect', () => {

    configTextInputForm('#submit-message');
    document.querySelector('#submit-message').onsubmit = () => {
      const text = removeTextFromForm('#submit-message');
      id = channels[selectedChannel].id;
      socket.emit('submit message',{'channel_id': id, 'username': username, 'text': text});
      console.log('Submitted message ' + text + ' on channel_id ' + id);
      return false;
    };

    configTextInputForm('#submit-channel');
    document.querySelector('#submit-channel').onsubmit = () => {
      const name = removeTextFromForm('#submit-channel');
      socket.emit('submit channel',{'name': name});
      console.log('Submitted channel ' + name);
      return false;
    };

    getChannels();

    console.log('Loaded');
  });

  // When a new message is announced ...
  socket.on('messages', data => {
    console.log('Message announcement');
    console.log(data)
    if ( data.channel_id == selectedChannel ) {
      messages = data.messages;
      listMessages();
    } else {
      // Handle channel timestamp update
    }
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

function removeTextFromForm(name) {
  const text = document.querySelector(name + ' .text').value;
  document.querySelector(name + ' .text').value = "";
  document.querySelector(name + ' .submit').disabled = true;
  return text;
}

var channels;
var selectedChannel;
var messages;

function getChannels() {
  const request = new XMLHttpRequest();
  request.open('POST', `/channels`);
  request.onload = () => {
    const data = JSON.parse(request.responseText);
    channels = data.channels;
    selectedChannel = 0;
    console.log(channels);
    listChannels();
    getMessages();
  };
  request.send();
}

function listChannels() {
  // Find and clear the document's channel list 
  list = document.querySelector('#channel-list');
  list.innerHTML = "";

  // Add list item for each channel
  channels.forEach( (item, index) => {
    li = document.createElement('li');
    link = '#'
    li.innerHTML = '<a href="' + link + '">' + item.name + '</a>';
    if ( index == selectedChannel ) {
      li.innerHTML = '<b>' + li.innerHTML + '</b>';
    }
    li.value = item.id;
    list.append(li);
  });
}

function getMessages() {
  if ( channels.length > 0 ) {
    channel = channels[selectedChannel];
    const request = new XMLHttpRequest();
    request.open('POST', `/messages/${channel.id}`);
    request.onload = () => {
      const data = JSON.parse(request.responseText);
      messages = data.messages;
      console.log(messages);
      listMessages();
    };
    request.send();
  }
}

function listMessages() {
  // Find and clear the document's message list 
  list = document.querySelector('#message-list');
  list.innerHTML = "";

  if ( messages.length > 0 ) {
    // Add list item for each message
    messages.forEach( (item, index) => {
      li = document.createElement('li');
      li.innerHTML = item.timestamp + " " + item.username + "<br>" + item.text;
      list.append(li);
    });
  } else {
    li = document.createElement('li');
    li.innerHTML = 'No meesages'
    list.append(li);
  }
}

