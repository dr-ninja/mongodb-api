// Load required packages
var oauth2orize = require('oauth2orize');
var User = require('../models/user');
var Partner = require('../models/partner');
var Token = require('../models/token');
var Code = require('../models/code');

// Create OAuth 2.0 server
var server = oauth2orize.createServer();

// Register serialialization function
server.serializeClient(function(partner, callback) {
	return callback(null, partner._id);
});

// Register deserialization function
server.deserializeClient(function(id, callback) {
	Partner.findOne({ _id: id }, function (err, partner) {
		if (err) { return callback(err); }
		return callback(null, partner);
	});
});

// Register authorization code grant type
server.grant(oauth2orize.grant.code(function(partner, redirectUri, user, ares, callback) {
	// Create a new authorization code
	var code = new Code({
		value: uid(16),
		partnerId: partner._id,
		redirectUri: redirectUri,
		userId: user._id
	});

	// Save the auth code and check for errors
	code.save(function(err) {
		if (err) { return callback(err); }

		callback(null, code.value);
	});
}));

// Exchange authorization codes for access tokens
server.exchange(oauth2orize.exchange.code(function(partner, code, redirectUri, callback) {
	Code.findOne({ value: code }, function (err, authCode) {
		if (err) { return callback(err); }
		if (authCode === undefined) { return callback(null, false); }
		if (partner._id.toString() !== authCode.partnerId) { return callback(null, false); }
		if (redirectUri !== authCode.redirectUri) { return callback(null, false); }

		// Delete auth code now that it has been used
		authCode.remove(function (err) {
			if(err) { return callback(err); }

			// Create a new access token
			var token = new Token({
				value: uid(256),
				partnerId: authCode.partnerId,
				userId: authCode.userId
			});

			// Save the access token and check for errors
			token.save(function (err) {
				if (err) { return callback(err); }

				callback(null, token);
			});
		});
	});
}));

// User authorization endpoint
exports.authorization = [
	server.authorization(function(partnerId, redirectUri, callback) {

		Partner.findOne({ id: partnerId }, function (err, partner) {
			if (err) { return callback(err); }

			return callback(null, partner, redirectUri);
		});
	}),
	function(req, res){
		res.render('dialog', { transactionID: req.oauth2.transactionID, user: req.user, partner: req.oauth2.client });
	}
];

// User decision endpoint
exports.decision = [
	server.decision()
];

// Application partner token exchange endpoint
exports.token = [
	server.token(),
	server.errorHandler()
];

function uid (len) {
	var buf = []
		, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		, charlen = chars.length;

	for (var i = 0; i < len; ++i) {
		buf.push(chars[getRandomInt(0, charlen - 1)]);
	}

	return buf.join('');
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}