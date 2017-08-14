(function() {

  angular
    .module('meanApp')
    .controller('homeCtrl', homeCtrl)
    .filter('startFrom', function() { // add custom filter
        return function(input, start) {
            console.log(input)
            console.log(start)
            start = +start; //parse to int
            return input.slice(start);
        }
    });

  homeCtrl.$inject = ['meanUsers', 'authentication'];
  function homeCtrl(meanUsers, authentication) {
  	// console.log('Home controller is running');

    var vm = this;
    vm.isLoggedIn = authentication.isLoggedIn();
    vm.users = []

    // pagination
    // https://stackoverflow.com/questions/11581209
    vm.currentPage = 0
    vm.pageSize = 6
    vm.numberOfPages=function(){
        return Math.ceil(vm.users.length/vm.pageSize);
    }
    console.log(vm.numberOfPages())

    meanUsers.getUsers()
      .success(function(data) {
        vm.users = data;

//        console.log(vm.users);

      })
      .error(function (e) {
        console.log(e);
      });

  }


})();
