// margins
var margin = {top: 20, right:50, bottom:20, left:50};

// Sets width and height elements of graphs
var width3 = $("#polls").parent().width() - margin.left - margin.right,
    height3 = 310 - margin.top - margin.bottom;

// Initialize SVG elements
var svg3 = d3.select("#polls")
    .append("svg")
    .attr("width", width3 + margin.left + margin.right)
    .attr("height", height3 + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Date parser (https://github.com/mbostock/d3/wiki/Time-Formatting)
var formatDate = d3.time.format("%m-%d");

// Scales
var x = d3.time.scale()
    .range([0, width3]);
var y = d3.scale.linear()
    .range([height3, 0]);

// Initialize Axes for both graphs
var xAxis3 = d3.svg.axis()
    .scale(x)
    .orient("bottom");
var yAxis3 = d3.svg.axis()
    .scale(y)
    .orient("left");

// Axis Groups
var xAxisGroup = svg3.append("g")
    .attr("class", "x-axis axis");
var yAxisGroup = svg3.append("g")
    .attr("class", "y-axis axis");


// initialize data
loadData3();

var data;

// initialize line graph
var lineGraph = svg3.append("path");

function loadData3(){

    d3.csv("data/polls_test_data.csv",function(error, csv){
        csv.forEach(function(d){
            // convert to time object
            d.Date = formatDate.parse(d.Date);

            // convert to numbers
            d.Hillary = +d.Hillary;
            d.Bernie = +d.Bernie;
            d.Trump = +d.Trump;
            d.Cruz = +d.Cruz;
            d.Kasich = +d.Kasich;

        });

        data = csv;

        console.log(data);

        updatePolls();
    });
}

function updatePolls(){


    var localData = data;

    // get input value from selected candidate

    // max and min time
    var max_date = d3.max(localData, function(d){return d.Date;});
    var min_date =  d3.min(localData, function(d){return d.Date;});

    // update domains
    x.domain([min_date, max_date]);
    y.domain([0, d3.max(localData, function(d){return d.Hillary;})]);

    // call axes
    svg3.select(".x-axis")
        .attr("transform", "translate(0, "+ height3 + ")")
        .transition()
        .call(xAxis3);
    svg3.select(".y-axis")
        .transition()
        .call(yAxis3);

    var line = d3.svg.line();

    line
        .x(function(d){return x(d.Date)})
        .y(function(d){return y(d.Hillary)})
        .interpolate("linear");

    lineGraph
        .attr("opacity", 1)
        .transition()
        .attr("d", line(localData))
        .attr("fill", "none")
        .attr("class", "line");





}



