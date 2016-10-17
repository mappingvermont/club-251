(function() {

  angular
    .module('meanApp')
    .service('meanData', meanData);

  meanData.$inject = ['$http', 'authentication'];
  function meanData ($http, authentication) {

    var getProfile = function () {
      return $http.get('/api/profile', {
        headers: {
          Authorization: 'Bearer '+ authentication.getToken()
        }
      });
    };

    var setProfile = function (input) {
      console.log('in set prof')
      console.log(authentication.getToken())
      return $http.put('/api/profile/' + input.fips6, input, {
        headers: {
          Authorization: 'Bearer '+ authentication.getToken(),
        }
      });
    };

    return {
      getProfile : getProfile,
      setProfile : setProfile
    };
  }

})();