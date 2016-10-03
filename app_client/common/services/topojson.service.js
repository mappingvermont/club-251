(function() {

  angular
    .module('meanApp')
    .service('meanTopoJSON', meanTopoJSON);

  meanTopoJSON.$inject = ['$http'];
  function meanTopoJSON ($http) {

    //var promise = function() {
    //  return $http.get('data/towns.json');
    //};

    var promise = $http.get('data/towns.json').
    success(function (data) {
        return data;
    });

    return {
      promise : promise
    };
  }

})();