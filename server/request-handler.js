/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'X-Requested-With, X-HTTP-Method-Override, content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var fs = require('fs');
var path = require('path');

var messages = [{objectId: 'qpcIw5cVHH', roomname: 'lobby', text: 'this is the basic-server...', updatedAt: '2016-10-03T23:22:38.747Z', username: 'basic-server'}];

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.

  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  var filePath = request.url;
  if (filePath === '/' || filePath.slice(0, 11) === '/?username=') {
    filePath = '/index.html';
  }

  filePath = './client' + filePath;
  var extname = path.extname(filePath);
  var contentType = 'text/html';

  switch (extname) {
  case '.js':
    contentType = 'text/javascript';
    break;
  case '.css':
    contentType = 'text/css';
    break;
  }


  fs.exists(filePath, function(exists) {

    if (exists) {
      fs.readFile(filePath, function(error, content) {
        if (error) {
          response.writeHead(500);
          response.end(JSON.stringify({result: messages}));
        } else {                   
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content, 'utf-8');                  
        }             
      });
    } else {
      var headers = defaultCorsHeaders;
      headers['Content-Type'] = 'text/plain';


      var idGenerator = function() {
        var id = '';

        for (var i = 0; i < 10; i++) {
          var randomNum = Math.random() * 75 + 48;
          id += String.fromCharCode(randomNum);
        }

        return id;
      };

      var etagGenerator = function() {
        var etag;
        
        if (request.method === 'POST') {
          etag = 'p' + messages[0].objectId[0];
        } else if (request.method === 'GET') {
          etag = 'g';

          messages.forEach(function(message) {
            etag += message.objectId[0];
          });
          
        }

        return etag;
      };

      if (request.method === 'OPTIONS') {

        response.writeHead(200, headers);
        response.end(JSON.stringify({results: messages}));    

      } else if (request.method === 'GET') {

        if (request.url === '/classes/messages') {
          
          headers['etag'] = etagGenerator();
          response.writeHead((messages.length ? 200 : 204), headers);
          response.end(JSON.stringify({results: messages}));    
            
        } else {
          response.writeHead(404, headers);
          response.end();
        }

      } else if (request.method === 'POST') {

        if (request.url === '/classes/messages') {

          var body = [];

          request.on('data', function(chunk) {

            body.push(chunk);
          
          }).on('end', function() {

            var newMessage = JSON.parse(body.toString());
            newMessage.objectId = idGenerator();
            messages.push(newMessage);
            headers['etag'] = etagGenerator();

          });

          response.writeHead(201, headers);
          response.end();
        }

      } else {


      }     
    }

  });


  

//******************************************************************************************************************************************************

  // var statusCode = 200;
  // var headers = defaultCorsHeaders;
  // headers['Content-Type'] = 'text/plain';


  // var idGenerator = function() {
  //   var id = '';

  //   for (var i = 0; i < 10; i++) {
  //     var randomNum = Math.random() * 75 + 48;
  //     id += String.fromCharCode(randomNum);
  //   }

  //   return id;
  // };

  // var etagGenerator = function() {
  //   var etag;
    
  //   if (request.method === 'POST') {
  //     etag = 'p' + messages[0].objectId[0];
  //   } else if (request.method === 'GET') {
  //     etag = 'g';

  //     messages.forEach(function(message) {
  //       etag += message.objectId[0];
  //     });
      
  //   }

  //   return etag;
  // };

  // if (request.method === 'OPTIONS') {

  //   response.writeHead(200, headers);
  //   response.end(JSON.stringify({results: messages}));    

  // } else if (request.method === 'GET') {

  //   if (request.url === '/classes/messages') {
      
  //     headers['etag'] = etagGenerator();
  //     response.writeHead((messages.length ? 200 : 204), headers);
  //     response.end(JSON.stringify({results: messages}));    
        
  //   } else {
  //     response.writeHead(404, headers);
  //     response.end();
  //   }

  // } else if (request.method === 'POST') {

  //   if (request.url === '/classes/messages') {

  //     var body = [];

  //     request.on('data', function(chunk) {

  //       body.push(chunk);
      
  //     }).on('end', function() {

  //       var newMessage = JSON.parse(body.toString());
  //       newMessage.objectId = idGenerator();
  //       messages.unshift(newMessage);
  //       headers['etag'] = etagGenerator();

  //     });

  //     response.writeHead(201, headers);
  //     response.end();
  //   }

  // } else {


  // }


//******************************************************************************************************************************************************
  // The outgoing status.

  // See the note below about CORS headers.

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
};


// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.

exports.requestHandler = requestHandler;
