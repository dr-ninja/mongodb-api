// Load required packages
var cors = require('cors');
var restify = require('restify');
var moment = require('moment');
var mongoose = require('mongoose');


// Load controllers
var authController = require('./controllers/auth');
var clientsController = require('./controllers/client');
var sTypesController = require('./controllers/service-type');

var options = {server:{auto_reconnect:true,socketOption:{keepAlive:true}}};
var opts = {
	replset: {
		strategy: 'ping',
		rs_name: 'somerepsetname',
		readSecondary: true,
		socketOptions : {
			keepAlive : 1
		}
	},
	server : {
		readPreference : 'secondary',
		auto_reconnect: true,
		socketOptions : {
			keepAlive : 1
		}
	},
	db: { readPreference: 'secondary' }
};
var mongodbUri = process.env.MONGODBURL;
var conn = mongoose.connection;
conn.on('disconnected', function() {
	console.log('Connection to MongoDB is down');
	setTimeout(function() {
		console.log("will connect again...hopefully");
		mongoose.connect(mongodbUri, opts);
	},2000)
});

conn.on('error', function(err) {
	console.log("ON_ERROR", err);
	if(conn.readyState) mongoose.connection.disconnect()
});

exports.dbConn = conn;

mongoose.connect(mongodbUri, opts);

// Create restify server
var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.authorizationParser());
// Configure CORS
server.use(restify.CORS({
	origins: [process.env.GOOGLE_APP_URL_CALLBACK],
	methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
	headers: ['X-Requested-With', 'content-type', 'Authorization', 'Retry-After', "retry"],
	credentials: true
}));

// Deal with OPTIONS requests
server.opts(/.*/, function (req,res,next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", req.header("Access-Control-Request-Method"));
	res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
	res.send(200);
	return next();
});



// ROUTES
server.get('/error-handling', function(req, res){
	res.json(401, {error: "No authorization header found"})
});

server.get('/retry-handling', function(req, res) {
	console.log("retry sent");
	res.setHeader("Retry-After", 5000);

	res.json(503, {error: "No authorization header found"})
});


server.post('/auth/google', authController.signIn, function(req, res) {
	req._credentials = req._credentials.toObject();
	delete req._credentials["refresh_token"];
	res.json(req._credentials);
});

server.get('/get-user', authController.isAuthenticated, function(req, res) {
	req.user = req.user.toObject();
	delete req.user["credentials"];
	req.user ? res.json(req.user) : res.json({ok: 0, error : "No user registered in db"});
});

server.get('/clients', authController.isAuthenticated, clientsController.getClients);
server.post('/clients', authController.isAuthenticated, clientsController.postClients);
server.get('/clients/:client_id', authController.isAuthenticated, clientsController.getClient);
server.put('/clients/:client_id', authController.isAuthenticated, clientsController.putClient);
server.del('/clients/:client_id', authController.isAuthenticated, clientsController.deleteClient);

server.get('/stypes', authController.isAuthenticated, sTypesController.getServiceTypes);
server.post('/stypes', authController.isAuthenticated, sTypesController.postServiceTypes);
server.get('/stypes/:service_type_id', authController.isAuthenticated, sTypesController.getServiceType);
server.put('/stypes/:service_type_id', authController.isAuthenticated, sTypesController.putServiceType);
server.del('/stypes/:service_type_id', authController.isAuthenticated, sTypesController.deleteServiceType);

var port = process.env.PORT || 5000;
server.listen(port);
console.log('Server running on port ' + port);



/*app.get('/api/calendars', isAuthenticated, function(req, res) {

	if(req && req.user) {
		gcal(req.user.credentials.access_token).calendarList.list(function(err, data) {
			if(err) return res.send(500,err);
			return res.send(data);
		});
	} else {
		res.send(500, {ok: 0, message: "No user found"});
	}

});

app.all('/cals/:calendarId', function(req, res){

	if(!req.session.access_token) return res.redirect('/cals/auth');

	//Create an instance from accessToken
	var accessToken     = req.session.access_token;
	var calendarId      = req.params.calendarId;

	gcal(accessToken).events.list(calendarId, {maxResults:1}, function(err, data) {
		if(err) return res.status(500).send(err);

		console.log(data);
		if(data.nextPageToken){
			gcal(accessToken).events.list(calendarId, {maxResults:1, pageToken:data.nextPageToken}, function(err, data) {
				console.log(data.items)
			})
		}


		return res.send(data);
	});
});

app.all('cals/:calendarId/:eventId', function(req, res){

	if(!req.session.access_token) return res.redirect('/cals/auth');

	//Create an instance from accessToken
	var accessToken     = req.session.access_token;
	var calendarId      = req.params.calendarId;
	var eventId         = req.params.eventId;

	gcal(accessToken).events.get(calendarId, eventId, function(err, data) {
		if(err) return res.send(500,err);
		return res.send(data);
	});
});

app.all('/:calendarId/new', function(req, res){

	if(!req.session.access_token) return res.redirect('/cals/auth');

	//Create an instance from accessToken
	var accessToken     = req.session.access_token;
	var calendarId      = req.params.calendarId;
	var event = {
		'summary': 'Google I/O 2015',
		'location': '800 Howard St., San Francisco, CA 94103',
		'description': 'A chance to hear more about Google\'s developer products.',
		'start': {
			'dateTime': '2016-04-16T09:00:00-07:00',
			'timeZone': 'America/Los_Angeles'
		},
		'end': {
			'dateTime': '2016-04-16T17:00:00-07:00',
			'timeZone': 'America/Los_Angeles'
		},
		'recurrence': [
			'RRULE:FREQ=DAILY;COUNT=2'
		],
		'attendees': [
			{'email': 'lpage@example.com'},
			{'email': 'sbrin@example.com'}
		],
		'reminders': {
			'useDefault': false,
			'overrides': [
				{'method': 'email', 'minutes': 24 * 60},
				{'method': 'popup', 'minutes': 10}
			]
		}
	};

	gcal(accessToken).events.insert(calendarId, event, function(err, data) {
		if(err) return res.status(500).send(err);
		return res.send(data);
	});
});*/
