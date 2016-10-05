var request = require('request');
var expect = require('chai').expect;

describe('server', function() {

  it('should respond to GET requests for /classes/messages that have no messages with a 204 status code', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      expect(response.statusCode).to.equal(204);
      var testRequest = {method: 'POST',
        uri: 'http://127.0.0.1:3000/classes/messages',
        json: {
          username: 'test',
          message: 'Just to add content to the server'}
      };

      request(testRequest, function(error, response, body) {
      });  
      done();
    });
  });  


  it('should respond to GET requests for /classes/messages with a 200 status code', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it('should send back parsable stringified JSON', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      expect(JSON.parse.bind(this, body)).to.not.throw();
      done();
    });
  });

  it('should send back an object', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      var parsedBody = JSON.parse(body);
      expect(parsedBody).to.be.an('object');
      done();
    });
  });

  it('should send an object containing a `results` array', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      var parsedBody = JSON.parse(body);
      expect(parsedBody).to.be.an('object');
      expect(parsedBody.results).to.be.an('array');
      done();
    });
  });

  it('should accept POST requests to /classes/messages', function(done) {
    var requestParams = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jono',
        message: 'Do my bidding!'}
    };

    request(requestParams, function(error, response, body) {
      expect(response.statusCode).to.equal(201);
      done();
    });
  });
  
  it('should respond with messages that were previously posted', function(done) {
    var requestParams = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jono',
        message: 'Do my bidding!'}
    };

    request(requestParams, function(error, response, body) {
      // Now if we request the log, that message we posted should be there:
      request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
        var messages = JSON.parse(body).results;
        expect(messages[0].username).to.equal('Jono');
        expect(messages[0].message).to.equal('Do my bidding!');
        done();
      });
    });
  });

  it('Should 404 when asked for a nonexistent endpoint', function(done) {
    request('http://127.0.0.1:3000/arglebargle', function(error, response, body) {
      expect(response.statusCode).to.equal(404);
      done();
    });
  });

  it('should respond with mutiple messages that were previously posted', function(done) {
    var requestParams1 = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jono',
        message: 'Do my bidding!'}
    };

    var requestParams2 = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Steve',
        message: 'Just do something!'}
    };

    request(requestParams1, function(error, response, body) {
      // Now if we request the log, that message we posted should be there:
      request(requestParams2, function(error, response, body) {
        request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
          var messages = JSON.parse(body).results;
          expect(messages.length).to.equal(5);
          expect(messages[0].username).to.equal('Steve');
          expect(messages[1].username).to.equal('Jono');
          expect(messages[0].message).to.equal('Just do something!');
          expect(messages[1].message).to.equal('Do my bidding!');
          done();
        });
        
      });
    }); 
  });

  xit('should respond with different headers for different requests', function(done) {
    var requestParams = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jono',
        message: 'Do my bidding!'}
    };

    var postRequestHeader;
    var getRequestHeader;

    request(requestParams, function(error, response, body) {
      postRequestHeader = JSON.stringify(response.headers);

      request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
        getRequestHeader = JSON.stringify(response.headers);
        expect(postRequestHeader).to.not.equal(getRequestHeader);
        done();
        
      });
    });


  });

  it('should be able to handle DELETE request', function(done) {

    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      var messages = JSON.parse(body).results;
      expect(messages.length).to.equal(5);  
      expect(messages[0].username).to.equal('Steve');
      var idToDelete = JSON.parse(body).results[0].objectId;

      var requestParams = {method: 'DELETE',
        uri: 'http://127.0.0.1:3000/classes/messages' + '/' + idToDelete,
      };

      request(requestParams, function(error, response, body) {

        request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
          var messages = JSON.parse(body).results;
          expect(messages.length).to.equal(4);
          expect(messages[0].username).to.equal('Jono');
          done();
        });

      });

    });


  });




});
