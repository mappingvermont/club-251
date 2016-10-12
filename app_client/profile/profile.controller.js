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
                        name: 'OpenStreetMap',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        type: 'xyz'
                    },
                },
                overlays: {}
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
            //console.log(layer)
            console.log('option ' + layer.feature.properties.status + ' selected for ' + layer.feature.properties.fips6 + '!');

            style_poly(layer)

            console.log('here')
            vm.user.towns[layer.feature.properties.fips6] = layer.feature.properties.status
            console.log(vm.user.towns[layer.feature.properties.fips6])
            console.log('end')

            meanData.setProfile()

            //takes a while to update the status-- see if we can fix this?
            //layer.feature.properties.status = layer.status

        };

        $scope.$on('leafletDirectiveMap.popupopen', function(event, leafletEvent) {

            // Create the popup view when is opened
            var feature = leafletEvent.leafletEvent.popup.options.feature;

            var newScope = $scope.$new();
            newScope.stream = feature;

            newScope.layer = $scope.layer
            newScope.layer.status_options = ['Not yet', 'driving', 'walking']

            $compile(leafletEvent.leafletEvent.popup._contentNode)(newScope);

        });

    }


    function joinTopoJson($scope, $http, userData, vm, leafletData) {

        leafletData.getMap().then(function(map) {

            $http.get("../data/towns.geojson").success(function(data, status) {

                //console.log(data)
                angular.extend($scope.layers.overlays, {
                    countries: {
                        name: 'World Country Boundaries',
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
        console.log(vm.user)

    }

    var styles = {
        'Not yet': '#4daf4a',
        'driving': '#e41a1c',
        'walking': '#377eb8',
        'POND': '#984ea3',
        'Tie': '#999999',
        'other': '#ff7f00'

    }

    function style_poly(layer) {

        var style_color = (styles[layer.feature.properties.status] || styles['other']);

        //console.log('styling')
        //console.log(layer.feature.properties.status)

        layer.setStyle({
            color: style_color,
            fill: style_color,
            weight: 1,
        })
    }

    function buildPopup(feature, layer) {

        var divNode = document.createElement('DIV');

        //console.log(layer)

        var popup = "<div class='popup_box_header'>{{layer.feature.properties.town}}<strong></strong></div><hr />"
        popup += '<select ng-model="layer.feature.properties.status" ng-change=messageClick(layer) ng-options="v for v in layer.status_options"></select>'
        popup += '</select>'

        divNode.innerHTML = popup
        layer.bindPopup(divNode, {
            maxWidth: 450,
            autoPan: true
        })

    }


})();