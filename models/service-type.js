// Load required packages
var mongoose = require('mongoose');

// Define our client schema
var ServiceTypeSchema = new mongoose.Schema({
	_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
	name: {type: String, required: true},
	default_price: { type: Number, required: true },
	default_duration: { type: Number, required: true },
	cost: {type: Number, required: true}
});

// Export the Mongoose model
module.exports = mongoose.model('ServiceType', ServiceTypeSchema);