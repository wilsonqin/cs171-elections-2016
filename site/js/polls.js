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
var color2 = d3.scale.category10();

// Initialize Axes for both graphs
var xAxis3 = d3.svg.axis()
    .scale(x1)
    .orient("bottom");
var yAxis3 = d3.svg.axis()
    .scale(y1)
    .orient("left");

// initialize line graph
var line;
var legend3;
var clip;
var chartBody;

// initialize data
var candidateArray = ["Clinton", "Sanders", "Trump", "Cruz", "Kasich"];
loadData3(candidateArray);

function loadData3(domain){

    $.when(window.dataReady.vis2).then(function(){
        if(!vis2 || !window.vis2) console.log("error: dataDriver not intialized before maps.js");

        var data = vis2.polls;

        var localDomain = domain;

        formatData(data, localDomain);

    });

}

function getCandidateSelection()
{
    var candidateSelection = $(event.target)[0].id;
    var candidateArray2;

    if (candidateSelection != undefined) {
        candidateArray2 = [];
        candidateArray2.push(candidateSelection);
    }

    svg3.selectAll("path").remove();
    svg3.selectAll("g").remove();
    svg3.selectAll('.legend3').remove();

    loadData3(candidateArray2);

}


function formatData(data, domain){

    var localData = data;
    var formatDate = d3.time.format("%Y-%m-%d");

    color2.domain(domain);

    // color.domain(["Clinton", "Sanders", "Trump", "Cruz", "Kasich"]);

    var politicians = color2.domain().map(function(name){
        return{
            name: name,
            values: localData[name].map(function(d){
                return {date: formatDate.parse(d.date), rating: d.value}
            })
        }
    });

    updatePollsDomain(politicians);

}

function updatePollsDomain(data){

    var formatDate = d3.time.format("%Y-%m-%d");
    var max_date = formatDate.parse("2016-04-01");
    var min_date = formatDate.parse("2016-01-03");

    x1.domain([min_date, max_date]);
    //x1.domain(d3.extent(data[0].values, function(d){return d.date;}));
    y1.domain([
        d3.min(data, function(p) { return d3.min(p.values, function(v) { return v.rating; }); }),
        d3.max(data, function(p) { return d3.max(p.values, function(v) { return v.rating; }); })
    ]);

    updatePollsAxes(data);
}

function updatePollsAxes(data){

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


    clip = svg3.append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width3)
        .attr("height", height3);

    chartBody = svg3.append("g")
        .attr("clip-path", "url(#clip)");

    chartBody.append("svg:path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);


    drawPollLines(data);
}

function drawPollLines(data){

    line = d3.svg.line()
        .interpolate("linear")
        .x(function(d) { return x1(d.date); })
        .y(function(d) { return y1(d.rating);});

    var politicians = chartBody.selectAll(".politician")
        .data(data)
        .enter().append("g")
        .attr("class", "politician");

    politicians.append("path")
        .attr("class", "line")
        .attr("d", function(d){return line(d.values);})
        .attr("data-legend", function(d){return d.name;})
        .style("stroke", function(d) { return color2(d.name); });

    legend3 = svg3.append("g")
        .attr("class", "legend3")
        .attr("transform","translate(50,30)")
        .style("font-size","12px")
        .call(d3.legend);

    /*politicians.append("text")
     .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
     .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.rating) + ")"; })
     .attr("x", 3)
     .attr("dy", ".35em")
     .text(function(d) { return d.name;});*/

}

function resetVisualization2(){
    removeEvents();
    svg3.selectAll("path").remove();
    svg3.selectAll("g").remove();
    svg3.selectAll('.legend3').remove();

    loadData3(candidateArray);

    svg4.selectAll(".politician").remove();
    svg4.selectAll('.legend2').remove();
    document.getElementById("ch1").checked = false;
    document.getElementById("ch2").checked = false;
    document.getElementById("ch3").checked = false;
    document.getElementById("ch4").checked = false;
    document.getElementById("ch5").checked = false;
    document.getElementById("ch6").checked = false;
    document.getElementById("ch7").checked = false;
    document.getElementById("ch8").checked = false;
    document.getElementById("ch9").checked = false;
    document.getElementById("ch10").checked = false;
    document.getElementById("ch11").checked = false;
    document.getElementById("ch12").checked = false;
    document.getElementById("ch13").checked = false;
    document.getElementById("ch14").checked = false;
    document.getElementById("ch15").checked = false;
    document.getElementById("ch16").checked = false;
    document.getElementById("ch17").checked = false;
    document.getElementById("ch18").checked = false;
    
    trendsPlaceholderText();

}
