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

        $scope.messageClick = function() {
              console.log('popup clicked!');
            };

        $scope.$on('leafletDirectiveMap.popupopen', function(event, leafletEvent) {

            console.log('pop up opened!')

            // Create the popup view when is opened
            var feature = leafletEvent.leafletEvent.popup.options.feature;

            var newScope = $scope.$new();
            newScope.stream = feature;

            $compile(leafletEvent.leafletEvent.popup._contentNode)(newScope);
        });

    }

    function joinTopoJson(userData, vm, leafletData) {

        leafletData.getMap().then(function(map) {
            var topoJSONlayer = omnivore.topojson('../data/towns.json')

            .on('ready', function() {
                topoJSONlayer.eachLayer(function(layer) {

                    var fips6 = layer.feature.properties.fips6
                    layer.feature.properties.status = userData.towns[fips6]
                    console.log(layer.feature.properties)

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
        false: '#4daf4a',
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

    function buildPopup(feature, layer) {

        var divNode = document.createElement('DIV');

        var popup = "<div class='popup_box_header'><strong>" + feature.properties.town + "</strong></div>";
        popup += "<hr />";

        popup += '<button type="submit" ng-click="messageClick()"> Click Me!</button><br>'

        var status = feature.properties.status

        popup += status + "<br>";

        divNode.innerHTML = popup
        layer.bindPopup(divNode, {
            maxWidth: 450,
            autoPan: true
        })

    }

    function messageClick() {

        console.log('clicked')
    }


})();