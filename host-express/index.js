'use strict';

var express = require('express');
var app = express();
var Server = require('http').Server;
var server = new Server(app);

server.listen(3000);

app.use('/', express.static(__dirname + '../ui/build/'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '../ui/build/index.html');
});

require('open')("http://localhost:3000/");
