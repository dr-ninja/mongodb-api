var mongoose = require('mongoose');

var GuserSchema = new mongoose.Schema({
	name: String,
	email: String,
	gender: String,
	g_id: { type: String, unique: true },
	g_page: String,
	image: {
		url: String,
		isDefault: Boolean
	},
	credentials: {
		access_token: String,
		token_type: String,
		id_token: String,
		refresh_token: String,
		expiry_date: Number
	}
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Guser', GuserSchema);