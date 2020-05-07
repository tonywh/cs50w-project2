username = '';

document.addEventListener('DOMContentLoaded', () => {

  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
  
  // Get username
  var username = localStorage.getItem('username');
  if ( username != null && username != '' ) {
    document.querySelector("#username").innerHTML = username;
  } else {
    Swal.fire({
      title: 'SimpleChat',
      input: 'text',
      inputValue: '',
      inputPlaceholder: 'Your display name',
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (!value) {
          return 'This cannot be left blank!'
        }
      }
    }).then((result) => {
      if (result.value) {
        username = result.value;
        localStorage.setItem('username',username);
        document.querySelector("#username").innerHTML = username;
      }
    });
  }

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
      socket.emit('submit channel', {'name': name}, (result, feedback) => {
        if (result != true) {
          Swal.fire("SimpleChat",feedback,"warning");
        }
      });
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

    // Upodate channel timestamp
    channel = channels.find( (channel) => channel.id == data.channel_id );
    channel.timestamp = data.messages[data.messages.length-1].timestamp;
    listChannels();

    // Display messages
    if ( data.channel_id == selectedChannel ) {
      messages = data.messages;
      listMessages();
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

const channel_template = Handlebars.compile(document.querySelector('#channel').innerHTML);
const message_template = Handlebars.compile(document.querySelector('#message').innerHTML);

function getChannels() {
  const request = new XMLHttpRequest();
  request.open('POST', `/channels`);
  request.onload = () => {
    const data = JSON.parse(request.responseText);
    channels = data.channels;
    selectedChannel = 0;
    channelname = localStorage.getItem('channelname');
    if ( channelname != null && channelname != '' ) {
      channel = channels.find( (channel) => channel.name == channelname );
      if ( channel != undefined ) {
        selectedChannel = channel.id;
      }
    }
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
    timestamp_ms = item.timestamp*1000;
    today = new Date().toLocaleDateString();
    datetime = new Date(timestamp_ms);
    datetime_str = datetime.toLocaleDateString();
    if ( datetime_str == today ) {
      datetime_str = datetime.toLocaleTimeString();
    }
    html = channel_template({
      name: item.name,
      time: datetime_str,
      id: item.id,
      selected: index == selectedChannel
    });

    console.log(html);
    list.innerHTML += html;

  });

  // Set the channel onclick listeners
  document.querySelectorAll('.channel').forEach( li => {
    li.onclick = function() {
      selectedChannel = this.getAttribute("value");
      console.log(channels[selectedChannel]);
      localStorage.setItem('channelname', channels[selectedChannel].name);
      listChannels();
      getMessages();
    };
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
      listMessages();
    };
    request.send();
  }
}

function listMessages() {
  document.querySelector('#message-heading').innerHTML = channels[selectedChannel].name;

  // Find and clear the document's message list 
  list = document.querySelector('#message-list');
  list.innerHTML = "";

  if ( messages.length > 0 ) {
    // Add list item for each message
    messages.forEach( (item, index) => {
      li = document.createElement('li');
      li.innerHTML = new Date(item.timestamp*1000).toLocaleString() + " " + item.username + "<br>" + item.text;
      list.append(li);
    });
  } else {
    li = document.createElement('li');
    li.innerHTML = 'No meesages'
    list.append(li);
  }
}

