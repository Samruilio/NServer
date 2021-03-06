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
var Puzzle = require('./app/models/puzzle');
require('./game/game_matcher')();
//require('./test/notifier')();
//require('./test/notifierAssigner')();
require('./test/mailinServer')();

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
          socket.emit('LOGIN', {user: 'Existed', bindaccount: doc.bindaccount});
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

      if(data.fbid !== null && data.fbid !== '') {
        user.bindaccount = 'Facebook';
        user.fbid = data.fbid;
      } else {
        user.bindaccount = '';
      }

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

  socket.on('FETCHRANK', function (data) {
    User.find({}).select({name: 1, uid: 1, score: 1, _id: 0}).sort({score: -1, uid: 1}).limit(10).exec(function(err, docs) {
      if (err)
        socket.emit('FETCHRANK', err);
      else
        socket.emit('FETCHRANK', {array: docs});
    });
  });

  socket.on('SEARCHRANK', function (data) {
    var condition;
    if(data !== null && data !== '') {
      condition = {uid: data.uid};
    } else {
      condition = {socketid: socket.id};
    }
    User.findOne(condition, function(err, doc) {
      if (err)
        socket.emit('SEARCHRANK', err);
      else {
        if(doc === null) {
          socket.emit('SEARCHRANK', null);
        } else {
          User.find({}).gte('score', doc.score).lt('uid', doc.uid).count({}, function(err, count) {
            if (err)
              socket.emit('SEARCHRANK', err);
            else {
              console.log(count);
              socket.emit('SEARCHRANK', {name: doc.name, uid: doc.uid, score: doc.score, rank: count});
            }
          });
        }
      }
    });
  });

  socket.on('disconnect', function (data) {
    User.findOne({socketid: socket.id}, function(err, doc) {
      if (err)
        socket.emit('disconnect', err);
      else {
        if(doc !== null) {
          doc.status = 'offline';
          doc.opponent = '';
          doc.puzzle.forEach( function (puzzle) {
            puzzle.remove();
          });
          doc.save();
        }
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
