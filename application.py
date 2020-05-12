import os
import time
from collections import deque
from sortedcontainers import SortedKeyList

from flask import Flask, session, render_template, request, redirect, url_for, jsonify
from flask_session import Session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
site = "SimpleChat"

class Message:
    serial = 0
    def __init__(self, username, timestamp, text):
        self.id = Message.serial
        Message.serial += 1
        self.username = username
        self.timestamp = timestamp
        self.text = text
    @staticmethod
    def key(message):
        return -message.id      # negative to have newest messages at the beginning

class Channel:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.timestamp = time.time()
        self.messages = SortedKeyList(key=Message.key)
    def addmessage(self, message):
        self.messages.add( message )
        self.timestamp = message.timestamp
        if len(self.messages) > 100:
            self.messages.pop(-1)   # remove the oldest
    def deletemessage(self, id):
        index = self.messages.bisect_key_left( -id )
        print( "id: ", id, "index:", index )
        self.messages.pop(index)

# Channel objects
# Index by channel id
channels = []

# Set of unique channel names.
# Used to efficiently check whether a name already exists
channelNameSet = set()

@app.route("/")
def index():
    return render_template("index.html",site=site)

@app.route("/channels", methods=["POST"])
def channels_api():
    chlist = []
    for ch in channels:
        chlist.append({'id':ch.id, 'name': ch.name, 'timestamp': ch.timestamp})
    return jsonify({"channels": chlist})

@app.route("/messages", methods=["POST"])
def messages_api():
    channel_id = int(request.form.get("channel_id") or 0)
    start = int(request.form.get("start") or 0)
    end = int(request.form.get("end") or start + 20)
    if channel_id < len(channels):
        channel = channels[channel_id]
        msglist = []
        if start < len(channel.messages) and end > start:
            if end > len(channel.messages):
                end = len(channel.messages)    
            for m in channel.messages[start:end]:
                msglist.append({"id": m.id, "username": m.username, "timestamp": m.timestamp, "text": m.text})
        return jsonify({"channel_id": channel_id, "messages": msglist})
    else:
        return "Error"

@socketio.on("submit message")
def addmessage(data):
    channel = channels[ data["channel_id"] ]
    timestamp = time.time()
    message = Message(data["username"], timestamp, data["text"])
    channel.addmessage(message)
    emit("messages updated", {"channel_id": data["channel_id"], "timestamp": timestamp}, broadcast=True)

@socketio.on("submit channel")
def addchannel(data):
    newname = data["name"]
    if newname in channelNameSet:
        return False, "Channel '" + newname + "' already exists"
    else:
        channels.append(Channel(len(channels), newname))
        channelNameSet.add(newname)
        chlist = []
        for ch in channels:
            chlist.append({'id':ch.id, 'name': ch.name, 'timestamp': ch.timestamp})
        emit("channels",{"channels": chlist}, broadcast=True)
        return True, ""

@socketio.on("delete message")
def deletemessage(data):
    channel = channels[ data["channel_id"] ]
    channel.deletemessage(int(data["message_id"]))
    emit("messages updated", {"channel_id": data["channel_id"], "timestamp": channel.timestamp}, broadcast=True)
