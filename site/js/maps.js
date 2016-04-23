// Sets width and height elements of maps
var margin = {top: 50, right: 0, bottom: 50, left: 0},
    width1 = $("#choropleth1").parent().width(),
    width2 = $("#choropleth2").parent().width(),
    height = 500 - margin.bottom;

// Create a number of global variables
var centered,
    topoJSONdata,
    focusState,
    demographicMap,
    key,
    legend;

// Create projection for map of USA
var projection = d3.geo.albersUsa()
    .scale(800)
    .translate([width1 / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

// Initialize SVG elements
var svg = d3.select("#choropleth1")
    .append("svg")
    .attr("width", width1 + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("id", "choropleth-svg");


// Allows user to click background of map to zoom out
svg.append("rect")
    .attr("class", "background")
    .attr("width", width1)
    .attr("height", height)
    .on("click", clicked);

var svg2 = d3.select("#choropleth2")
    .append("svg")
    .attr("width", width2 + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("id", "choropleth-svg2");

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var g = svg.append("g"),
    g2 = svg2.append("g");

// Create variables that hold values of selected elements
var selectedDemographicVal = "",
    selectedPartyVal = "";
var selectedDemographic = $("#selectDemographic");
var selectedParty = $("input[type='radio'][name='party']:checked");
if (selectedDemographic.length > 0) {
    selectedDemographicVal = selectedDemographic.val();
}
if (selectedParty.length > 0) {
    selectedPartyVal = selectedParty.val();
}

// Set placeholder message on SVG2
demographicPlaceholderText();

loadData();

function loadData() {
    $.when(window.dataReady.vis1).then(function(){
        if(!vis1 || !window.vis1) console.log("error: dataDriver not intialized before maps.js");

        topoJSONdata = vis1.topoJSONdata;
        demographicMap = vis1.demographics;

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

var results = window.primaryResults.get(stateCode);
return results;
}

if (selectedPartyVal == "Republican"){
    var ordinalScale = d3.scale.ordinal()
    .domain(["Ted Cruz", "John Kasich", "Donald Trump", "Ben Carson", "Marco Rubio", "N/A"])
    .range(["#e6550d", "#636363" , "#31a354", "#54B6D6", "#FFF129", "#aaa"]);

}
else{
    var ordinalScale = d3.scale.ordinal()
    .domain(["Clinton", "Sanders", "N/A"])
    .range(["#3182bd", "#9e9ac8", "#aaa"]);
}


// var ordinalScale = d3.scale.category10();

function updateChoropleth(us) {
    g.selectAll('path').remove();
    g.selectAll('g').remove();
    svg.selectAll('text').remove();

    g.append("g")
        .attr("id", "counties");
    g.append("g")
        .attr("id", "states");
    
    d3.select("#counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "county-boundary")
        .attr("id", function (d) { return String(d.id);})
        .attr('fill', function(d, i) {
            var results = d.properties.election.get(selectedPartyVal);
            // if there is a winner, render its color, otherwise missing color is some set default
            // console.log(results ? results[0].candidate : "#aaa");
            var color = results ? ordinalScale(results[0].candidate) : "#aaa";
            return color;
        })
        .attr("data-legend", function(d,i){
            // console.log(d.properties.election)
            var results = d.properties.election ? d.properties.election.get(selectedPartyVal) : undefined;
            var winner = results ? results[0].candidate : "N/A";
            return winner;
        })
        .on("click", countyclicked)
        .on("mouseover", showCountyTooltip)
        .on("mouseout", hideTooltip);
    
    d3.select("#states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .attr("id", function (d) {
            return "state-" + d.id;
        })
        .attr("class", "state")
        .attr("fill", function(d,i){
            var results = d.properties.election ? d.properties.election.get(selectedPartyVal) : undefined;
            // if there is a winner, render its color, otherwise missing color is some set default TODO
            console.log(d.properties);
            var color = results ? ordinalScale(results[0].candidate) : "#aaa";
            return color;
        })
        .on("click", genNewState)
        .on("mouseover", showStateTooltip)
        .on("mouseout", hideTooltip);

    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function (a, b) {
            return a !== b;
        }))
        .attr("id", "state-borders")
        .attr("d", path);

    d3.selectAll('.legend').remove();
    legend = svg.append("g")
        .attr("class","legend")
        .attr("transform","translate(50,0)")
        .style("font-size","12px")
        .call(d3.legend)


    if (focusState){
        var selection = d3.select("#state-" + focusState.id)
        selection.classed("active", true);
    }
}

function clicked(d) {
    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .9 / Math.max(dx / width1, dy / height),
        translate = [width1 / 2 - scale * x, height / 2 - scale * y];

    if (d) {
        // Removed from if-statement: '&& centered !== d'
        centered = d;
        d3.select('#state-' + d.id)
            .classed("active", true);
    } else {
        g.selectAll("path")
            .classed("active", false);
        var stateText = $("#stateText");
        stateText.text("");
        centered = null;
        scale = 1;
        translate = 0,0;
        g2.selectAll('path').remove();
        d3.selectAll('.key').remove();
        demographicPlaceholderText();
        focusState = undefined;

    }
    // console.log(d, centered);
    g.selectAll("path")
        .classed("active", function(d) {
                return d === centered; });

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
    $("#" + d.id).css("opacity", ".5");
    $("#" + d.id).css("stroke", "black");
    $("#" + d.id + "inset").css("opacity", ".5");
    $("#" + d.id + "inset").css("stroke", "black");

    var results = d.properties.election.get(selectedPartyVal);
    var winner = results ? results[0].candidate : "No winner / Data Missing";

    tooltip.transition()
        .duration(200)
        .style("opacity", .9);

    tooltip.html("<h4>County: <b>" + d.properties.name +"</b></h4>" +
        "<div id='parent'><table class='hover-table' id='names-list'></table></div>")
        .style("left", (d3.event.pageX) +25 + "px")
        .style("top", (d3.event.pageY - 40) + "px");

    var list = $("#names-list");
    var parent = list.parent();
    if (results){
        list.detach().empty().each(function(i){
            var length;
            if (results.length > 5){
                length = 5;
            }
            else{
                length = results.length;
            }
            for (var x = 0; x < length; x++){
                $(this).append('<tr><th>' + results[x].candidateName + '</th><td>' + formatPercent(results[x].percent) + '</td></tr>');
                if (x == length - 1){
                    $(this).appendTo(parent);
                }
            }
        });
    }
    else {
        list.append("<p align='center'>No election data to display. :(</p>");
    }
}
function showCountyTooltipRight (d) {
    $("#" + d.id).css("opacity", ".5");
    $("#" + d.id).css("stroke", "black");
    $("#" + d.id + "inset").css("opacity", ".5");
    $("#" + d.id + "inset").css("stroke", "black");

    var censusData = (d.properties.census);
    var censusKeys = Object.keys(censusData);
    console.log(censusKeys.length);

    tooltip.transition()
        .duration(200)
        .style("opacity", .9);

    tooltip.html("<h4>County: <b>" + d.properties.name +"</b></h4>" +
            "<div id='parent'><table class='hover-table' id='names-list'></table></div>")
        .style("left", (d3.event.pageX) +25 + "px")
        .style("top", (d3.event.pageY - 40) + "px");

    var list = $("#names-list");
    var parent = list.parent();
    if (censusData){
        list.detach().empty().each(function(i){
            for (var x = 0; x < censusKeys.length; x++){
                $(this).append('<tr><th>' + censusKeys[x] + '</th><td>' + censusData[censusKeys[x]] + '</td></tr>');
                if (x == censusKeys.length - 1){
                    $(this).appendTo(parent);
                }
            }
        });
    }
    else {
        list.append("<p align='center'>No election data to display. :(</p>");
    }
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
    $("#" + d.id).css("opacity", "1");
    $("#" + d.id).css("stroke", "lightgrey");
    $("#" + d.id + "inset").css("opacity", "1");
    $("#" + d.id + "inset").css("stroke", "lightgrey");
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}

function genNewState(d) {
    focusState = d;
    clicked(focusState);


    var allCounties = topojson.feature(topoJSONdata, topoJSONdata.objects.counties);
    var filterCounties = allCounties.features.filter(function(datum) {
            if(!datum.properties.census){
                // counties that we don't have census data for

                //console.log(datum);
                return false;
            }

            return datum.properties.census.state_abbreviation === focusState.properties.code;
        });

    // Calculate domain for the selected demographic census property for state's counties
    // Then we set a color scale
    var extent = d3.extent(filterCounties, function(d) { return d.properties.census[selectedDemographicVal]; });
    var quantize = d3.scale.quantize()
        .domain(extent)
        .range(colorbrewer.Blues[9]);

    var x = d3.scale.linear()
        .domain(extent)
        .range([0, 300]);


    d3.selectAll('.key').remove();
    g2.selectAll('path').remove();
    g2.selectAll('g').remove();
    svg2.selectAll('text').remove();

    key = svg2.append("g")
        .attr("class", "key")
        .attr("transform", "translate(" + 50 + "," + ((height + margin.bottom) / 20 * 19) + ")");
    key.append("text")
        .attr("class", "caption")
        .attr("y", -6);

    var stateText = $("#stateText");
    stateText.text(d.properties.name);

    /************** DRAW LEGEND ****************/

    // an array of subranges for dividing our chloropleth legend
    var rangeThresholds = quantize.range().map(function(color) {
        var d = quantize.invertExtent(color);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
    });

    // minima of the subranges, for purpose of rendering ticks
    var minRangeThresholds = rangeThresholds.map(function(dom){ return dom[0]; });

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(14)
        .tickValues(minRangeThresholds)
        .tickFormat(function(d) {
            var prefix = d3.formatPrefix(d);
            return Math.round(prefix.scale(d)) + prefix.symbol;
        });

    key.selectAll("rect")
        .data(rangeThresholds)
        .enter().append("rect")
        .attr("height", 10)
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .style("fill", function(d) { return quantize(d[0]); });

    key.call(xAxis)
        .transition()
        .duration(750)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    key.selectAll(".caption")
        .transition()
        .duration(750)
        .text(demographicMap[selectedDemographicVal]);

    /***********************************/


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
        .attr("d", path)
        .attr("id", function (d) {return String(d.id) + "inset";})
        .attr("class", "countyInset")
        .attr("fill", function(d) {
            return d.properties.census ? quantize(d.properties.census[selectedDemographic.val()]) : "gray";
        })
        .on("mouseover", showCountyTooltipRight)
        .on("mouseout", hideTooltip)
        .on("click", countyclicked);


    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .8 / Math.max(dx / width2, dy / height),
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
$('#selectDemographic').change(
    function() {
        if (focusState){
            selectedDemographicVal = $('#selectDemographic').val();
            genNewState(focusState);
        }
    }
);

partyRadios = $("input[type='radio'][name='party']");
for(var i = 0, max = partyRadios.length; i < max; i++) {
    partyRadios[i].onclick = function() {
        selectedPartyVal = this.value;
        updateChoropleth(topoJSONdata);
    }
}

function formatPercent(number){
    var arr = number.toFixed(1);
    return String(arr)+"%";
}