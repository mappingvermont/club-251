(function() {
  
  angular
    .module('meanApp')
    .controller('profileCtrl', profileCtrl);

  profileCtrl.$inject = ['$http', '$location', 'meanData', 'meanTopoJSON'];
  function profileCtrl($http, $location, meanData, meanTopoJSON) {
    var vm = this;

    vm.user = {};

    //notes http://stackoverflow.com/questions/16286605/


    meanData.getProfile()
      .success(function(data) {

        meanTopoJSON.promise.then(function(topojson){
          console.log('got topojson')
          joinTopoJson($http, data, topojson, vm)

          });

      })
      .error(function (e) {
        console.log(e);
      });
  }

function joinTopoJson($http, userData, topojson, vm) {

        console.log('started join')
        console.log(topojson)

        var geometries = topojson.data.objects.towns.geometries;

        for (i=0; i < geometries.length; i++) {
          var fips6 = geometries[i].properties.fips6

          geometries[i].properties.status = userData.towns[fips6];
          //console.log(geometries[i])

        }
        console.log('finished join')
        userData.topojson = topojson
        vm.user = userData
        console.log(vm.user)
    
}


})();