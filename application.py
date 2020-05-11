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
        return message.id

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
            self.messages.pop(0)
    def deletemessage(self, id):
        index = self.messages.bisect_key_left( id )
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

@app.route("/messages/<int:channel_id>", methods=["POST"])
def messages_api(channel_id):
    if channel_id < len(channels):
        channel = channels[channel_id]
        msglist = []
        for m in channel.messages:
            msglist.append({"username": m.username, "timestamp": m.timestamp, "text": m.text})
        return jsonify({"channel_id": channel_id, "messages": msglist})
    else:
        return "Error"

@socketio.on("submit message")
def addmessage(data):
    channel = channels[ data["channel_id"] ]
    message = Message(data["username"], time.time(), data["text"])
    channel.addmessage(message)
    msglist = []
    for m in channel.messages:
        msglist.append({"id": m.id, "username": m.username, "timestamp": m.timestamp, "text": m.text})
    emit("messages", {"channel_id": data["channel_id"], "messages": msglist}, broadcast=True)

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
    msglist = []
    for m in channel.messages:
        msglist.append({"username": m.username, "timestamp": m.timestamp, "text": m.text})
    emit("messages", {"channel_id": data["channel_id"], "messages": msglist}, broadcast=True)
