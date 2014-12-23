var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
	name: {type: String, required: true}, 
	uid: {type: Number, required: true, unique: true},
	udi: {type: String, required: true, unique: true},
	secret: {type: String, required: true, unique: true}
});

module.exports = mongoose.model('User', UserSchema);
