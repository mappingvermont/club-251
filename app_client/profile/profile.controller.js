(function() {

    angular
        .module('meanApp')
        .controller('profileCtrl', profileCtrl);


    profileCtrl.$inject = ['$scope', '$compile', '$http', 'leafletData', 'meanData'];

    function profileCtrl($scope, $compile, $http, leafletData, meanData) {

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

        var vm = this;

        vm.user = {};
        $scope.dataHasLoaded = false

        meanData.getProfile()
            .success(function(data) {
                vm.user = data
                tabulateUserStats($scope)
                $scope.dataHasLoaded = true
                joinTopoJson($scope, $http, data, vm, leafletData)

            })
            .error(function(e) {
                console.log(e);
            });

        $scope.messageClick = function(layer) {
            //console.log('option ' + layer.feature.properties.status + ' selected for ' + layer.feature.properties.fips6 + '!');

            style_poly(layer)

            vm.user.towns[layer.feature.properties.fips6] = layer.feature.properties.status

            tabulateUserStats($scope)

            meanData.setProfile(layer.feature.properties)
                // .success(function(data) {
                //     //console.log(data)
                // })
                // .error(function(e) {
                //     console.log(e);
                // });

            //takes a while to update the status-- see if we can fix this?
            //layer.feature.properties.status = layer.status

        };

        $scope.$on('leafletDirectiveMap.popupopen', function(event, leafletEvent) {

            // Create the popup view when is opened
            var feature = leafletEvent.leafletEvent.popup.options.feature;

            var newScope = $scope.$new();
            newScope.stream = feature;

            newScope.layer = $scope.layer
            newScope.layer.status_options = ['Not yet', 'Biking', 'Hiking', 'Driving']

            $compile(leafletEvent.leafletEvent.popup._contentNode)(newScope);

        });

    }

    function joinTopoJson($scope, $http, userData, vm, leafletData) {

        leafletData.getMap().then(function(map) {

            $http.get("../data/towns.geojson").success(function(data, status) {

                angular.extend($scope.layers.overlays, {
                    countries: {
                        name: 'Club 251 Progress',
                        type: 'geoJSONShape',
                        data: data,
                        visible: true,
                        layerOptions: {
                            onEachFeature: onEachFeature
                        }

                    }
                });

                function onEachFeature(feature, layer) {

                    var fips6 = layer.feature.properties.fips6
                    layer.feature.properties.status = userData.towns[fips6]

                    style_poly(layer)

                    buildPopup(feature, layer)

                    layer.on({
                        click: function() {
                            $scope.layer = layer;
                        }
                    })
                }
            });


        });

    }

    var styles = {
        'Hiking': '#ff7f00',
        'Biking': '#377eb8',
        'Driving': '#e41a1c',
        'Not yet': '#999999'
    }

    function style_poly(layer) {

        var style_color = (styles[layer.feature.properties.status] || styles['other']);

        layer.setStyle({
            color: style_color,
            fill: style_color,
            weight: 1,
        })
    }

    function buildPopup(feature, layer) {

        var divNode = document.createElement('DIV');

        var popup = "<div class='popup_box_header'><strong>{{layer.feature.properties.town}}</strong></div><hr />"
        popup += 'Status: <select ng-model="layer.feature.properties.status" ng-change=messageClick(layer) '
        popup += 'ng-options="v for v in layer.status_options"></select>'
        popup += '</select>'

        divNode.innerHTML = popup
        layer.bindPopup(divNode)

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
        console.log(groupby);
        $scope.vm.user.local = {}

        $scope.vm.user.local.driving = groupby.Driving || 0
        $scope.vm.user.local.hiking = groupby.Hiking || 0
        $scope.vm.user.local.biking = groupby.Biking || 0
        $scope.vm.user.local.not_yet = groupby['Not yet'] || 0

        console.log($scope.vm.user.local)

    }

})();