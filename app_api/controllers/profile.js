var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.profileRead = function(req, res) {

  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } else {
    User
      .findById(req.payload._id)
      .exec(function(err, user) {
        res.status(200).json(user);
      });
  }

};

module.exports.updateProfile = function(req, res) {

  console.log(req.body)

  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } else {

    User
      .findById(req.payload._id, function (err, user) {

        user.towns[req.body.fips6] = req.body.status;

        //biggest gotcha ever
        //will save outer level objects fine, but need to
        //explicitly tell mongoose that this has been updated
        user.markModified('towns');

        console.log('starting save')
        user.save(function(err, u) {
        if (err) {
            console.log(err);
            res.send(400, 'Bad Request');
        } else {
          res.send(200)
          //console.log(user)
        }
      });

  });
  }

};
