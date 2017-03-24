(function() {

    angular
        .module('meanApp')
        .controller('userCtrl', userCtrl);


    userCtrl.$inject = ['$scope', '$routeParams', '$http', 'meanUsers'];

    function userCtrl($scope, $routeParams, $http, meanUsers) {

        var username = $routeParams.username
        var vm = this;

        vm.user = {};
        $scope.dataHasLoaded = false

        meanUsers.singleUser(username)
            .success(function(data) {
                vm.user.towns = data
                tabulateUserStats($scope)
                $scope.dataHasLoaded = true

                console.log(vm.user)

                leafletInit($scope)

            })
            .error(function(e) {
                console.log(e);
            });

    }

    function leafletInit($scope) {

        $scope.style = function(feature) {

              var status = $scope.vm.user.towns[feature.properties.fips6]
              var style_color = (styles[status] || styles['other']);

                return { color: style_color,
                         fill: style_color,
                         weight: 1 };
            }

        var mymap = L.map('mapid').setView([43.9, -72.4], 8);

        L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        }).addTo(mymap);

        mymap.attributionControl.addAttribution('Basemap &copy; esri; town boundaries from VCGI');

          var customLayer = L.geoJson(null, {
            style: $scope.style
          });

          addLegend(mymap)

          $scope.worldLayer = omnivore.topojson("data/towns.json", null, customLayer)
                .on('ready', function(layer) {

                  this.eachLayer(function(marker) {
                     var status = $scope.vm.user.towns[marker.feature.properties.fips6]
                     var town = marker.feature.properties.town

                     // Bind a popup to each icon based on the same properties
                     marker.bindPopup(buildPopup(town, status))

                       });

                   })

                .addTo(mymap);

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

    function addLegend(map) {

        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend')
            var names =  ['Hiking', 'Biking', 'Driving', 'Not yet']

            var labels = []

            for (var i = 0; i < names.length; i++) {
                labels.push('<i style="background:' + styles[names[i]] + '"></i> ' + names[i]);
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };

        legend.addTo(map);
    }

    function buildPopup(town, status) {

        var divNode = document.createElement('DIV');
        var popup = town + ': ' + status
        divNode.innerHTML = popup

        return divNode

    }

})();
