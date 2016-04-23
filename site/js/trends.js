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
var chartBody2;
var clip2;

// stable color scale
var color5 = d3.scale.ordinal()
    .domain(["donald trump wife", "donald trump immigration", "make america great again", "donald trump wall",
  "ted cruz canada", "ted cruz immigration", "ted cruz wife", "ted cruz zodiac killer",
  "hillary for america", "hillary clinton email", "hillary clinton benghazi", "hillary clinton snl",
  "feel the bern", "bernie sanders old", "bernie sanders bird", "bernie sanders socialist",
  "john kasich ohio", "john kasich wife"])
    .range([
        //trump
        "#31a354", "#74c476", "#a1d99b", "#c7e9c0",

        //cruz
        "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2",

        //hillary
        "#3182bd", "#6baed6", "#9ecae1", "#c6dbef",

        //bernie
        "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb",

        //kasich
        "#636363", "#969696"
          ]);

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
var legend2;
var indicator;

// initialize data
    // max and min date
    var formatDate = d3.time.format("%Y-%m-%d");
    var max_date = formatDate.parse("2016-04-01");
    var min_date = formatDate.parse("2015-10-25");
    var initialExtent = [min_date, max_date];
loadData4(initialExtent);

function checkExtent(brushExtent)
{
    var localExtent;

    if (brushExtent[1] - brushExtent[0] == 0)
    {
        localExtent = initialExtent;
    }
    else
        localExtent = brushExtent;

    loadData4(localExtent);

}


function trendsPlaceholderText(){
    svg4.append("text")
        .attr("id", "trendsPlaceholderText")
        .attr("x", width4/2)
        .attr("y", height4/2)
        .attr("text-anchor", "middle")
        .text("Select search terms on the right to display more information");
}

function loadData4(extent){
    extent = typeof extent !== 'undefined' ? extent : initialExtent;

    $.when(window.dataReady.vis2).then(function(){
        if(!vis2 || !window.vis2) console.log("error: dataDriver not intialized before maps.js");

        var data = vis2.search;
        console.log(data);

        getCheckboxSelection(data, extent);

    });

}

function getCheckboxSelection(data, extent){
    svg4.selectAll("path").remove();
    svg4.selectAll("g").remove();
    svg4.selectAll('.legend2').remove();

    var localData = data;

    //console.log($('input[name=checkbox]:checked').map(function () { return this.value; }).toArray());
    var checkboxSelection = $('input[name=checkbox]:checked').map(function () { return this.value; }).toArray();

    if (checkboxSelection[0] != undefined)
    {
        svg4.selectAll('#trendsPlaceholderText').remove();
        indicator = 0;

        var checked = $('#show_events').prop('checked');
        if (checked == true)
        {
            chartBody.selectAll(".eventsRectangle").remove();
            chartBody2.selectAll(".eventsRectangle2").remove();
            chartBody.selectAll(".eventsBox").remove();
            chartBody2.selectAll(".eventsBox2").remove();
            loadData5();
        }
    }

    else
    {
        trendsPlaceholderText();
        svg4.selectAll(".eventsRectangle2").remove();
        indicator = 1;
    }


    formatData2(localData, checkboxSelection, extent);

}

function formatData2(data, domain, extent){
    var localData = data;
    var formatDate = d3.time.format("%Y-%m-%d");

    color.domain(domain);

    //color.domain(["donald trump wife", "donald trump immigration", "make america great again", "donald trump wall",
      //  "ted cruz canada", "ted cruz immigration", "ted cruz wife", "ted cruz zodiac killer",
      //  "hillary for america", "hillary clinton email", "hillary clinton benghazi", "hillary clinton snl",
      //  "feel the bern", "bernie sanders old", "bernie sanders bird", "bernie sanders socialist",
      //  "john kasich ohio", "john kasich wife"]);

    var politicians = color.domain().map(function(name){
        return{
            name: name,
            values: localData[name].map(function(d){
                return {date: formatDate.parse(d.date), search: d.value}
            })
        }
    });

    updateTrendsDomain(politicians, extent);

}

function updateTrendsDomain(data, extent) {
    var politician = data;

    // update domains
    console.log(extent);
    x2.domain(extent);
    y2.domain([
        d3.min(politician, function (p) {
            return d3.min(p.values, function (v) {
                return v.search;
            });
        }),
        d3.max(politician, function (p) {
            return d3.max(p.values, function (v) {
                return v.search;
            });
        })
    ]);

   updateTrendsAxes(politician);
}

function updateTrendsAxes(data) {
    // Axis Groups
    var xAxisGroup4 = svg4.append("g")
        .attr("class", "x-axis axis");
    var yAxisGroup4 = svg4.append("g")
        .attr("class", "y-axis axis");

    // call axes
    svg4.select(".x-axis")
        .attr("transform", "translate(0, " + height4 + ")")
        .transition()
        .call(xAxis4);
    svg4.select(".y-axis")
        .transition()
        .call(yAxis4);

    clip2 = svg4.append("svg:clipPath")
        .attr("id", "clip2")
        .append("svg:rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width4)
        .attr("height", height4);

    chartBody2 = svg4.append("g")
        .attr("clip-path", "url(#clip2)");

    drawTrendsLines(data);
}

function drawTrendsLines(data){

    line = d3.svg.line()
        .interpolate("bundle")
        .x(function (d) {
            return x2(d.date);
        })
        .y(function (d) {
            return y2(d.search);
        });

    var politicians = chartBody2.selectAll(".politician")
        .data(data)
        .enter().append("g")
        .attr("class", "politician");

    politicians.append("path")
        .attr("class", "line")
        .attr("d", function(d){return line(d.values);})
        .attr("data-legend", function(d){return d.name;})
        .style("stroke", function(d) { return color5(d.name); });

    if (indicator != 1) {
        legend2 = svg4.append("g")
            .attr("class", "legend2")
            .attr("transform", "translate(50,30)")
            .style("font-size", "12px")
            .call(d3.legend);
    }

    /*politicians.append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.search) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.name;});*/

}