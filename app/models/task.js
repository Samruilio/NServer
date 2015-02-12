var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TaskSchema   = new Schema({
	name: {type: String, required: true}, 
	creator: {type: String, required: true}, 
	createtime: {type: String, required: true}, 
	starttime: {type: String, required: true}, 
	repeat: {type: String, required: true}, 
	completed: {type: String, required: true}, 
	completetime: {type: String, required: false, default: ''}, 
	failurecount: {type: Number, required: false, default: 0}, 

	accountname: {type: String, required: true}, 
	accountpass: {type: String, required: true}, 
	accountaddr: {type: String, required: true}, 

	exporttype: {type: String, required: true}, 
	debtor: {type: String, required: false, default: ''}, 
	datetype: {type: String, required: true}, 
	startdate: {type: String, required: true}, 
	enddate: {type: String, required: true}, 
	segmenttype: {type: String, required: true}, 
	emailto: {type: String, required: true}, 
	exportemailto: {type: String, required: true}
});

module.exports = mongoose.model('Task', TaskSchema);
