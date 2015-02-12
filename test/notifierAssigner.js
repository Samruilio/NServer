var Notifier = require('./notifier');
var SchedulerUser = require('../app/models/schedulerUser');
var initialize = true;

module.exports = function notifierAssigner() {
	SchedulerUser.find({}, function(err, users) {
		for (var i = 0; i < users.length; i++){
			if(users[i].notifier === 'none' || initialize) {
				users[i].notifier = 'assigned';
				Notifier(users[i]._id);
				users[i].save(function(err) {
					if (err)
						console.log(err);
					else
						console.log('notifier assigned!');
				});
			}
		}
		initialize = false;
	});
	setTimeout(notifierAssigner, 5000);
};