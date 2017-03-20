var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.register = function(req, res) {

  console.log('got register request')

  if(!req.body.name || !req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }

  User.findOne({$or: [{'name': req.body.name},  
                      {'email': req.body.email}]}, function (err, userResponse) {

    if(err) {
      console.log(err)
    }

    if (userResponse) {
      console.log('user or email already taken')
      sendJSONresponse(res, 400, {
      "message": "This username is already taken, please choose a different one."
    });
    return;

    } else {

      var user = new User();
    
      user.name = req.body.name;
      user.email = req.body.email;
      user.towns = req.body.towns;
    
      user.not_yet = 251

      console.log('creating new user')
    
      user.setPassword(req.body.password);
    
      user.save(function(err) {
        var token;
        token = user.generateJwt();
        res.status(200);
        res.json({
          "token" : token
        });
      });
    
    }

});

};

module.exports.login = function(req, res) {

  if(!req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }

  passport.authenticate('local', function(err, user, info){
    var token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if(user){
      token = user.generateJwt();
      res.status(200);
      res.json({
        "token" : token
      });
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);

};