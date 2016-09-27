(function() {
  
  angular
    .module('meanApp')
    .controller('userCtrl', userCtrl);

  userCtrl.$inject = ['$location', '$routeParams', 'meanUsers'];
  function userCtrl($location, $routeParams, meanUsers) {
    console.log('in users.controller.js')
    var username = $routeParams.username
    var vm = this;

    vm.towns = {};

    meanUsers.singleUser(username)
      .success(function(data) {
        vm.towns = data;
        console.log('town data:')
        console.log(data);
      })
      .error(function (e) {
        console.log(e);
      });
  }

})();