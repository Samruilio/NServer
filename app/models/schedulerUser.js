var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SchedulerUserSchema   = new Schema({
	name: {type: String, required: true}, 
	password: {type: String, required: true}, 
	authority: {type: String, required: true}, 
	sessionid: {type: String, required: false, default: ''}, 
	islogin: {type: String, required: true}
});

module.exports = mongoose.model('SchedulerUser', SchedulerUserSchema);
