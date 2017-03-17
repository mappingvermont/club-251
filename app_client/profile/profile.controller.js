(function() {

    angular
        .module('meanApp')
        .controller('profileCtrl', profileCtrl);


    profileCtrl.$inject = ['$scope', '$compile', '$http', 'leafletData', 'meanData'];

    function profileCtrl($scope, $compile, $http, leafletData, meanData) {

        var vm = this;

        vm.user = {};
        $scope.dataHasLoaded = false

        meanData.getProfile()
            .success(function(data) {

                vm.user = data
                tabulateUserStats($scope)
                $scope.dataHasLoaded = true
                leafletInit($scope)


            })
            .error(function(e) {
                console.log(e);
            });

        }

    function leafletInit($scope) {

        console.log('in leafletInit')

        var mymap = L.map('mapid').setView([43.9, -72.4], 8);

        L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy;',
        }).addTo(mymap);

        L.marker([43.9, -72.4]).addTo(mymap).bindPopup("<b>Hello world!</b><br />I am a popup.")

          var customLayer = L.geoJson(null, {
            style: function(feature) {
              var status = $scope.vm.user.towns[feature.properties.fips6]
              var style_color = (styles[status] || styles['other']);

                return { color: style_color,
                         fill: style_color,
                         weight: 1 };
            }
          });

          var worldLayer = omnivore.topojson("../data/towns.json", null, customLayer)
                .on('ready', function(layer) {

                    console.log('in world layer')

                  this.eachLayer(function(marker) {
                     var status = $scope.vm.user.towns[marker.feature.properties.fips6]
                     var town = marker.feature.properties.town

                     // Bind a popup to each icon based on the same properties
                     marker.bindPopup(buildPopup(town, status))

                       });

                   })
                .addTo(mymap);

        mymap.on('popupclose', function(e) {
            console.log('well . . .')
            var marker = e.popup._source;
            console.log(e)
            e.popup._source.options.color = '#48f442'
            e.popup._source.options.fill = '#48f442'
            console.log('set style?')
        });

    }

    var styles = {
        'Hiking': '#ff7f00',
        'Biking': '#377eb8',
        'Driving': '#e41a1c',
        'Not yet': '#999999'
    }

    function tabulateUserStats($scope) {

        // console.log('starting tabulate stats')

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
        // console.log(groupby);
        $scope.vm.user.local = {}

        $scope.vm.user.local.driving = groupby.Driving || 0
        $scope.vm.user.local.hiking = groupby.Hiking || 0
        $scope.vm.user.local.biking = groupby.Biking || 0
        $scope.vm.user.local.not_yet = groupby['Not yet'] || 0

        // console.log('done with stats')

        // console.log($scope.vm.user.local)
    }

    function buildPopup(town, status) {

        var popup = "<strong>" + town + "</strong><hr />"
        popup += '<select name=' + town + ' id="townStatus", onchange="messageClick(this);">'

        var choices = ['Driving', 'Hiking', 'Biking', 'Not yet']

        for (var i = 0; i < choices.length; i++) {

            if (status == choices[i]) {
                popup += '<option selected value="' + choices[i] + '">' + choices[i] + '</option>'
            } else {
                popup += '<option value="' + choices[i] + '">' + choices[i] + '</option>'
                }
        }
    
        popup += '</select>'

        return popup

    }



})();

function messageClick(townStatus) {
    console.log(townStatus)
    var selectedText = townStatus.options[townStatus.selectedIndex].innerHTML;
    var status = townStatus.value;

    var town = townStatus.name
    console.log(town, status)



}