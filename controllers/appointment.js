var Appointment = require('../models/appointment');

exports.getAppointments = function(req, res) {
	Appointment.find({ _user: req.user._id }).populate(['_client', {
			path: '_services',
			populate: {
				path: '_service_type',
				model: 'ServiceType'
			}
		}])
		.exec(function (err, appointments) {
			if(err)
				res.send(err);
			else
				res.json(appointments);
		});
};

exports.getClientAppointments = function(req, res) {
	Appointment.find({ _user: req.user._id, _client: req.params.client_id }, function(err, appointments) {
		if (err)
			res.send(err);

		res.json(appointments);
	});
};

exports.postClientAppointment = function(req, res) {

	var appointment = new Appointment();

	appointment._user = req.user._id;
	appointment._client = req.params.client_id;

	appointment.date = new Date(req.body.date).toISOString();
	appointment.invoice = req.body.invoice;
	appointment.monthly_invoice = req.body.monthly_invoice;
	appointment.in_finantial_system = req.body.in_finantial_system;
	appointment.in_system = req.body.in_system;
	appointment.location = req.body.location;
	appointment.cancelled = req.body.cancelled;
	appointment.obs = req.body.obs;
	appointment._services = req.body._services;

	appointment.save(function(err) {
		if (err)
			res.send(err);
		else
			res.json(appointment);
	});
};

exports.putClientAppointment = function(req, res) {

	if(req.body.date) {
		req.body.date = new Date(req.body.date).toISOString();
	}

	Appointment.update(
		{
			_user: req.user._id,
			_client: req.params.client_id,
			_id: req.params.appointment_id
		},
		{
			$set : req.body
		},
		function(err, num) {
			if (err)
				res.send(err);
			else
				res.json(num);
		});
};

exports.deleteClientAppointment = function(req, res) {
	Appointment.remove({ _user: req.user._id, _client: req.params.client_id, _id: req.params.appointment_id }, function(err) {
		if (err)
			res.send(err);
		else
			res.json({ message: 'Appointment removed from db!' });
	});
};
