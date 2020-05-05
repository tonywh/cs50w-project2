import os
import time
from collections import deque

from flask import Flask, session, render_template, request, redirect, url_for, jsonify
from flask_session import Session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
site = "SimpleChat"

class Message:
    def __init__(self, username, timestamp, text):
        self.username = username
        self.timestamp = timestamp
        self.text = text

class Channel:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.timestamp = time.time()
    def addmessage(self, message):
        messages = messageLists[self.id]
        if len(messages) >= 100:
            messages.pop(0)
        messages.append( message )
        self.timestamp = message.timestamp

# Message lists for each channel
# Index by channel id
messageLists = []

# Channel objects
# Index by channel id
channels = []

@app.route("/")
def index():
    return render_template("index.html",site=site)

@socketio.on("submit message")
def addmessage(data):
    channel = channels[ data["channelname"] ]
    message = Message(data["username"], time.time(), data["text"])
    channel.addmessage(message)
    emit("messages", {"channel": data["channel_id"], "message": message}, broadcast=True)

@socketio.on("submit channel")
def addchannel(data):
    channels.append(Channel(len(channels), data["name"]))
    chlist = []
    for channel in channels:
        chlist.append({'id':channel.id, 'name': channel.name, 'timestamp': channel.timestamp})
    print(chlist)
    emit("channels",{"channels": chlist}, broadcast=True)
