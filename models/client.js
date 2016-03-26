// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var ClientSchema   = new mongoose.Schema({
	name: String,
	nif: Number,
	userId: String
});

// Export the Mongoose model
module.exports = mongoose.model('Client', ClientSchema);