(function () {

  angular.module('meanApp', ['ngRoute']);

  function config ($routeProvider, $locationProvider, $logProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'home/home.view.html',
        controller: 'homeCtrl',
        controllerAs: 'vm'
      })
      .when('/register', {
        templateUrl: '/auth/register/register.view.html',
        controller: 'registerCtrl',
        controllerAs: 'vm'
      })
      .when('/login', {
        templateUrl: '/auth/login/login.view.html',
        controller: 'loginCtrl',
        controllerAs: 'vm'
      })
      .when('/profile', {
        templateUrl: '/profile/profile.view.html',
        controller: 'profileCtrl',
        controllerAs: 'vm'
      })
      .when('/users/:username', {
        templateUrl: '/users/users.view.html',
        controller: 'userCtrl',
        controllerAs: 'vm'
      })
      .otherwise({redirectTo: '/'});

    // use the HTML5 History API
    $locationProvider.html5Mode(true);

  }

  function run($rootScope, $location, $http, authentication) {
    $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
      if ($location.path() === '/profile' && !authentication.isLoggedIn()) {
        $location.path('/');
      }

      // automatically direct user to their editable map
      if ($location.path() == '/users/' + authentication.currentUser().name) {
        $location.path('/profile');
      }
    });
  }
  
  angular
    .module('meanApp')
    .config(['$routeProvider', '$locationProvider', '$logProvider', config])
    .run(['$rootScope', '$location', '$http', 'authentication', run]);

})();