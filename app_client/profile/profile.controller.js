(function() {

    angular
        .module('meanApp')
        .controller('profileCtrl', profileCtrl);


    profileCtrl.$inject = ['$location', '$scope', '$compile', '$http', 'leafletData', 'meanData'];

    function profileCtrl($location, $scope, $compile, $http, leafletData, meanData) {

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
                        layerOptions: {"showOnSelector": false}
                    },
                },
                overlays: {}
            },
            legend: {
                    position: 'bottomright',
                    colors: [ '#ff7f00', '#377eb8', '#e41a1c', '#999999' ],
                    labels: [ 'Hiking', 'Biking', 'Driving', 'Not yet' ]
                }
        });

        var vm = this;

        vm.user = {};

        meanData.getProfile()
            .success(function(data) {
                joinTopoJson($scope, $http, data, vm, leafletData)

            })
            .error(function(e) {
                console.log(e);
            });

        $scope.messageClick = function(layer) {
            //console.log('option ' + layer.feature.properties.status + ' selected for ' + layer.feature.properties.fips6 + '!');

            style_poly(layer)

            vm.user.towns[layer.feature.properties.fips6] = layer.feature.properties.status
            //console.log(vm.user.towns[layer.feature.properties.fips6])

            meanData.setProfile(layer.feature.properties)
              .success(function(data) {
                  //console.log(data)
              })
              .error(function(e) {
                  console.log(e);
              });

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

        vm.user = userData

    }

    var styles = {
        'Hiking': '#ff7f00',            
        'Biking': '#377eb8',
        //'Hiking': '#4daf4a', //green
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


})();