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

    var setProfile = function() {
      console.log('SETTING PROFILE')
    }

    return {
      getProfile : getProfile,
      setProfile : setProfile
    };
  }

})();