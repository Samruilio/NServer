var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PuzzleSchema   = new Schema({
	a: {type: Number, required: true, unique: false, default: 0}, 
	b: {type: Number, required: true, unique: false, default: 0}, 
	c: {type: Number, required: true, unique: false, default: 0}, 
	d: {type: Number, required: true, unique: false, default: 0}
});

module.exports = mongoose.model('Puzzle', PuzzleSchema);