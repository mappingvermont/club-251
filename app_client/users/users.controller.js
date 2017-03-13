(function() {

    angular
        .module('meanApp')
        .controller('userCtrl', userCtrl);


    userCtrl.$inject = ['$scope', '$routeParams', '$http', 'leafletData', 'meanUsers'];

    function userCtrl($scope, $routeParams, $http, leafletData, meanUsers) {

        angular.extend($scope, {
            vermont: {
                lat: 43.9,
                lng: -72.4,
                zoom: 8
            },
            defaults: {
                scrollWheelZoom: false
            },
            layers: {
                baselayers: {
                    osm: {
                        name: 'Esri World_Topo_Map',
                        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
                        //url: 'http://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}.png',
                        type: 'xyz',
                        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
                        layerOptions: {
                            "showOnSelector": false
                        }
                    },
                },
                overlays: {}
            },
            legend: {
                position: 'bottomright',
                colors: ['#ff7f00', '#377eb8', '#e41a1c', '#999999'],
                labels: ['Hiking', 'Biking', 'Driving', 'Not yet']
            }
        });

        var username = $routeParams.username
        var vm = this;

        vm.user = {};
        $scope.dataHasLoaded = false

        meanUsers.singleUser(username)
            .success(function(data) {
                vm.user.towns = data
                tabulateUserStats($scope)
                $scope.dataHasLoaded = true

                joinTopoJson($scope, $http, vm.user, leafletData)

            })
            .error(function(e) {
                console.log(e);
            });

    }

    function joinTopoJson($scope, $http, userData, leafletData) {

        leafletData.getMap().then(function(map) {

          var customLayer = L.geoJson(null, {
            style: function(feature) {
              var status = userData.towns[feature.properties.fips6]
              var style_color = (styles[status] || styles['other']);

                return { color: style_color,
                         fill: style_color,
                         weight: 1 };
            }
          });

          $scope.worldLayer = omnivore.topojson("../data/towns.json", null, customLayer)
                .on('ready', function(layer) {

                  this.eachLayer(function(marker) {
                     var status = userData.towns[marker.feature.properties.fips6]

                     // Bind a popup to each icon based on the same properties
                     marker.bindPopup(marker.feature.properties.town + ': ' + status)

                       });

                   })

                .addTo(map);

        });

    }

    var styles = {
        'Hiking': '#ff7f00',
        'Biking': '#377eb8',
        'Driving': '#e41a1c',
        'Not yet': '#999999'
    }

    function tabulateUserStats($scope) {

        var arr = []
        var towns = $scope.vm.user.towns

        for (var status in towns) {
            arr.push(towns[status])
        }

        var groupby = {};
        arr.map(function(a) {
            if (a in groupby) groupby[a]++;
            else groupby[a] = 1;
        });

        $scope.vm.user.local = {}

        $scope.vm.user.local.driving = groupby.Driving || 0
        $scope.vm.user.local.hiking = groupby.Hiking || 0
        $scope.vm.user.local.biking = groupby.Biking || 0
        $scope.vm.user.local.not_yet = groupby['Not yet'] || 0

    }

})();