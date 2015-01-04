'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
    fs = require('fs'),
    mongoose = require('mongoose');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Initializing system variables
var config = require('./config/config');
var db     = mongoose.connect(config.db);

//Bootstrap models
var models_path = __dirname + '/app/models';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js|coffee)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            walk(newPath);
        }
    });
};
walk(models_path);

var app = express();

//express settings
require('./config/express')(app, db);

//Bootstrap routes
require('./config/routes')(app);

var http = require('http').Server(app);
var io = require('socket.io').listen(http);

var User = require('./app/models/user');
var Puzzle = require('./app/models/puzzle')
require('./game/game_matcher')();

io.sockets.on('connection', function (socket) {
  socket.on('LOGIN', function (data) {
    User.findOne({udi: data.udi}, function(err, doc) {
      if (err)
        socket.emit('LOGIN', err);
      else {
        if(doc !== null) {
          doc.socketid = socket.id;
          doc.status = 'idle';
          doc.opponent = '';
          doc.save();
          socket.emit('LOGIN', {user: 'Existed'});
        } else {
          socket.emit('LOGIN', {user: 'NotExisted'});
        }
      }
    });
  });

  socket.on('REGISTER', function (data) {
    var user = new User();
    User.count({}, function(err, count){
      user.name = data.name;
      user.uid = count;
      user.udi = data.udi;
      user.secret = Math.floor((Math.random() * 10000000) + 1);
      user.status = 'idle';
      user.socketid = socket.id;

      user.save(function(err) {
        if (err)
          socket.emit('REGISTER', err);
        else
          socket.emit('REGISTER', {user: 'UserCreated'});
      });
    });
  });

  socket.on('SEARCHOPPONENT', function (data) {
    User.findOneAndUpdate({udi: data.udi}, {status: 'searching'}, {new: true}, function(err, doc) {
      if (err)
        socket.emit('SEARCHOPPONENT', err);
    });
  });

  socket.on('WAITFORSTART', function (data) {
    User.findOne({udi: data.udi}, function(err, doc) {
      if (err)
        socket.emit('WAITFORSTART', err);
      else {
        if(doc.status === 'started') {
          socket.emit('WAITFORSTART', {status: 'started'});
        } else {
          socket.emit('WAITFORSTART', {status: 'searching'});
        }
      }
    });
  });

  socket.on('ONMAINMENU', function (data) {
    User.findOne({socketid: socket.id}, function(err, doc) {
      if (err)
        socket.emit('ONMAINMENU', err);
      else {
        doc.status = 'idle';
        doc.opponent = '';
        doc.save();
      }
    });
  });

  socket.on('UPDATEDATABASE', function (data) {
    for (var i = 0; i < data.length; i++) {
      var puzzle = new Puzzle();
      puzzle.a = data[i].Value.a;
      puzzle.b = data[i].Value.b;
      puzzle.c = data[i].Value.c;
      puzzle.d = data[i].Value.d;
      puzzle.save();
    }
  });

  socket.on('UPDATESCORE', function (data) {
    User.findOne({socketid: socket.id}, function(err, doc) {
      if (err)
        socket.emit('UPDATESCORE', err);
      else {
        doc.status = 'idle';
        doc.opponent = '';
        if(data.result === 'win') {
          doc.score += 100;
        } else {
          doc.score -= 100;
        }
        doc.save();
      }
    });
  });

  socket.on('FETCHPUZZLE', function (data) {
    User.findOne({socketid: socket.id}, function(err, doc) {
      if (err)
        socket.emit('FETCHPUZZLE', err);
      else {
        socket.emit('FETCHPUZZLE', doc.puzzle[0].remove());
        doc.save();
      }
    });
  });

  socket.on('OFFLINE', function (data) {
    User.findOne({socketid: socket.id}, function(err, doc) {
      if (err)
        socket.emit('OFFLINE', err);
      else {
        doc.status = 'offline';
        doc.opponent = '';
        doc.puzzle.remove({});
        doc.save();
      }
    });
  });
});

//Start the app by listening on <port>
var port = config.port;
//app.listen(port);
http.listen(port);
console.log('Express app started on port ' + port);

//expose app
exports = module.exports = app;
