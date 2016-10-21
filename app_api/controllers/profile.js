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

        tabulateUserStats(user)

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

      function tabulateUserStats(user) {

        var arr = []
        var towns = user.towns

        for (var status in towns) {
            arr.push(towns[status])
        }

        var groupby = {};
        arr.map( function (a) { if (a in groupby) groupby[a] ++; else groupby[a] = 1; } );
        console.log(groupby);

        user.driving = groupby.Driving || 0
        user.hiking = groupby.Hiking || 0
        user.biking = groupby.Biking || 0
        user.not_yet = groupby['Not yet'] || 0

    }

};
