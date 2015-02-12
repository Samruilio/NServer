var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var Puzzle = require('./puzzle');

var UserSchema   = new Schema({
	name: {type: String, required: true}, 
	uid: {type: Number, required: true, unique: true},
	udi: {type: String, required: true, unique: true},
	secret: {type: String, required: true, unique: true}, 
	status: {type: String, required: true, unique: false, default: 'idle'}, 
	opponent: {type: String, unique: false, default: ''}, 
	score: {type: Number, unique: false, default: 1000},
	socketid: {type: String, required: true, unique: true}, 
	bindaccount: {type: String, required: true, default: ''}, 
	fbid: {type: String, required: false}, 
	puzzle: {type: [Puzzle.schema]}, 
});

module.exports = mongoose.model('User', UserSchema);
