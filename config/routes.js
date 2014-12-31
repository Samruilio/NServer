var async = require('async');

module.exports = function(app) {

    //Home route
    var index = require('../app/controllers/index');
    app.get('/', index.render);

    var User = require('../app/models/user')

    app.get('/api/users', function(req, res){
    	User.find(function(err, users) {
    		if (err)
    			res.send(err);
    		else
    			res.json(users);
    	});
    });

    app.get('/api/users/searching/:udi', function(req, res){
        User.findOneAndUpdate({udi: req.params.udi, opponent: ''}, {status: 'searching'}, {new: true}, function(err, doc) {
            if (err)
                res.send(err);
            else {
                User.where('status').equals('searching').where('udi').ne(req.params.udi).exec(function(err, doc) {
                    if (err)
                        res.send(err);
                    else
                        res.json(doc);
                });
            }
        });
    });

    app.get('/api/users/:uid', function(req, res){
    	User.find({uid: req.params.uid}, function(err, users) {
    		if (err)
    			res.send(err);
    		else
    			res.json(users);
    	});
    });

    app.get('/api/users/checkready/:udi', function(req, res) {
        User.find({udi: req.params.udi}, function(err, user) {
            if (err)
                res.send(err);
            else
                res.json(user);
        });
    });

    app.post('/api/users/create', function(req, res){
    	var user = new User();
    	User.count({}, function(err, count){
    		user.name = req.body.name;
    		user.uid = count;
    		user.udi = req.body.udi;
    		user.secret = Math.floor((Math.random() * 10000000) + 1);
            user.status = 'idle';

    		user.save(function(err) {
    			if (err)
    				res.status(11000).send(err);
    			else
    				res.json({ message: 'User has been created!', data: user });
    		});
    	});
    });

    app.post('/api/users/delete', function(req, res){
        User.remove({}, function(err, users) {
            if (err)
                res.send(err);
            else
                res.json(users);
        });
    });

    app.post('/api/users/delete/:uid', function(req, res){
        User.findOneAndRemove({uid: req.params.uid}, function(err, doc) {
            if (err)
                res.send(err);
            else
                res.json(doc);
        });
    });

    app.post('/api/users/set_opponent', function(req, res) {
        User.findOneAndUpdate({uid: req.body.sel_uid}, {opponent: req.body.opp_uid, status: 'ready'}, {new: true}, function(err, doc) {
            if (err)
                res.send(err);
            else {
                User.findOneAndUpdate({uid: req.body.opp_uid}, {opponent: req.body.sel_uid, status: 'ready'}, {new: true}, function(err, doc) {
                    if (err)
                        res.send(err);
                    else {
                        res.json({message: 'wait for accepting'});
                    }
                });
            }
        });
    });

    app.post('/api/users/score', function(req, res) {
        User.find({udi: req.body.udi}, function(err, users) {
            if (err)
                res.send(err);
            else {
                if(req.body.result == 'win'){
                    users[0].score += 100;
                }else if(req.body.result == 'lose'){
                    users[0].score -= 100;
                }
                User.findOneAndUpdate({udi: req.body.udi}, {score: users[0].score, opponent: '', status: 'idle'}, {new: true}, function(err, doc) {
                    if (err)
                        res.send(err);
                    else {
                        res.json({message: 'succeed'});
                    }
                });
            }
        });
    });
};