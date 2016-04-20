var ServiceType = require('../models/service-type');

exports.postServiceTypes = function(req, res) {
	var serviceType = new ServiceType();

	serviceType._user = req.user._id;
	serviceType.name = req.body.name;
	serviceType.default_price = req.body.default_price;
	serviceType.default_duration = req.body.default_duration;
	serviceType.cost = req.body.cost;
	
	serviceType.save(function(err) {
		if (err)
			res.send(err);
		else
			res.json(serviceType);
	});
};

exports.getServiceTypes = function(req, res) {
	ServiceType.find({ _user: req.user._id }, function(err, stypes) {
		if (err)
			res.send(err);
		else
			res.json(stypes);
	});
};

exports.getServiceType = function(req, res) {
	ServiceType.find({ _user: req.user._id, _id: req.params.service_type_id }, function(err, stype) {
		if (err || !stype)
			res.json({});
		else
			res.json(stype);
	});
};

exports.putServiceType = function(req, res) {
	ServiceType.update(
		{
			_user: req.user._id,
			_id: req.params.service_type_id
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

exports.deleteServiceType = function(req, res) {
	ServiceType.remove({ _user: req.user._id, _id: req.params.service_type_id }, function(err) {
		if (err)
			res.send(err);
		else
			res.json({ message: 'ServiceType removed from db!' });
	});
};