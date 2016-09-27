(function() {
  
  angular
    .module('meanApp')
    .controller('homeCtrl', homeCtrl);

  homeCtrl.$inject = ['$location', 'meanUsers'];
  function homeCtrl($location, meanUsers) {
  	console.log('Home controller is running');
  	console.log('And here');

    var vm = this;
    vm.users = []

    meanUsers.getUsers()
      .success(function(data) {
        vm.users = data;
        // console.log(data);
      })
      .error(function (e) {
        console.log(e);
      });

  }

})();