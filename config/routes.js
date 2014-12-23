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

    app.get('/api/users/:uid', function(req, res){
    	User.find({uid: req.params.uid}, function(err, users) {
    		if (err)
    			res.send(err);
    		else
    			res.json(users);
    	});
    });

    app.post('/api/users/create', function(req, res){
    	var user = new User();
    	User.count({}, function(err, count){
    		user.name = req.body.name;
    		user.uid = count;
    		user.udi = req.body.udi;
    		user.secret = Math.floor((Math.random() * 10000000) + 1); 

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
};