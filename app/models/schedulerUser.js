var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var Task = require('./task');

var SchedulerUserSchema   = new Schema({
	name: {type: String, required: true, unique: true}, 
	password: {type: String, required: true}, 
	authority: {type: String, required: true}, 
	sessionid: {type: String, required: true, unique: true}, 
	islogin: {type: String, required: true}, 
	tasks: {type: [Task.schema]}, 
	notifier: {type: String, required: true}
});

module.exports = mongoose.model('SchedulerUser', SchedulerUserSchema);
