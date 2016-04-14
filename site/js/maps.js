// Sets width and height elements of maps
var width1 = $("#choropleth1").parent().width(),
    width2 = $("#choropleth2").parent().width(),
    height = 500;

// Create a number of global variables
var centered,
    topoJSONdata,
    focusState,
    focusCounty,
    focusStateFacts,
    lastCountyColor;

// Create projection for map of USA
var projection = d3.geo.albersUsa()
    .scale(800)
    .translate([width1 / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

// Initialize SVG elements
var svg = d3.select("#choropleth1")
    .append("svg")
    .attr("width", width1)
    .attr("height", height)
    .attr("id", "choropleth-svg");

// Allows user to click background of map to zoom out
svg.append("rect")
    .attr("class", "background")
    .attr("width", width1)
    .attr("height", height)
    .on("click", clicked);

var svg2 = d3.select("#choropleth2")
    .append("svg")
    .attr("width", width2)
    .attr("height", height)
    .attr("id", "choropleth-svg2");

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var g = svg.append("g"),
    g2 = svg2.append("g");

// data to be populated by loadData
//var data;

// Create variables that hold values of selected elements
var selectedDemographicVal = "",
    selectedPartyVal = "";
var selectedDemographic = $("input[type='radio'][name='demographics']:checked");
var selectedParty = $("input[type='radio'][name='party']:checked");

// Set placeholder message on SVG2
demographicPlaceholderText();

loadData();

function loadData() {
    $.when(window.dataReady).then(function(){
        if(!vis1 || !window.vis1) console.log("error: dataDriver not intialized before maps.js");

        topoJSONdata = vis1.topoJSONdata;

        updateChoropleth(topoJSONdata);
    });
}

/* 
* returns county-by-county results for a state and party
*
* params:
*  -fipsCode (int or string)
*  -party (string)
*/
function getResultsByState(stateCode){
// TODO: validation that stateCode is valid

var results = window.primaryResults.get(stateCode);
return results;
}

function updateChoropleth(us) {
    g.append("g")
        .attr("id", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "county-boundary")
        .attr("id", function (d) { return String(d.id);})
        .on("click", countyclicked)
        .on("mouseover", showCountyTooltip)
        .on("mouseout", hideTooltip);

    g.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "state")
        .on("click", genNewState)
        .on("mouseover", showStateTooltip)
        .on("mouseout", hideTooltip);

    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function (a, b) {
            return a !== b;
        }))
        .attr("id", "state-borders")
        .attr("d", path);
}

function clicked(d) {
    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .6 / Math.max(dx / width1, dy / height),
        translate = [width1 / 2 - scale * x, height / 2 - scale * y];

    if (d && centered !== d) {
        centered = d;
    } else {
        var stateText = $("#stateText");
        stateText.text("");
        centered = null;
        scale = 1;
        translate = 0,0;
        g2.selectAll('path').remove();
        demographicPlaceholderText();

    }
    g.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

    g.transition()
        .duration(750)
        .style("stroke-width", .75 / scale + "px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

}

function countyclicked(d) {
    console.log('getCountyData: ', d.properties);
    alert(d.id);
}

function showCountyTooltip (d) {
    // track former county color to restore when tooltip leaves
    lastCountyColor = $("#" + d.id + "inset").css("fill");

    $("#" + d.id).css("fill", "orange");
    $("#" + d.id + "inset").css("fill", "orange");

    var results = d.properties.election.get(selectedParty.val());
    var winner = results ? results[0].candidate : "No winner / Data Missing";

    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip.html("<p>County: " + d.properties.name +"</p>" + "<p>"+ winner +"</p>")
        .style("left", (d3.event.pageX) +25 + "px")
        .style("top", (d3.event.pageY - 40) + "px");
}

function showStateTooltip (d) {
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip.html(d.properties.name)
        .style("left", (d3.event.pageX) +25 + "px")
        .style("top", (d3.event.pageY - 40) + "px");
}

function hideTooltip(d) {
    $("#" + d.id).css("fill", "#aaa");
    $("#" + d.id + "inset").css("fill", lastCountyColor);
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}

function genNewState(d) {
    clicked(d);

    if (selectedDemographic.length > 0) {
        selectedDemographicVal = selectedDemographic.val();
    }

    focusState = d.properties.code;

    var allCounties = topojson.feature(topoJSONdata, topoJSONdata.objects.counties);
    var filterCounties = allCounties.features.filter(function(datum) {
            if(!datum.properties.census){
                // counties that we don't have census data for

                //console.log(datum);
                return false;
            }

            return datum.properties.census.state_abbreviation === focusState;
        });

    // Calculate domain for the selected demographic census property for state's counties
    // Then we set a color scale
    var extent = d3.extent(filterCounties, function(d) { return d.properties.census[selectedDemographic.val()]; });
    var quantize = d3.scale.linear()
        .domain(extent)
        .range(colorbrewer.Blues[8]);

    g2.selectAll('path').remove();
    g2.selectAll('g').remove();
    svg2.selectAll('text').remove();

    var stateText = $("#stateText");
    stateText.text(d.properties.name);

    g2.append("path")
        .datum(d)
        .attr("d", path)
        .attr("class", "state")
        .attr("id", "focusState");

    g2.append("g")
        .attr("id", "selectedCounties")
        .selectAll("path")
        .data(filterCounties)
        .enter().append("path")
        .attr("fill", function(d) {
            return d.properties.census ? quantize(d.properties.census[selectedDemographic.val()]) : "gray"; 
        })
        .attr("d", path)
        .attr("id", function (d) {return String(d.id) + "inset";})
        //.attr("class", "countyInset")
        .on("mouseover", showCountyTooltip)
        .on("mouseout", hideTooltip)
        .on("click", countyclicked);



    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .9 / Math.max(dx / width2, dy / height),
        translate = [width2 / 2 - scale * x, height / 2 - scale * y];
    g2.transition()
        .duration(750)
        .style("stroke-width", .75 / scale + "px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
};

function demographicPlaceholderText(){
    svg2.append("text")
        .attr("id", "placeholderText")
        .attr("x", width2/2)
        .attr("y", height/2)
        .attr("text-anchor", "middle")
        .text("Select a state to the left to display more information");
}