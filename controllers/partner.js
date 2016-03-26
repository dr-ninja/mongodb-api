// Load required packages
var Partner = require('../models/partner');

// Create endpoint /api/partner for POST
exports.postPartners = function(req, res) {
	// Create a new instance of the Partner model
	var partner = new Partner();

	// Set the partner properties that came from the POST data
	partner.name = req.body.name;
	partner.id = req.body.id;
	partner.secret = req.body.secret;
	partner.userId = req.user._id;

	// Save the partner and check for errors
	partner.save(function(err) {
		if (err)
			res.send(err);

		res.json({ message: 'Partner added to db!', data: partner });
	});
};

// Create endpoint /api/partners for GET
exports.getPartners = function(req, res) {
	// Use the Partner model to find all partners
	Partner.find({ userId: req.user._id }, function(err, partners) {
		if (err)
			res.send(err);

		res.json(partners);
	});
};