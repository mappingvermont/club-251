require('dotenv').config()
var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: process.env.SECRET,
  userProperty: 'payload'
});

var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');
var ctrlUsers = require('../controllers/users')

// profile
router.get('/profile', auth, ctrlProfile.profileRead);
router.put('/profile/:fips6', auth, ctrlProfile.updateProfile);

// users
router.get('/users', ctrlUsers.userList)
router.get('/users/:username', ctrlUsers.singleUser)

// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;
