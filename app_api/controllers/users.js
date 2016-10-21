var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.userList = function(req, res) {

  console.log('in users.js finding users')

    User
      .find({}, function(err, users) {
        userList = []
        users.forEach(function(user){
          u = {name: user.name, 
               biking: user.biking || 0,
               hiking: user.hiking || 0,
               driving: user.driving || 0,
               not_yet: user.not_yet || 0
             }

          console.log(u)

          userList.push(u)
        })
      })
      .exec(function(err, users) {
        res.status(200).json(userList);
      });


};

module.exports.singleUser = function(req, res) {

  console.log('finding single user')
  console.log(req.params.username)

  User
    .findOne({'name': req.params.username})
    .exec(function(err, user) {
      if (user) {
      res.status(200).json(user.towns);
      } else {
        res.status(404).json('User %s does not exist', req.params.username)
      }
    });

  console.log(user)
}



