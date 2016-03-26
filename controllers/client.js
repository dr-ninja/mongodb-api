var Client = require('../models/client');

exports.postClients = function(req, res) {
	// Create a new instance of the Client model
	var client = new Client();

	// Set the client properties that came from the POST data
	client.name = req.body.name;
	client.nif = req.body.nif;
	client.userId = req.user._id;

	// Save the client and check for errors
	client.save(function(err) {
		if (err)
			res.send(err);
		else
			res.json({ message: 'Client added to db!', data: client });
	});
};

exports.getClients = function(req, res) {
	// Use the Client model to find all client
	Client.find({ userId: req.user._id }, function(err, clients) {
		if (err)
			res.send(err);
		else
			res.json(clients);
	});
};

exports.getClient = function(req, res) {
	// Use the Client model to find a specific client
	Client.find({ userId: req.user._id, _id: req.params.client_id }, function(err, client) {
		if (err || !client)
			res.json({message: 'Client not found', data: {}});
		else
			res.json(client);
	});
};

exports.putClient = function(req, res) {
	// Use the Client model to find a specific client
	Client.update(
		{
			userId: req.user._id,
			_id: req.params.client_id
		},
		{
			nif: req.body.nif
		},
		function(err, num, raw) {
			if (err)
				res.send(err);
			else
				res.json({ message: num + ' updated' });
		});
};

exports.deleteClient = function(req, res) {
	// Use the Client model to find a specific client and remove it
	Client.remove({ userId: req.user._id, _id: req.params.client_id }, function(err) {
		if (err)
			res.send(err);
		else
			res.json({ message: 'Client removed from db!' });
	});
};