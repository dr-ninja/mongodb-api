// Load required packages
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');

var authController = require('./controllers/auth');
var clientController = require('./controllers/client');
var userController = require('./controllers/user');

// Connect to the server-api MongoDB
mongoose.connect(process.env.MONGODBURL);


// Create our Express application
var app = express();

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({extended: true}));

// Use the passport package in our application
app.use(passport.initialize());

// Use environment defined port or 3000
var port = process.env.PORT || 3000;

// Create our Express router
var router = express.Router();

// Initial dummy route for testing
// http://localhost:3000/api
router.get('/', function(req, res) {
	res.json({ message: 'This API is working!!!' });
});


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
console.log('Insert client on port ' + port);