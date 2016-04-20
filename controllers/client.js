var Client = require('../models/client');

exports.postClients = function(req, res) {
	
	var client = new Client();
	
	client.name = req.body.name;
	client.nif = req.body.nif;
	client.userId = req.user._id;
	client.phone = req.body.phone;
	client.email = req.body.email;
	client.facebook = req.body.facebook;
	client.address = req.body.address;
	client.birthday = new Date(req.body.birthday).toISOString();
	
	client.save(function(err) {
		if (err)
			res.send(err);
		else
			res.json(client);
	});
};

exports.getClients = function(req, res) {
	Client.find({ userId: req.user._id }, function(err, clients) {
		if (err)
			res.send(err);
		else
			res.json(clients);
	});
};

exports.getClient = function(req, res) {
	Client.find({ userId: req.user._id, _id: req.params.client_id }, function(err, client) {
		if (err || !client)
			res.json({});
		else
			res.json(client);
	});
};

exports.putClient = function(req, res) {
	
	if(req.body.birthday) {
		req.body.birthday = new Date(req.body.birthday).toISOString();
	}
	
	Client.update(
		{
			userId: req.user._id,
			_id: req.params.client_id
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

exports.deleteClient = function(req, res) {
	Client.remove({ userId: req.user._id, _id: req.params.client_id }, function(err) {
		if (err)
			res.send(err);
		else
			res.json({ message: 'Client removed from db!' });
	});
};


exports.getClientsCloseBirthdays = function(req, res) {


	Client.find({ userId: req.user._id, birthday: {'$gte': new Date(req.query.from), '$lt': new Date(req.query.to)}}, function(err, clients) {
		if (err)
			res.send(err);
		else {
			res.json(clients);
		}
			
	});
};