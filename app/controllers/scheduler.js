'use strict';

var SchedulerUser = require('../models/schedulerUser');
var Task = require('../models/task');

module.exports = function notifier(app) {
	app.post('/scheduler/createUser', createUser);
	app.post('/scheduler/userLogin', userLogin);
	app.post('/scheduler/createTask', createTask);
	app.post('/scheduler/tasks', getTasks);
	app.post('/scheduler/deleteTask', deleteTask);
	app.post('/scheduler/modifyTask', modifyTask);
	app.post('/scheduler/userLogout', userLogout);
	app.post('/scheduler/clearSession', clearSession);
};

function clearSession(req, res) {
	req.session.destroy();
}

function deleteTask(req, res) {
	SchedulerUser.findOne({sessionid: req.sessionID}, function(err, doc) {
		if (err)
			res.send({error: err});
		else {
			if(doc !== null) {
				var task = doc.tasks.pull(req.body._id);
				doc.save(function(err) {
					if (err)
						res.send({error: err});
					else
						res.send({task: task});
				});
			} else {
				res.send({error: 'Specified task does not exist!'});
			}
		}
	});
}

function modifyTask(req, res) {
}

function getTasks(req, res) {
	SchedulerUser.findOne({sessionid: req.sessionID}, function(err, doc) {
		if (err)
			res.send({error: err});
		else {
			if(doc !== null) {
				res.send({tasks: doc.tasks});
			} else {
				res.send({error: 'There is no task at this moment!'});
			}
		}
	});
}

function createTask(req, res) {
	SchedulerUser.findOne({sessionid: req.sessionID}, function(err, user) {
		if (err)
			res.send({error: err});
		else {
			if(user !== null) {
				if(user.islogin === 'true') {
					var task = new Task();
					task.name = req.body.name;
					task.creator = req.body.creator;
					task.createtime = req.body.createtime;
					task.starttime = req.body.starttime;
					task.repeat = req.body.repeat;
					task.completed = 'false';
					task.completetime = '';
					task.accountname = req.body.accountname;
					task.accountpass = req.body.accountpass;
					task.accountaddr = req.body.accountaddr;
					task.exporttype = req.body.exporttype;
					task.debtor = req.body.debtor;
					task.datetype = req.body.datetype;
					task.startdate = req.body.startdate;
					task.enddate = req.body.enddate;
					task.segmenttype = req.body.segmenttype;
					task.emailto = req.body.emailto;
					task.exportemailto = req.body.exportemailto;

					user.tasks.push(task);

					user.save(function(err) {
						if (err)
							res.send({istaskcreated: 'false', error: err});
						else
							res.send({istaskcreated: 'true', task: task});
					});
				} else {
					res.send({islogin: 'false'});
				}
			} else {
				res.send({islogin: 'false'});
			}
		}
	});
}

function createUser(req, res) {
	var schedulerUser = new SchedulerUser();
	schedulerUser.name = req.body.username;
	schedulerUser.password = req.body.password;
	schedulerUser.authority = req.body.authority;
	schedulerUser.sessionid = req.sessionID;
	schedulerUser.islogin = 'false';
	schedulerUser.notifier = 'none';
	schedulerUser.save(function(err) {
		if (err) {
			req.session.destroy();
			res.send({error: err});
		} else {
			req.session.destroy();
			res.send({user: schedulerUser});
		}
	});
}

function userLogin(req, res) {
	SchedulerUser.findOne({name: req.body.username, password: req.body.password}, function(err, doc) {
		if(err) {
			res.send({error: err});
		} else {
			if(doc !== null) {
				doc.sessionid = req.sessionID;
				doc.islogin = 'true';
				doc.save(function(err) {
					if (err) {
						req.session.destroy();
						res.send({islogin: 'false', error: err});
					} else {
						res.send({islogin: 'true'});
					}
				});
			} else {
				res.send({islogin: 'false'});
			}
		}
	});
}

function userLogout(req, res) {
	SchedulerUser.findOne({sessionid: req.sessionID}, function(err, doc) {
		if (err)
			res.send({error: err});
		else {
			if(doc !== null) {
				req.session.destroy();
				doc.islogin = 'false';
				doc.save(function(err) {
					if (err)
						res.send({error: err});
					else {
						res.send({islogin: 'false'});
					}
				});
			} else {
				res.send({islogin: 'false'});
			}
		}
	});
}