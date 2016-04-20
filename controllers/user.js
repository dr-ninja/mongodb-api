
var User = require('../models/user'),
	btoa = require('btoa');

exports.postUsers = function(req, res) {
	
	var user = new User({
		username: req.body.username,
		password: req.body.password
	});

	user.save(function(err) {
		if (err)
			res.send(err);
		else
			res.json({ message: 'New user added to db!' });
	});
};

exports.getUsers = function(req, res) {
	User.find(function(err, users) {
		if (err)
			res.send(err);

		res.json(users);
	}); 
};

exports.postLogin = function(req, res) {

	User.findOne({ username: req.body.username }, function (err, user) {
		if (err) { return callback(err); }

		// No user found with that username
		if (!user) { return callback(null, false); }

		// Make sure the password is correct
		user.verifyPassword(req.body.password, function(err, isMatch) {
			if (err) { return callback(err); }

			// Password did not match
			if (!isMatch) { res.json({ok: false, error: "password"}); }

			// Success
			res.json({ok: true, token: b64EncodeUnicode(req.body.username + ':' + req.body.password)});
		});
	});
};

function b64EncodeUnicode(str) {
	return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
		return String.fromCharCode('0x' + p1);
	}));
}
