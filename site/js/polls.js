// margins
var margin = {top: 20, right:50, bottom:140, left:50};

// Sets width and height elements of graphs
var width3 = $("#polls").parent().width() - margin.left - margin.right,
    height3 = 350 - margin.top - margin.bottom;

var margin2 = {top: 0, right: 50, bottom: 20, left:50};

var height3_2 = 85 - margin2.top - margin2.bottom;


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
var x1_2 = d3.time.scale()
    .range([0, width3]);
var y1 = d3.scale.linear()
    .range([height3, 0]);
var y1_2 = d3.scale.linear()
    .range([height3_2, 0]);

// brush
var brush = d3.svg.brush()
    .x(x1_2)
    .on("brush", brushed);

// color scale
var color4 = d3.scale.ordinal()
    .domain(["Cruz", "Kasich", "Trump", "Clinton", "Sanders"])
    .range(["#e6550d", "#636363" , "#31a354", "#3182bd", "#9e9ac8"]);


// Initialize Axes for both graphs
var xAxis3 = d3.svg.axis()
    .scale(x1)
    .orient("bottom");
var xAxis3_2 = d3.svg.axis()
    .scale(x1_2)
    .orient("bottom");
var yAxis3 = d3.svg.axis()
    .scale(y1)
    .orient("left");
var yAxis3_2 = d3.svg.axis()
    .scale(y1_2)
    .orient("left");

// initialize line graph
var line;
var line2;
var legend3;
var clip;
var chartBody;
var context;

// initialize data
var candidateArray = ["Clinton", "Sanders", "Trump", "Cruz", "Kasich"];

var formatDate = d3.time.format("%Y-%m-%d");
var max_date = formatDate.parse("2016-04-01");
var min_date = formatDate.parse("2015-10-25");
var startDateSpan = [min_date, max_date];

loadData3(candidateArray, startDateSpan);

function loadData3(domain, datedomain){

    $.when(window.dataReady.vis2).then(function(){
        if(!vis2 || !window.vis2) console.log("error: dataDriver not intialized before maps.js");

        var data = vis2.polls;

        var localDomain = domain;
        formatData(data, localDomain, datedomain);
        showContext(data, candidateArray);

    });

}

function getCandidateSelection(extent)
{

    var checkboxSelection2 = $('input[name=checkbox2]:checked').map(function () { return this.value; }).toArray();
    console.log(checkboxSelection2);

    var candidateArray2;

    if (checkboxSelection2 != undefined && checkboxSelection2 != 0 ) {
        candidateArray2 = checkboxSelection2;
    }
    else
    {
        candidateArray2 = candidateArray;
    }

    svg3.selectAll("path").remove();
    //svg3.selectAll("g").remove();
    context.selectAll("g").remove();
    svg3.selectAll('.legend3').remove();


    console.log(candidateArray2);
    loadData3(candidateArray2, extent);

}


function formatData(data, domain, datedomain){
    var localData = data;
    var formatDate = d3.time.format("%Y-%m-%d");

    // color.domain(["Clinton", "Sanders", "Trump", "Cruz", "Kasich"]);

    var politicians = domain.map(function(name){
        return{
            name: name,
            values: localData[name].map(function(d){
                return {date: formatDate.parse(d.date), rating: d.value}
            })
        }
    });

    updatePollsDomain(politicians, datedomain);
}

function updatePollsDomain(data, datedomain){

    x1.domain(datedomain);
    //x1.domain(d3.extent(data[0].values, function(d){return d.date;}));
    y1.domain([
        d3.min(data, function(p) { return d3.min(p.values, function(v) { return v.rating; }); }),
        d3.max(data, function(p) { return d3.max(p.values, function(v) { return v.rating; }); })
    ]);

    updatePollsAxes(data);
}

function updatePollsAxes(data, datedomain){

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
        .interpolate("bundle")
        .x(function(d) {
            return x1(d.date); })
        .y(function(d) { return y1(d.rating);});

    var politicians = chartBody.selectAll(".politician")
        .data(data)
        .enter().append("g")
        .attr("class", "politician");

    politicians.append("path")
        .attr("class", "line")
        .attr("d", function(d){return line(d.values);})
        .attr("data-legend", function(d){return d.name;})
        .style("stroke", function(d) { return color4(d.name); });

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

function showContext(data, candidateArray) {
    var formatDate = d3.time.format("%Y-%m-%d");
    var localData = data;

    var politicians = candidateArray.map(function (name) {
        return {
            name: name,
            values: localData[name].map(function (d) {
                return {date: formatDate.parse(d.date), rating: d.value}
            })
        }
    });

    console.log(politicians);

    updateContextDomain(politicians);

}

function updateContextDomain(data)
{
    var formatDate = d3.time.format("%Y-%m-%d");
    var politician = data;

    // max and min date
    var max_date = formatDate.parse("2016-04-01");
    var min_date = formatDate.parse("2015-10-25");

    // update domains
    x1_2.domain([min_date, max_date]);
    y1_2.domain([
        d3.min(politician, function (p) {
            return d3.min(p.values, function (v) {
                return v.rating;
            });
        }),
        d3.max(politician, function (p) {
            return d3.max(p.values, function (v) {
                return v.rating;
            });
        })
    ]);

    showContextUpdateAxes(politician);

}

function showContextUpdateAxes(data) {

    context = svg3.append("g")
        .attr("class", "context")
        .attr("transform", "translate(0, 240)");

    var xAxisGroup3_2 = context.append("g")
        .attr("class", "x-axis1_2 axis");

    context.select(".x-axis1_2")
        .attr("transform", "translate(0, "+height3_2+")")
        .transition()
        .call(xAxis3_2);

    context.append("svg:path")
        .datum(data)
        .attr("class", "line2")
        .attr("d", line2);

    context.append("g")
        .attr("class", "x brush x_brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", height3_2 + 7);

    drawContextLines(data);

}

function drawContextLines(data){

    line2 = d3.svg.line()
        .interpolate("bundle")
        .x(function(d) { return x1_2(d.date); })
        .y(function(d) { return y1_2(d.rating);});

    var politiciansContext = context.selectAll(".politicianContext")
        .data(data)
        .enter().append("g")
        .attr("class", "politicianContext");

    politiciansContext.append("path")
        .attr("class", "line2")
        .attr("d", function(d){return line2(d.values);})
        .style("stroke", function(d) { return color4(d.name); });

}

function resetVisualization2(){

    brush.clear();
    removeEvents();
    svg3.selectAll("path").remove();
    svg3.selectAll("g").remove();
    svg3.selectAll('.legend3').remove();
    context.selectAll("g").remove();
    d3.selectAll(".image_button").classed("grey-out", false);

    loadData3(candidateArray, startDateSpan);

    svg4.selectAll(".politician").remove();
    svg4.selectAll('.legend2').remove();

    $('input:checkbox').removeAttr('checked');
    // document.getElementById("ch1").checked = false;
    // document.getElementById("ch2").checked = false;
    // document.getElementById("ch3").checked = false;
    // document.getElementById("ch4").checked = false;
    // document.getElementById("ch5").checked = false;
    // document.getElementById("ch6").checked = false;
    // document.getElementById("ch7").checked = false;
    // document.getElementById("ch8").checked = false;
    // document.getElementById("ch9").checked = false;
    // document.getElementById("ch10").checked = false;
    // document.getElementById("ch11").checked = false;
    // document.getElementById("ch12").checked = false;
    // document.getElementById("ch13").checked = false;
    // document.getElementById("ch14").checked = false;
    // document.getElementById("ch15").checked = false;
    // document.getElementById("ch16").checked = false;
    // document.getElementById("ch17").checked = false;
    // document.getElementById("ch18").checked = false;

    // $('#Clinton').css('opacity', 0.65);
    // $('#Sanders').css('opacity', 0.65);
    // $('#Cruz').css('opacity', 0.65);
    // $('#Trump').css('opacity', 0.65);
    // $('#Kasich').css('opacity', 0.65);

    // document.getElementById("Clinton_select").checked = false;
    // document.getElementById("Sanders_select").checked = false;
    // document.getElementById("Cruz_select").checked = false;
    // document.getElementById("Trump_select").checked = false;
    // document.getElementById("Kasich_select").checked = false;
    
    trendsPlaceholderText();
}

function checkExtent2(brushExtent)
{
    var localExtent;

    if (brushExtent[1] - brushExtent[0] == 0)
    {
        localExtent = startDateSpan;
    }
    else
        localExtent = brushExtent;

    candidateSelection(localExtent);

}

function candidateSelection(extent) {

    // check checkbox id
    var checkImgId = "#" + $(event.target)[0].id;
    var checkId = "#" + $(event.target)[0].id + "_select";
    console.log(checkId);

    var checked = $(checkId).prop('checked');
    console.log(checked);

    if (checked == false) {
        $(checkId).prop('checked', true);
        d3.select(checkImgId).classed("grey-out", true);
        // $(checkImgId).css('opacity', 1);

    }
    else if (checked == true) {
        $(checkId).prop('checked', false);
        d3.select(checkImgId).classed("grey-out", false);
        // $(checkImgId).css('opacity', 0.65);
    }

    var test = $(checkId).prop('checked');

    console.log(test);
    getCandidateSelection(extent);
}

function brushed() {
    var newDomain = brush.extent();
    console.log(newDomain);

    svg3.selectAll("path").remove();
    svg3.selectAll("g").remove();
    svg3.selectAll('.legend3').remove();

    getCandidateSelection(newDomain);
    //loadData3(candidateArray, newDomain);
    svg4.selectAll('#trendsPlaceholderText').remove()
    loadData4(newDomain)

}