(function () {

  angular
    .module('meanApp')
    .controller('registerCtrl', registerCtrl);

  function populateTowns(){
    var fips6_list = [9030,11040,11015,11050,11060,13005,9080,9005,19050,19060,19085,9060,13015,11075,19070,9065,11080,13020,11020,19090,19020,11070,19015,11030,9015,9020,19055,19065,11010,11065,19095,9045,9025,15005,11045,19005,13010,15045,11025,5040,11035,19010,5070,19040,7050,9040,19030,15010,5060,13025,9050,19045,5010,7080,15030,15050,7075,5085,9055,9085,15025,15035,5025,5065,5030,15040,15020,5035,5075,9070,7045,5055,9035,23095,23100,7005,5080,23025,7060,5005,23050,5045,23030,7020,7040,23090,23045,23035,23060,23055,1095,5020,23070,1060,23040,23015,1025,23010,17040,23005,1015,17060,1100,1065,1075,1105,1050,17075,1005,17025,1110,17020,1055,1080,1010,1020,17070,17080,17030,1040,17065,1085,27075,1090,17050,27020,17055,27080,1070,21075,27085,27095,27055,27015,21005,27040,21047,27025,21135,21035,27045,27060,21110,27070,27115,21125,21060,21070,27050,21030,21065,27105,27005,27090,3045,3015,3030,3020,25050,25030,25110,3050,3075,3025,25045,25080,25095,3005,3070,25075,25015,25090,3060,3018,25073,25065,25060,25020,25025,3010,3080,3055,25105,25055,25010,3040,3035,3065,25100,25040,25035,25085,11055,15015,9075,7025,5015,7090,23020,7065,7055,7035,27065,27120,21095,7015,17010,17045,7030,5050,17035,7070,7085,17085,17015,17005,21085,21120,21130,21055,27110,27035,27030,27011,27100,19080,19035,19025,19075,23065,23080,25070,25005,1035,23075,23085,1030,1115,1045,21020,21115,21040,21015,21045,21010,21080,21140,21090,21100,21050,21025]
    var towns = {}

    for (i=0; i < fips6_list.length; i++) {
      towns[fips6_list[i]] = 'Not yet'
    }

    return towns
  }

  registerCtrl.$inject = ['$location', 'authentication'];
  function registerCtrl($location, authentication) {
    var vm = this;

    vm.credentials = {
      name : "",
      email : "",
      password : "",
      towns: populateTowns()
    };

    vm.onSubmit = function () {
      console.log('Submitting registration');
      console.log(vm.credentials);
      authentication
        .register(vm.credentials)
        .error(function(err){
          alert(err);
        })
        .then(function(){
          $location.path('home');
        });
    };

  }

})();