// Load required packages
var express = require('express');
var ejs = require('ejs');
var session = require('express-session');

var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var oauth2Controller = require('./controllers/oauth2');

var authController = require('./controllers/auth');
var clientController = require('./controllers/client');
var userController = require('./controllers/user');
var partnerController = require('./controllers/partner');

// Connect to the server-api MongoDB
mongoose.connect(process.env.MONGODBURL);


// Create our Express application
var app = express();

// Set view engine to ejs
app.set('view engine', 'ejs');

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({extended: true}));

// Use express session support since OAuth2orize requires it
app.use(session({
	secret: 'Super Secret Session Key',
	saveUninitialized: true,
	resave: true
}));

// Use the passport package in our application
app.use(passport.initialize());

// Use environment defined port or 3000
var port = process.env.PORT || 5000;

// Create our Express router
var router = express.Router();

// Initial dummy route for testing
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

// Create endpoint handlers for /clients
router.route('/clients')
	.post(authController.isAuthenticated, clientController.postClients)
	.get(authController.isAuthenticated, clientController.getClients);

// Create endpoint handlers for /clients/:client_id
router.route('/clients/:client_id')
	.get(authController.isAuthenticated, clientController.getClient)
	.put(authController.isAuthenticated, clientController.putClient)
	.delete(authController.isAuthenticated, clientController.deleteClient);

// Register all our routes with /api
app.use('/api', router);

// Start the server
app.listen(port);
console.log('Server running on port ' + port);