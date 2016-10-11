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
                joinTopoJson(data, vm, leafletData)

            })
            .error(function(e) {
                console.log(e);
            });

        $scope.messageClick = function(town) {
            console.log(town)
              console.log('option ' + town.status + ' selected for ' + town.fips6 + '!');

            town.leafletObject._popup._source.feature.properties.status = town.status

            };

        $scope.$on('leafletDirectiveMap.popupopen', function(event, leafletEvent) {

            // Create the popup view when is opened
            var feature = leafletEvent.leafletEvent.popup.options.feature;

            var properties = leafletEvent.leafletObject._popup._source.feature.properties

            var newScope = $scope.$new();
            newScope.stream = feature;

            newScope.town = {}

            newScope.town.name = properties.town
            newScope.town.fips6 = properties.fips6
            newScope.town.status = properties.status
            newScope.town.status_options = ['Not yet', 'driving', 'walking']
            newScope.town.leafletObject = leafletEvent.leafletObject
            
            $compile(leafletEvent.leafletEvent.popup._contentNode)(newScope);

        });

    }

    function joinTopoJson(userData, vm, leafletData) {

        leafletData.getMap().then(function(map) {
            var topoJSONlayer = omnivore.topojson('../data/towns.json')

            //$scope.data = userData

            .on('ready', function() {

                //$scope.data.status_options = ['Not yet', 'biking', 'driving']

                topoJSONlayer.eachLayer(function(layer) {

                    //$scope.layer = layer
                    //console.log($scope.layer)
                    console.log(userData)

                    var fips6 = layer.feature.properties.fips6
                    //$scope.layer.feature.properties.status = userData.towns[fips6]
                    layer.feature.properties.status = userData.towns[fips6]
                    //console.log(layer.feature.properties)

                    style_poly(layer)

                    buildPopup(layer.feature, layer);

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

        console.log('styling')

        layer.setStyle({
            color: style_color,
            fill: style_color,
            weight: 1,
        })
    }

    function buildPopup(feature, layer) {

        var divNode = document.createElement('DIV');

        var popup = "<div class='popup_box_header'>{{town.name}}<strong></strong></div><hr />"
        popup += '<select ng-model="town.status" ng-change=messageClick(town) ng-options="v for v in town.status_options"></select>'
        popup += '</select>'

        divNode.innerHTML = popup
        layer.bindPopup(divNode, {
            maxWidth: 450,
            autoPan: true
        })

    }


})();