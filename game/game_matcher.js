var User = require('../app/models/user');
var Puzzle = require('../app/models/puzzle');

module.exports = function match() {
	User.find({status: 'searching'}, function(err, users) {
		if (err)
			console.log(err);
		else {
			if(users.length >= 2) {
				var idx_ = Math.floor(Math.random() * users.length);
				while(true) {
					var idx__ = Math.floor(Math.random() * users.length);
					if(idx_ !==  idx__)
						break;
				}
				Puzzle.count({}, function(err, count){
					if (err)
						console.log(err);
					else {
						var idx = Math.floor(Math.random() * count);
						Puzzle.findOne().skip(idx).exec(function(err, doc) {
							users[idx_].puzzle.push(doc);
							users[idx__].puzzle.push(doc);

							users[idx_].status = 'started';
							users[idx_].opponent = users[idx__].uid;
							users[idx_].save();
							users[idx__].status = 'started';
							users[idx__].opponent = users[idx_].uid;
							users[idx__].save();
							console.log('game ' + users[idx_].name + ' VS ' + users[idx__].name + ' started');
						});
					}
				});
			}
		}
	});
	setTimeout(match, 1000);
};