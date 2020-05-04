import os
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
    def __init__(self, name ):
        self.name = name
        self.messages = collections.deque(maxlen=100)
    def addmessage(self, message):
        self.messages.append( message )

channels = {}

@app.route("/")
def index():
    return render_template("index.html",site=site)

@socketio.on("submit message")
def addmessage(data):
    channel = channels[ data["channelname"] ]
    message = Message(data["user_id"], now, data["text"])
    channel.addmessage(message)
    emit("message", {"channel": data["channel_id"], "message": message}, broadcast=True)

@socketio.on("submit channel")
def addchannel(data):
    channel = Channel(data["name"])
    channels.append(channel)
    emit("channel",{"channel_id": len(channels)-1, "channel": channel}, broadcast=True)
