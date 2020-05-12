# Project 2

Web Programming with Python and JavaScript.

## Overview
Antony Whittam's submission for Project 2 of the ES50W Harvard - EdX course. It is a simple chat web application using a single web page. It uses Flask/Python on the server and HTML/CSS/Javascript on the client, with Bootstrap, Handlebars, Ajax, Web Sockets. It is designed to be simple, intuitive, and fast.

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

## Further development

### Additions to message dropdown menu
* private message the sender
* edit
* formward
* reply

### Message enhancements
* emoticons
* attachments
* hyperlinks
* formatting
