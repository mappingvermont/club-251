(function() {
  
  angular
    .module('meanApp')
    .controller('profileCtrl', profileCtrl);


  profileCtrl.$inject = ['$http', '$location', '$scope', 'leafletData', 'meanData', 'meanTopoJSON'];
  function profileCtrl($http, $location, $scope, leafletData, meanData, meanTopoJSON) {

    angular.extend($scope, {
            vermont: {
                lat: 43.9,
                lng: -72.4,
                zoom: 8
            },
            defaults: {
                scrollWheelZoom: false
            },
             markers: {
                    m1: {
                        lat: 43.9,
                        lng: -72.5,
                        focus: true,
                        draggable: false,
                        message: "Hi there!",
                        icon: {}
                    }
                }
        });


    var vm = this;

    vm.user = {};

    meanData.getProfile()
      .success(function(data) {

        meanTopoJSON.promise.then(function(topojson){
          console.log('got topojson')
          joinTopoJson($http, data, topojson, vm, leafletData, $scope)

          });

      })
      .error(function (e) {
        console.log(e);
      });

  }

function joinTopoJson($http, userData, topojson, vm, leafletData, $scope) {

        var geometries = topojson.data.objects.towns.geometries;

        for (i=0; i < geometries.length; i++) {
          var fips6 = geometries[i].properties.fips6

          geometries[i].properties.status = userData.towns[fips6];

        }
        console.log('finished join')
        //userData.topojson = topojson.data
        userData.topojson = 'placeholder'

        leafletData.getMap().then(function(map) {
          var marker = L.marker($scope.markers.m1)
          marker.addTo(map);
        //map.addLayer(markers);
        //map.fitBounds(markers.getBounds());
      });

        vm.user = userData
        console.log(vm.user)
    
}


})();