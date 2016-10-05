var express = require('express');

var app = express();

var messages = [];
// var messages = [{objectId: 'qpcIw5cVHH', roomname: 'lobby', text: 'this is the express server...', username: 'express'}];
var deletedMessages = [];

var idGenerator = function() {
  var id = '';

  for (var i = 0; i < 10; i++) {
    var randomNum = Math.random() * 75 + 48;
    id += String.fromCharCode(randomNum);
  }

  return id;
};

app.use(express.static('client'));

app.use('/classes/messages', function(req, res, next) {
  res.setHeader('access-control-allow-origin', '*');
  next();
});

app.get('/classes/messages', function(req, res) {
  console.log('serving GET request on', req.url);

  if (messages.length) {
    res.send(JSON.stringify({results: messages}));    
  } else {
    res.status(204);
    res.send(JSON.stringify({results: messages}));
  }
});

app.post('/classes/messages', function(req, res) {
  console.log('serving POST request on', req.url);
  
  var body = [];

  req.on('data', function(chunk) {
    body.push(chunk);
  }).on('end', function() {
    var newMessage = JSON.parse(body.toString());
    newMessage.objectId = idGenerator();
    messages.unshift(newMessage);
    res.status(201);
    res.send(JSON.stringify({results: messages}));
  });
});

app.delete('/classes/messages/**********', function(req, res) {
  console.log('serving DELETE request on', req.url);

  var id = req.url.slice(18);
  console.log(id);

  for (var i = 0; i < messages.length; i++) {
    if (messages[i].objectId === id) {
      deletedMessages.push(messages.splice(i, 1));
      break;      
    } 
  }

  res.status(204);
  res.send();
});

app.listen(3000, function() {
  console.log('App is running on port 3000');
});