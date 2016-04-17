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

// color scale
var color = d3.scale.category20();

// Scales
var x2 = d3.time.scale()
    .range([0, width4]);
var y2 = d3.scale.linear()
    .range([height4, 0]);

// Initialize Axes for both graphs
var xAxis4 = d3.svg.axis()
    .scale(x2)
    .orient("bottom");
var yAxis4 = d3.svg.axis()
    .scale(y2)
    .orient("left");

// initialize line graph
var line;

// initialize data
loadData4();

function loadData4(){

    $.when(window.dataReady.vis2).then(function(){
        if(!vis2 || !window.vis2) console.log("error: dataDriver not intialized before maps.js");

        var test = vis2.search;
        console.log(test);

        formatData2(test);

    });

}

function formatData2(data){

    var localData = data;

    var formatDate = d3.time.format("%Y-%m-%d");

    color.domain(["donald trump wife", "donald trump immigration", "make america great again", "donald trump wall",
        "ted cruz canada", "ted cruz immigration", "ted cruz wife", "ted cruz zodiac killer",
        "hillary for america", "hillary clinton email", "hillary clinton benghazi", "hillary clinton snl",
        "feel the bern", "bernie sanders old", "bernie sanders bird", "bernie sanders socialist",
        "john kasich ohio", "john kasich wife"]);

    var politicians = color.domain().map(function(name){
        return{
            name: name,
            values: localData[name].map(function(d){
                return {date: formatDate.parse(d.date), search: d.value}
            })
        }
    });

    updateTrends(politicians);

}

function updateTrends(data){

    line = d3.svg.line()
        .interpolate("linear")
        .x(function(d) { return x2(d.date); })
        .y(function(d) { return y2(d.search);});

    var formatDate = d3.time.format("%Y-%m-%d");
    var politician = data;

    // max and min date
    var max_date = formatDate.parse("2016-04-01");
    var min_date = formatDate.parse("2016-01-03");

    // update domains
    x2.domain([min_date, max_date]);
    y2.domain([
        d3.min(politician, function(p) { return d3.min(p.values, function(v) { return v.search; }); }),
        d3.max(politician, function(p) { return d3.max(p.values, function(v) { return v.search; }); })
    ]);

    // Axis Groups
    var xAxisGroup4 = svg4.append("g")
        .attr("class", "x-axis axis");
    var yAxisGroup4 = svg4.append("g")
        .attr("class", "y-axis axis");

    // call axes
    svg4.select(".x-axis")
        .attr("transform", "translate(0, "+ height4 + ")")
        .transition()
        .call(xAxis4);
    svg4.select(".y-axis")
        .transition()
        .call(yAxis4);

    var politicians = svg4.selectAll(".politician")
        .data(politician)
        .enter().append("g")
        .attr("class", "politician");

    politicians.append("path")
        .attr("class", "line")
        .attr("d", function(d){return line(d.values);})
        .style("stroke", function(d) { return color(d.name); });

    /*politicians.append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.search) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.name;});*/



}

