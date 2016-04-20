// Load required packages
var express = require('express');
var cors = require('cors');
var ejs = require('ejs');
var session = require('express-session');
var moment = require('moment');

var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var oauth2Controller = require('./controllers/oauth2');
//var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var gcal = require('./google-calendar');

var authController = require('./controllers/auth');
var clientController = require('./controllers/client');
var userController = require('./controllers/user');
var partnerController = require('./controllers/partner');
var appointmentController = require('./controllers/appointment');
var serviceTypeController = require('./controllers/service-type');

var google = require('googleapis');
var googleAuth = require('google-auth-library');

var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(
	process.env.GOOGLE_APP_ID, process.env.GOOGLE_APP_SECRET, process.env.GOOGLE_APP_URL_CALLBACK);

// Connect to the server-api MongoDB
mongoose.connect(process.env.MONGODBURL);


// Create our Express application
var app = express();

// Set view engine to ejs
app.set('view engine', 'ejs');

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Use express session support since OAuth2orize requires it
app.use(session({
	secret: 'Super Secret Session Key',
	saveUninitialized: true,
	resave: true
}));

// Use the passport package in our application
app.use(passport.initialize());

//app.use(cors()); // TODO: must uncomment this line

// Add headers
app.use(function (req, res, next) {

	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', process.env.GOOGLE_APP_URL_CALLBACK);

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);

	// Pass to next layer of middleware
	next();
});

app.post('/api/auth/google', function(req, res){
	console.log(req.body);

	oauth2Client.getToken(req.body.code, function(err, token) {
		if (err) {
			console.log('Error while trying to retrieve access token', err);
			return;
		}
		oauth2Client.credentials = token;
		console.log("SENT:", token);
		res.json(token);
	});

});
app.get('/api/cals', function(req, res){
	var token = null;
	if (req.headers && req.headers.authorization) {
		var parts = req.headers.authorization.split(' ');
		if (parts.length == 2) {
			var scheme = parts[0]
				, credentials = parts[1];

			if (/^Bearer$/i.test(scheme)) {
				token = credentials;
			}
		} else {
			return this.fail(400);
		}
	}

	console.log(token);

	gcal(token).calendarList.list(function(err, data) {
		if(err) return res.send(500,err);
		return res.send(data);
	});
});
/*
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




// Use environment defined port or 5000
var port = process.env.PORT || 5000;

// Create our Express router
var router = express.Router();

// http://localhost:5000/api
router.get('/', function(req, res) {
	res.json({ message: 'This API is working!!!' });
});

// Create endpoint handlers for oauth2 authorize
router.route('/oauth2/authorize')
	.get(authController.isAuthenticated, oauth2Controller.authorization)
	.post(authController.isAuthenticated, oauth2Controller.decision);

// Create endpoint handlers for oauth2 token
router.route('/oauth2/token')
	.post(authController.isPartnerAuthenticated, oauth2Controller.token);

// Create endpoint handlers for /partners
router.route('/partners')
	.post(authController.isAuthenticated, partnerController.postPartners)
	.get(authController.isAuthenticated, partnerController.getPartners);

// Create endpoint handlers for /users
router.route('/users')
	.post(userController.postUsers)
	.get(authController.isAuthenticated, userController.getUsers);

// Create endpoint handlers for /login
router.route('/login')
	.post(userController.postLogin);

// Create endpoint handlers for /clients
router.route('/clients')
	.post(authController.isAuthenticated, clientController.postClients)
	.get(authController.isAuthenticated, clientController.getClients);

router.route('/clients/birthdays/')
	.get(authController.isAuthenticated, clientController.getClientsCloseBirthdays);


// Create endpoint handlers for /clients/:client_id
router.route('/clients/:client_id')
	.get(authController.isAuthenticated, clientController.getClient)
	.put(authController.isAuthenticated, clientController.putClient)
	.delete(authController.isAuthenticated, clientController.deleteClient);

// Create endpoint handlers for /clients/:client_id/appointments
router.route('/clients/:client_id/appointments')
	.get(authController.isAuthenticated, appointmentController.getClientAppointments)
	.post(authController.isAuthenticated, appointmentController.postClientAppointment);

// Create endpoint handlers for /clients/appointments
router.route('/appointments')
	.get(authController.isAuthenticated, appointmentController.getAppointments);

router.route('/clients/:client_id/appointments/:appointment_id')
	.put(authController.isAuthenticated, appointmentController.putClientAppointment)
	.delete(authController.isAuthenticated, appointmentController.deleteClientAppointment);



router.route('/service-types')
	.post(authController.isAuthenticated, serviceTypeController.postServiceTypes)
	.get(authController.isAuthenticated, serviceTypeController.getServiceTypes);

router.route('/service-types/:service_type_id')
	.put(authController.isAuthenticated, serviceTypeController.putServiceType)
	.delete(authController.isAuthenticated, serviceTypeController.deleteServiceType);


// Register all our routes with /api
app.use('/api', router);

// Start the server
app.listen(port);
console.log('Server running on port ' + port);