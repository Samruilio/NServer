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
	app.post('/scheduler/userLogout', userLogout)
};

function deleteTask(req, res) {
	checkLogin(req, res);
	Task.findOneAndRemove({_id: req.body._id}, function(err, doc) {
		if (err)
			res.send({error: err});
		else {
			if(doc !== null) {
				res.send({task: doc});
			} else {
				res.send({error: 'Specified task does not exist!'});
			}
		}
	});
}

function modifyTask(req, res) {
	checkLogin(req, res);

}

function getTasks(req, res) {
	checkLogin(req, res);
	Task.find({}, function(err, docs) {
		if (err)
			res.send({error: err});
		else {
			if(docs !== null) {
				res.send({tasks: docs});
			} else {
				res.send({error: 'There is no task at this moment!'});
			}
		}
	});
}

function createTask(req, res) {
	checkLogin(req, res);
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

	task.save(function(err) {
		if (err)
			res.send({istaskcreated: 'false', error: err});
		else
			res.send({istaskcreated: 'true', task: task});
	});
}

function createUser(req, res) {
	var schedulerUser = new SchedulerUser();
	schedulerUser.name = req.body.username;
	schedulerUser.password = req.body.password;
	schedulerUser.authority = req.body.authority;
	schedulerUser.sessionid = '';
	schedulerUser.islogin = 'false';
	schedulerUser.save(function(err) {
		if (err)
			res.send({error: err});
		else
			res.send({user: schedulerUser});
	});
}

function userLogin(req, res) {
	console.log(req.sessionID.toString());
	SchedulerUser.findOne({name: req.body.username, password: req.body.password}, function(err, doc) {
		if(err) {
			res.send({error: err});
		} else {
			if(doc !== null) {
				doc.sessionid = req.sessionID;
				doc.islogin = 'true';
				doc.save();

				res.send({islogin: 'true'});
			} else {
				res.send({islogin: 'false'});
			}
		}
	});
}

function userLogout(req, res) {
	console.log(req.sessionID);
	SchedulerUser.findOne({sessionid: req.sessionID}, function(err, doc) {
		if (err)
			res.send({error: err});
		else {
			if(doc !== null) {
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

function checkLogin(req, res) {
	console.log(req.sessionID);
	SchedulerUser.findOne({sessionid: req.sessionID}, function(err, doc) {
		if (err)
			res.send({error: err});
		else {
			if(doc !== null) {
				if(doc.islogin === 'true') {
					console.log('true');
					return true;
				} else {
					console.log('true');
					return false;
				}
			} else {
				console.log('true');
				return false;
			}
		}
	});
}