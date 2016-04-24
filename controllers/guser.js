var Guser = require('../models/guser');

exports.postGuser = function(req, res, user, token, callback) {
	var _user = new Guser();

	_user.name = user.displayName;
	_user.email = user.emails[0].value;
	_user.gender = user.gender;
	_user.g_id = user.id;
	_user.g_page = user.url;
	_user.image = user.image;
	_user.credentials = token;

	_user.save(function(err) {
		if (err) { return callback(err); }
		return callback(null, _user);
	});
};

// Get user by access token
exports.getGuser = function(access_token, callback) {
	Guser.findOne({ 'credentials.access_token': access_token}, function(err, _user) {
		if (err || !_user) { return callback(err); }
		return callback(null, _user);
	});
};

// Get user by google id
exports.getGuserById = function(gid, callback) {
	Guser.findOne({ 'g_id': gid}, function(err, _user) {
		if (err || !_user) { return callback(err); }
		return callback(null, _user);
	});
};

// Updates user credentials
exports.updateGuserToken = function(user, oauthCredentials, callback) {
	Guser.update({_id: user._id}, {credentials: oauthCredentials}, function(err, num) {
		if (err) { return callback(err); }
		return callback(null, num);
	});
};

// Util to build an authorization header
exports.getAuthorizationHeader = function(credentials) {
	return credentials.token_type + " " + credentials.access_token;
};


/*
exports.deleteGuser = function(req, res) {
	Guser.remove({ userId: req.user._id, _id: req.params.guser_id }, function(err) {
		if (err)
			res.send(err);
		else
			res.json({ message: 'Guser removed from db!' });
	});
};
*/
