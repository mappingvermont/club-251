(function () {

  angular
    .module('meanApp')
    .directive('leaderboard', leaderboard);

  function leaderboard () {
    return {
      restrict: 'EA',
       scope: {
          data: '=',
          onClick: '&'
      },
      templateUrl: '/common/directives/leaderboard/leaderboard.template.html',
       link: function(scope, iElement, iAttrs) {

        var tip = d3.tip()
              .attr('class', 'd3-tip')
              // .offset([-10, -60])
              .html(function(d) {
            return "Loading . . .";
          })

        initD3(scope, iElement, tip);
        // updateData(scope, iElement, tip)

        scope.$watch('data', function(newValue, oldValue) {
                if (newValue) {
                    updateData(scope, tip)
                    // console.log("I see a data change!")
                  };
            }, true);

    }

    };
  }

  function initD3($scope, iElement, tip) {

        // console.log('initD3')
        // console.log($scope)

        var margins = {
                top: 12,
                left: 0,
                right: 0,
                bottom: 25
            },
            width = window.innerWidth,
            width = width - margins.left - margins.right,
            height = 50 - margins.top - margins.bottom


        var svg = d3.select(iElement[0]).select("#chart")
            .attr('width', width)
            .attr("height", height)

        tip.html(function(d) {
            return d.transit_type + ": " + d.value;
          })
              
        svg.call(tip);

        $scope.xScale = d3.scaleLinear()
            .domain([0, 251])
            .range([0, width]),

        $scope.yScale = d3.scaleBand()
            .rangeRound([0, height], .1)

        $scope.g = svg.append("g")

        var tooltip = d3.select(iElement[0]).select("#chart").append("div")
            .attr("class", "tooltip")   
            // .style("display", "inline");
            .style("display", "none");

};

function updateData($scope, tip) {

        var colours = ['#ff7f00', '#377eb8', '#e41a1c', '#999999']
        var input_data = []
        var xOffset = 0

        //Process the data
        var value_list = [$scope.data.hiking, 
                          $scope.data.biking,
                          $scope.data.driving,
                          $scope.data.not_yet]

        var type_list = ['Hiking', 'Biking', 'Driving', 'Not yet']

        for(var i = 0; i < value_list.length; i++) {
            var datum = {
                value : value_list[i],
                colour : colours[i],
                transit_type: type_list[i],
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
            .attr("transit_type", function(d) {
              return d.transit_type})
            .attr("x", function(d) {
              return d.x})
            .style("fill", function(d) { return d.colour; })
            .attr('x', function(d) {
                return $scope.xScale(d.x);
            })
            .attr('y', function(d, i) {
                return $scope.yScale(d.y);
            })
            .attr('width', function(d) {
                return $scope.xScale(d.value);
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)

    };


})();