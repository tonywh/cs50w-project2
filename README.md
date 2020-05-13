# Project 2

Web Programming with Python and JavaScript.

## Overview
This is Antony Whittam's submission for Project 2 of the CS50W Harvard - EdX course. It is a simple chat web application using a single web page. It uses Flask/Python on the server and HTML/CSS/Javascript on the client, with Bootstrap, Handlebars, Ajax, Web Sockets and is designed to be simple to use, intuitive, and fast.

## Demo
[Watch a screencast demo here.](https://youtu.be/yrgIfbXQjbw)

## Files
| File              | Dir       | Content/Purpose            |
| ----------------- | ----------| --------------------------- |
| application.py    | .         | The Flask server application
| index.html        | templates | The web page including message and channel HTML templates 
| index.js          | static    | Javascript for the web page.
| index.css         | static    | Style for index.html. Includes all the other CSS files.
| channels.css      | static    | Style for channels
| dropdown.css      | static    | Style for message menu dropdown
| messages.css      | static    | Style for messages
| navbar.css        | static    | Navbar style
| favicon.ico       | static    | The icon for the window heading

## Main Features
| Feature               | Technology                  |
| -----------------     | --------------------------- |
| Single page web app   | AJAX, Web Sockets
| Channel list display  | Handlebars templates
| Message list display  | Handlebars templates
| Scrolling columns     | Bootstrap scrollable class
| Stored client state   | Local storage
| Dropdown message menu | Javascript/HTML/CSS
| Username modal popup  | SweetAlert2
| Fetch more on scroll  | Ajax requests
| Responsive layout     | Bootstrap _navbar_ and Bootstrap grids |
| Server channel data   | Python list of class Channel objects
| Server message data   | Python sortedcontainers.SortedKeyList of class Message

## My Personal Touch - Delete Own Message
As my own personal touch in addition to the listed project requirements, I have added the ability for users to delete their own messages. Delete is accessed through a menu button on the chosen message. This menu also has the potential for the addition of several possible options - see below.

## Further development

### Additions to message dropdown menu
* edit
* forward
* reply
* private message to the sender

### Message enhancements
* emoticons
* attachments
* hyperlinks
* formatting

### Channel list enhancements
* indicate channels with unread messages
* order channels by timestamp of most recent message