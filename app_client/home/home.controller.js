(function() {
  
  angular
    .module('meanApp')
    .controller('homeCtrl', homeCtrl);

  homeCtrl.$inject = ['meanUsers', 'authentication'];
  function homeCtrl(meanUsers, authentication) {
  	// console.log('Home controller is running');

    var vm = this;
    vm.isLoggedIn = authentication.isLoggedIn();
    vm.users = []

    meanUsers.getUsers()
      .success(function(data) {
        vm.users = data;

        console.log(vm.users);

      })
      .error(function (e) {
        console.log(e);
      });

  }

})();