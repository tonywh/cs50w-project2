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
        self.messages = deque(maxlen=100)
    def addmessage(self, message):
        self.messages.append( message )
        self.timestamp = message.timestamp

# Channel objects
# Index by channel id
channels = []

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
        msglist.append({"username": m.username, "timestamp": m.timestamp, "text": m.text})
    emit("messages", {"channel_id": data["channel_id"], "messages": msglist}, broadcast=True)

@socketio.on("submit channel")
def addchannel(data):
    channels.append(Channel(len(channels), data["name"]))
    chlist = []
    for ch in channels:
        chlist.append({'id':ch.id, 'name': ch.name, 'timestamp': ch.timestamp})
    emit("channels",{"channels": chlist}, broadcast=True)
