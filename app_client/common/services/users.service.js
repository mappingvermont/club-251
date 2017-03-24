(function() {

  angular
    .module('meanApp')
    .service('meanUsers', meanUsers);

  meanUsers.$inject = ['$http', 'authentication'];

  function meanUsers ($http, authentication) {

    var getUsers = function () {
      // console.log('calling find all users')
      return $http.get('api/users', {
      });
    };

    var singleUser = function (username) {
      //console.log('calling singleUser for: ' + username)
      return $http.get('api/users/' + username, {
      });
    };

    return {
      getUsers : getUsers,
      singleUser : singleUser
    };
  }

})();
