var mongoose = require('mongoose');

var ClientSchema = new mongoose.Schema({
	name: String,
	nif: Number,
	phone: Number,
	email: String,
	facebook: String,
	address: String,
	birthday: Date,
	userId: String
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Client', ClientSchema);