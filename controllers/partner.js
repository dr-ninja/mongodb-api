var Partner = require('../models/partner');


exports.postPartners = function(req, res) {
	
	var partner = new Partner();
	
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

exports.getPartners = function(req, res) {
	Partner.find({ userId: req.user._id }, function(err, partners) {
		if (err)
			res.send(err);

		res.json(partners);
	});
};