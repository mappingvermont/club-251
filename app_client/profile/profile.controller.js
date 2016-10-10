(function() {

    angular
        .module('meanApp')
        .controller('profileCtrl', profileCtrl);


    profileCtrl.$inject = ['$location', '$scope', '$compile', 'leafletData', 'meanData'];

    function profileCtrl($location, $scope, $compile, leafletData, meanData) {

        angular.extend($scope, {
            vermont: {
                lat: 43.9,
                lng: -72.4,
                zoom: 8
            },
            defaults: {
                scrollWheelZoom: false
            }
        });


        var vm = this;

        vm.user = {};

        meanData.getProfile()
            .success(function(data) {

                joinTopoJson($scope, data, vm, leafletData)

            })
            .error(function(e) {
                console.log(e);
            });

        $scope.messageClick = function(data) {
              console.log('option ' + data.town_status + ' selected for ' + data.fips6 + '!');
            };

        $scope.$on('leafletDirectiveMap.popupopen', function(event, leafletEvent) {

            // Create the popup view when is opened
            var feature = leafletEvent.leafletEvent.popup.options.feature;

            var newScope = $scope.$new();
            newScope.stream = feature;

            $compile(leafletEvent.leafletEvent.popup._contentNode)(newScope);

        });

    }

    function joinTopoJson($scope, userData, vm, leafletData) {

        leafletData.getMap().then(function(map) {
            var topoJSONlayer = omnivore.topojson('../data/towns.json')

            .on('ready', function() {
                topoJSONlayer.eachLayer(function(layer) {

                    var fips6 = layer.feature.properties.fips6
                    layer.feature.properties.status = userData.towns[fips6]
                    //console.log(layer.feature.properties)

                    style_poly(layer)

                    buildPopup($scope, layer.feature, layer);

                });
            })

            .addTo(map);

        });

        vm.user = userData
        console.log(vm.user)

    }

    var styles = {
        'Not yet': '#4daf4a',
        'FARM': '#e41a1c',
        'BROOK': '#377eb8',
        'POND': '#984ea3',
        'Tie': '#999999',
        'other': '#ff7f00'

    }

    function style_poly(layer) {

        var style_color = (styles[layer.feature.properties.status] || styles['other']);

        layer.setStyle({
            color: style_color,
            fill: style_color,
            weight: 1,
        })
    }

    function buildPopup($scope, feature, layer) {

        var divNode = document.createElement('DIV');

        $scope.data = {'town_name': feature.properties.town,
                       'fips6': feature.properties.fips6,
                       'town_status': feature.properties.status,
                       'type': 'select',
                       'status_options': ['Not yet', 'biking', 'driving']} 

        var popup = "<div class='popup_box_header'>{{data.town_name}}<strong></strong></div><hr />"
        popup += '<select ng-model="data.town_status" ng-options="v for v in data.status_options"></select>'

        divNode.innerHTML = popup
        layer.bindPopup(divNode, {
            maxWidth: 450,
            autoPan: true
        })

    }


})();