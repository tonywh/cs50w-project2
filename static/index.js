var channels;
var selectedChannel;
var newChannelName;
var messages;
var messageScrollTop;

const channel_template = Handlebars.compile(document.querySelector('#channel').innerHTML);
const message_template = Handlebars.compile(document.querySelector('#message').innerHTML);

var username = '';
var socket;

document.addEventListener('DOMContentLoaded', () => {

  // Connect to websocket
  socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
  
  // Get username
  username = localStorage.getItem('username');
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
      return false;
    };

    configTextInputForm('#submit-channel');
    document.querySelector('#submit-channel').onsubmit = () => {
      const name = removeTextFromForm('#submit-channel');
      newChannelName = name;
      socket.emit('submit channel', {'name': name}, (result, feedback) => {
        if (result != true) {
          newChannelName = undefined;
          Swal.fire("SimpleChat",feedback,"warning");
        }
      });
      return false;
    };

    document.querySelector('#messages').onscroll = () => {
      if ( document.querySelector('#messages').scrollTop == 0 ) {
        getMoreMessages();
      }
    };

    getChannels();
  });

  // When a message update ...
  socket.on('messages updated', data => {
    // Upodate channel timestamp
    channel = channels.find( (channel) => channel.id == data.channel_id );
    channel.timestamp = data.timestamp;
    listChannels();

    // Display messages
    if ( data.channel_id == selectedChannel ) {
      getMessages();
    }
  });

  // When a new channel is announced ...
  socket.on('channels', data => {
    channels = data.channels;
    channel = undefined;
    if ( newChannelName != undefined && newChannelName != null && newChannelName != '' ) {
      channel = channels.find( (channel) => channel.name == newChannelName );
      newChannelName = undefined;
      if ( channel != undefined ) {
        selectedChannel = channel.id;
      }
    }
    listChannels();
    if ( channel != undefined ) {
      getMessages();
    }
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

    list.innerHTML += html;
  });

  // Set the channel onclick listeners
  document.querySelectorAll('.channel').forEach( item => {
    item.onclick = function() {
      selectedChannel = this.getAttribute("value");
      localStorage.setItem('channelname', channels[selectedChannel].name);
      listChannels();
      getMessages();
    };
  });

  if ( channels.length == 0 ) {
    document.querySelector('#submit-channel .text').focus();
  }
}

function getMessages() {
  if ( channels.length > 0 ) {
    channel = channels[selectedChannel];
    const request = new XMLHttpRequest();
    request.open('POST', `/messages`);
    request.onload = () => {
      const data = JSON.parse(request.responseText);
      messages = data.messages;
      listMessages();
    };
    const data = new FormData();
    data.append('channel_id', channel.id);
    data.append('start', 0);
    data.append('end', 20);
    request.send(data);
  } else {
    document.querySelector('#submit-message .text').disabled = true;
  }
}

function getMoreMessages() {
  channel = channels[selectedChannel];
  const request = new XMLHttpRequest();
  request.open('POST', '/messages');
  request.onload = () => {
    const data = JSON.parse(request.responseText);
    messages.push(...data.messages);
    listMessages(newlist=false);
  };
  const data = new FormData();
  data.append('channel_id', channel.id);
  data.append('start', messages.length);
  data.append('end', messages.length + 20);
  request.send(data);
}

function listMessages(newlist=true) {
  document.querySelector('#message-heading').innerHTML = channels[selectedChannel].name;

  scrollHeight = document.querySelector('#messages').scrollHeight;

  // Find and clear the document's message list 
  list = document.querySelector('#message-list');
  list.innerHTML = "";

  if ( messages != undefined && messages.length > 0 ) {

    // Add list item for each message
    messages.forEach( (item) => {

      // Format the timestamp
      timestamp_ms = item.timestamp*1000;
      today = new Date().toLocaleDateString();
      datetime = new Date(timestamp_ms);
      datetime_str = datetime.toLocaleDateString();
      if ( datetime_str == today ) {
        datetime_str = datetime.toLocaleTimeString();
      }

      // Set up the hover menu for dropdown button
      links = [];
      if ( item.username == username ) {
        links.push({ action: 'delete', text: 'Delete' });
      } else {
        // Enable this line to add PM menu item
        // links.push({ action: 'pm', text: 'PM ' + item.username });
      }

      // Create the html
      html = message_template({
        id: item.id,
        name: item.username,
        time: datetime_str,
        text: item.text,
        links: links
      });
  
      list.innerHTML = html + list.innerHTML;
    });
  } else {
    list.innerHTML = 'No messages'
  }

  // Set the message hover menu onclick listeners on each menu item
  document.querySelectorAll('.message').forEach( message => {
    message.querySelectorAll('.dropdown-item').forEach( item => {
      item.onclick = function() {
        action = this.getAttribute('value');
        messageId = item.closest('.message').getAttribute('value');
        switch (action) {
          case 'delete':
            console.log("delete " + messageId);
            deleteMessage(selectedChannel,messageId);
            break;
          case 'pm':
            // Add code here to implement
            break;
        }
      };
    });
  });

  document.querySelector('#submit-message .text').disabled = false;

  messageColumn = document.querySelector('#messages');
  if ( newlist ) {
    // Scroll to the bottom of the messages
    messageColumn.scrollTop = messageColumn.scrollHeight - messageColumn.offsetHeight;;
    document.querySelector('#submit-message .text').focus();
  } else {
    // Set scroll to keep messages in same position
    messageColumn.scrollTop = messageColumn.scrollHeight - scrollHeight;
  }

}

function deleteMessage(channel, messageId) {
  id = channels[channel].id;
  socket.emit('delete message',{'channel_id': id, 'message_id': messageId});
}
