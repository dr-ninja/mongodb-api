var google = require('googleapis');
var plus = google.plus('v1');
var googleAuth = require('google-auth-library');
var guserController = require('./guser');
var server = require('../server');

var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(
	process.env.GOOGLE_APP_ID, process.env.GOOGLE_APP_SECRET, process.env.GOOGLE_APP_URL_CALLBACK);


exports.oauth2Client = oauth2Client;

exports.signIn = function (req, res, next) {

	oauth2Client.getToken(req.body.code, function(err, token) {
		if (err) {
			console.log('Error while trying to retrieve access token', err);
			return;
		}
		oauth2Client.credentials = token;

		plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, guser) {
			if (guser) {
				guserController.getGuserById(guser.id, function(err, dbUser) {
					if(dbUser) {
						var credentials = dbUser.credentials;
						credentials.access_token = token.access_token;
						credentials.expiry_date = token.expiry_date;
						credentials.id_token = token.id_token;

						guserController.updateGuserToken(dbUser, credentials, function (err) {
							if(!err) {
								oauth2Client.credentials = {};
								req._credentials = credentials;
								return next();
							} else {
								res.redirect(401, '/error-handling', next);
							}
						});
					} else {
						guserController.postGuser(req, res, guser, token, function(err, user) {
							if(!err && user) {
								oauth2Client.credentials = {};
								req._credentials = user.credentials;
								return next();
							} else {
								res.redirect(401, '/error-handling', next);
							}
						});
					}
				});
			} else {
				res.redirect(401, '/error-handling', next);
			}
		});
	});
};

exports.isAuthenticated = function (req, res, next) {
	// Check if request has an authorization header
	if(req.authorization && req.authorization.scheme == 'Bearer' && req.authorization.credentials) {

		console.log("00000", server.dbConn.readyState);
		// Get user from db
		guserController.getGuser(req.authorization.credentials, function(err, guser) {
			// User found
			if(guser) {
				// Refresh access_token
				oauth2Client.credentials = guser.credentials;

				oauth2Client.getRequestMetadata("", function(err) {
					// access_token is now refreshed and credentials stored in oauth2Client
					if(!err) {
						guserController.updateGuserToken(guser, oauth2Client.credentials, function (err) {

							req.user = (!err) ? guser : {};
							res.setHeader("Authorization", guserController.getAuthorizationHeader(oauth2Client.credentials));
							oauth2Client.credentials = {};
							return next();
						});
					} else {
						console.log("11111", err);
						console.log(server.dbConn.readyState);
						res.redirect(401, '/error-handling', next);
					}
				});
			} else {
				console.log("22222", err);

				// TODO: reconnect to db and call isAuthenticated again
				/*
				* [MongoError: server ds041693-a.mlab.com:41693 sockets closed]
				 name: 'MongoError',
				 message: 'server ds041693-a.mlab.com:41693 sockets closed' }
				 */
				console.log(server.dbConn.readyState); // = 1 ERROR IN MONGOOSE
				res.redirect(401, '/error-handling', next);
			}
		});
	} else {
		console.log("33333");
		console.log(server.dbConn.readyState);
		// Request doesn't have an authorization header
		res.redirect(401, '/error-handling', next);
	}
};