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

// color scale
var color = d3.scale.category10();

// Initialize Axes for both graphs
var xAxis3 = d3.svg.axis()
    .scale(x)
    .orient("bottom");
var yAxis3 = d3.svg.axis()
    .scale(y)
    .orient("left");

// initialize line graph
var line = d3.svg.line()
    .interpolate("interpolate")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.rating);});

var data;
var politician;

// initialize data
loadData3();

function loadData3(){

    d3.csv("data/polls_test_data.csv",function(error, csv){
        csv.forEach(function(d){
            // convert to time object
            d.Date = formatDate.parse(d.Date);
        });

        color.domain(d3.keys(csv[0]).filter(function(key) { return key !== "Date"; }));

        politician = color.domain().map(function(name){
            return{
                name: name,
                values: csv.map(function(d){
                    return {date: d.Date, rating: +d[name]};
                })
            };

        });
        data = csv;
        console.log(politician);

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
    x.domain(d3.extent(localData, function(d){return d.Date;}));
    y.domain([
        d3.min(politician, function(p) { return d3.min(p.values, function(v) { return v.rating; }); }),
        d3.max(politician, function(p) { return d3.max(p.values, function(v) { return v.rating; }); })
    ]);

    // Axis Groups
    var xAxisGroup = svg3.append("g")
        .attr("class", "x-axis axis");
    var yAxisGroup = svg3.append("g")
        .attr("class", "y-axis axis");

    // call axes
    svg3.select(".x-axis")
        .attr("transform", "translate(0, "+ height3 + ")")
        .transition()
        .call(xAxis3);
    svg3.select(".y-axis")
        .transition()
        .call(yAxis3);

    var politicians = svg3.selectAll(".politician")
        .data(politician)
        .enter().append("g")
        .attr("class", "politician");

    politicians.append("path")
        .attr("class", "line")
        .attr("d", function(d){return line(d.values);})
        .style("stroke", function(d) { return color(d.name); });

    politicians.append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.rating) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.name;});


}

function test()
{
    console.log("hi");
}
