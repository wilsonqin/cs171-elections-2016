// margins
var margin = {top: 20, right:50, bottom:20, left:50};

// Sets width and height elements of graphs
var width4 = $("#trends").parent().width() - margin.left - margin.right,
    height4 = 310 - margin.top - margin.bottom;

// Initialize SVG elements
var svg4 = d3.select("#trends")
    .append("svg")
    .attr("width", width4 + margin.left + margin.right)
    .attr("height", height4 + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Date parser (https://github.com/mbostock/d3/wiki/Time-Formatting)
var formatDate = d3.time.format("%Y");

// Scales
var x = d3.time.scale()
    .range([0, width4]);
var y = d3.scale.linear()
    .range([height4, 0]);

// Initialize Axes for both graphs
var xAxis4 = d3.svg.axis()
    .scale(x)
    .orient("bottom");
var yAxis4 = d3.svg.axis()
    .scale(y)
    .orient("left");

// Axis Groups
var xAxisGroup = svg4.append("g")
    .attr("class", "x-axis axis");
var yAxisGroup = svg4.append("g")
    .attr("class", "y-axis axis");

// initialize line graph


// initialize data
loadData4();

function loadData4(){


    updatePolls2();
}

function updatePolls2(){

    // get input value from selected candidate

    // max and min time
    var max_date;
    var min_date;

    // update domains
    x.domain();
    y.domain();

    // call axes

    svg4.select(".x-axis")
        .attr("transform", "translate(0, "+ height4 + ")")
        .transition()
        .call(xAxis4);

    svg4.select(".y-axis")
        .transition()
        .call(yAxis4);



}

