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

// Scales
var x1 = d3.time.scale()
    .range([0, width3]);
var y1 = d3.scale.linear()
    .range([height3, 0]);

// color scale
var color = d3.scale.category10();

// Initialize Axes for both graphs
var xAxis3 = d3.svg.axis()
    .scale(x1)
    .orient("bottom");
var yAxis3 = d3.svg.axis()
    .scale(y1)
    .orient("left");

// initialize line graph
var line;

// initialize data
loadData3();

function loadData3(){

    $.when(window.dataReady.vis2).then(function(){
        if(!vis2 || !window.vis2) console.log("error: dataDriver not intialized before maps.js");

        var test = vis2.polls;

        formatData(test);

    });

}

function formatData(data){

    var localData = data;
    var formatDate = d3.time.format("%Y-%m-%d");

    color.domain(["Clinton", "Sanders", "Trump", "Cruz", "Kasich"]);

    var politicians = color.domain().map(function(name){
        return{
            name: name,
            values: localData[name].map(function(d){
                return {date: formatDate.parse(d.date), rating: d.value}
            })
        }
    });

    console.log(politicians);
    updatePolls(politicians);

}

function updatePolls(data2){
    var formatDate = d3.time.format("%Y-%m-%d");

    var politician = data2;

    updateDomain(politician);


}

function updateDomain(politician){


    x1.domain(d3.extent(politician[2].values, function(d){return d.date;}));
    y1.domain([
        d3.min(politician, function(p) { return d3.min(p.values, function(v) { return v.rating; }); }),
        d3.max(politician, function(p) { return d3.max(p.values, function(v) { return v.rating; }); })
    ]);

    updateAxes(politician);
}

function updateAxes(politician){

    // Axis Groups
    var xAxisGroup3 = svg3.append("g")
        .attr("class", "x-axis1 axis");
    var yAxisGroup3 = svg3.append("g")
        .attr("class", "y-axis1 axis");

    // call axes
    svg3.select(".x-axis1")
        .attr("transform", "translate(0, "+ height3 + ")")
        .transition()
        .call(xAxis3);
    svg3.select(".y-axis1")
        .transition()
        .call(yAxis3);

    drawLines(politician);
}

function drawLines(data){

    line = d3.svg.line()
        .interpolate("linear")
        .x(function(d) { return x1(d.date); })
        .y(function(d) { return y1(d.rating);});

    var politicians = svg3.selectAll(".politician")
        .data(data)
        .enter().append("g")
        .attr("class", "politician");

    politicians.append("path")
        .attr("class", "line")
        .attr("d", function(d){return line(d.values);})
        .style("stroke", function(d) { return color(d.name); });

    /*politicians.append("text")
     .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
     .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.rating) + ")"; })
     .attr("x", 3)
     .attr("dy", ".35em")
     .text(function(d) { return d.name;});*/

}

