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

        meanData.getProfile()
            .success(function(data) {
                vm.user = data
                tabulateUserStats($scope)
                initD3($scope)
                updateData($scope)
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

            updateData($scope)
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

    }

        function mouseover($scope) {
            var div = d3.select('.tooltip')
            //console.log(div)
            console.log('mouseover')
            div.style("display", "inline");
        }

        function mousemove($scope, d) {
            var div = d3.select('.tooltip')
            console.log('mousemove')
            div
                .text('test: ok')
                // .text(d.y + ': ' + d.x)
                .style("opacity", 1)
                .style("left", (d3.event.pageX - 34) + "px")
                .style("top", (d3.event.pageY - 12) + "px");
        }

        function mouseout($scope) {
            console.log('mouseout')
            var div = d3.select('.tooltip')
            div.style("display", "none");
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

    function updateData($scope) {

        var colours = ['#ff7f00', '#377eb8', '#e41a1c', '#999999']
        var input_data = []
        var xOffset = 0

        //Process the data
        var value_list = [$scope.vm.user.local.hiking, 
                          $scope.vm.user.local.biking,
                          $scope.vm.user.local.driving,
                          $scope.vm.user.local.not_yet]

        console.log(value_list)

        for(var i = 0; i < value_list.length; i++) {
            var datum = {
                value : value_list[i],
                colour : colours[i],
                y: 0,
                x: xOffset

            }
            xOffset += value_list[i]
            input_data.push(datum)      
        }

        var bar = $scope.g.selectAll(".bar")
            .data(input_data, function(d) { return d.name; });

        // new data:
        bar.enter().append("rect")
            .attr("height", 18)
            .attr("x", function(d) {return d.x})
            .style("fill", function(d) { return d.colour; })
            .attr('x', function(d) {
                console.log(d)
                return $scope.xScale(d.x);
            })
            .attr('y', function(d, i) {
                return $scope.yScale(d.y);
            })
            .attr('width', function(d) {
                console.log($scope.xScale(d.value))
                return $scope.xScale(d.value);
            })

            .on('mouseover', mouseover)
            .on("mousemove", function(d) {
                mousemove(d)
            })
            .on("mouseout", mouseout);

    };


    function initD3($scope) {

        var margins = {
                top: 12,
                left: 0,
                right: 0,
                bottom: 25
            },
            width = window.innerWidth,
            width = width - margins.left - margins.right,
            height = 50 - margins.top - margins.bottom


        var svg = d3.select("#chart")
            .attr('width', width)
            .attr("height", height)

        $scope.xScale = d3.scaleLinear()
            .domain([0, 251])
            .range([0, width]),

        $scope.yScale = d3.scaleBand()
            .rangeRound([0, height], .1)

        $scope.g = svg.append("g")

        d3.select("#chart").append("div")
            .attr("class", "tooltip")   
            .style("display", "inline");



        //     groups = svg.selectAll('g')
        //     .attr("id", "bargroups")
        //     .data(dataset)
        //     .enter()
        //     .append('svg')
        //     .style('fill', function(d, i) {
        //       var colors = ['#ff7f00', '#377eb8', '#e41a1c', '#999999']
        //       return colors[i];
        //     }),

        //     rects = groups.selectAll('rect')
        //     .data(function(d) {
        //         return d;
        //     })
        //     .enter()
        //     .append('rect')
        //     .attr("id", "barrects")
        //     .attr('x', function(d) {
        //         console.log('d')
        //         console.log(d)
        //         return xScale(d.x0);
        //     })
        //     .attr('y', function(d, i) {
        //         return yScale(d.y);
        //     })
        //     .attr('height', function(d) {
        //         return yScale.rangeBand();
        //     })
        //     .attr('width', function(d) {
        //         return xScale(d.x);
        //     })
        //     .on('mouseover', mouseover)
        //     .on("mousemove", function(d) {
        //         mousemove(d)
        //     })
        //     .on("mouseout", mouseout);

        // $scope.svg = svg

        // var div = d3.select("#chart").append("div")
        //     .attr("class", "tooltip")
        //     .style("display", "none");

        // function mouseover() {
        //     div.style("display", "inline");
        // }

        // function mousemove(d) {
        //     div
        //         .text(d.y + ': ' + d.x)
        //         .style("opacity", 1)
        //         .style("left", (d3.event.pageX - 34) + "px")
        //         .style("top", (d3.event.pageY - 12) + "px");
        // }

        // function mouseout() {
        //     div.style("display", "none");
        // }
    };




})();