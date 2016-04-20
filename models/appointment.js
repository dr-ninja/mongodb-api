// Load required packages
var mongoose = require('mongoose');

// Define our client schema
var AppointmentSchema = new mongoose.Schema({
	_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
	_client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
	_services: [{
		_service_type: {type: mongoose.Schema.Types.ObjectId, ref: 'ServiceType', required: true},
		price: { type: String },
		duration: { type: Number },
		obs: { type: String }
	}
	],
	date: { type: Date, required: true },
	invoice: {type: Boolean, default: false },
	monthly_invoice: {type: Boolean, default: false },
	in_finantial_system: {type: Boolean, default: false },
	in_system: {type: Boolean, default: true },
	location: {type: String, default: "Lab", enum : ['Lab', 'Dom'], required: true},
	cancelled: {type: Boolean, default: false},
	obs: {type: String}
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Export the Mongoose model
module.exports = mongoose.model('Appointment', AppointmentSchema);