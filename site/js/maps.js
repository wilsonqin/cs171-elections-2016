// Sets width and height elements of maps
var _m = {
    margin : {top: 50, right: 0, bottom: 50, left: 0},
    width1 : $("#choropleth1").parent().width(),
    width2 : $("#choropleth2").parent().width()
};
_m.height = 500 - _m.margin.bottom;

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
    .translate([_m.width1 / 2, _m.height / 2]);

var path = d3.geo.path()
    .projection(projection);

// Initialize SVG elements
var svg = d3.select("#choropleth1")
    .append("svg")
    .attr("width", _m.width1 + _m.margin.left + _m.margin.right)
    .attr("height", _m.height + _m.margin.top + _m.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + _m.margin.left + "," + _m.margin.top + ")")
    .attr("id", "choropleth-svg");


// Allows user to click background of map to zoom out
svg.append("rect")
    .attr("class", "background")
    .attr("width", _m.width1)
    .attr("height", _m.height)
    .on("click", clicked);

var svg2 = d3.select("#choropleth2")
    .append("svg")
    .attr("width", _m.width2 + _m.margin.left + _m.margin.right)
    .attr("height", _m.height + _m.margin.top + _m.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + _m.margin.left + "," + _m.margin.top + ")")
    .attr("id", "choropleth-svg2");

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var g = svg.append("g"),
    g2 = svg2.append("g");

// scale for candidates
var ordinalScale;

// Create variables that hold values of selected elements
var selectedDemographicVal = "",
    selectedPartyVal = "";
var selectedDemographic = $("#selectDemographic");
var selectedParty = $("input[type='radio'][name='party']:checked");

// Set placeholder message on SVG2
demographicPlaceholderText();

loadData();

/*
 * loadData waits for the dataDriver to provide visualization 1 data, then prepares data
 */
function loadData() {
    $.when(window.dataReady.vis1).then(function(){
        if(!vis1 || !window.vis1) console.log("error: dataDriver not intialized before maps.js");

        topoJSONdata = vis1.topoJSONdata;
        demographicMap = vis1.demographics;

        // once the demographics are loaded, render dem options
        $.when( renderDemographicOptions(demographicMap) ).then(function(){

            /* initialize two filter tracker variables */
            if (selectedParty.length > 0) {
                selectedPartyVal = selectedParty.val();
            }

            if (selectedDemographic.length > 0) {
                selectedDemographicVal = selectedDemographic.val();
            }

            // then render the chloropleth, once we know jquery dom changes are done
            updateChoropleth(topoJSONdata);

            // apply filter field listeners
            applyFieldListeners();
        });
    });
}

function determineWinner(results){
    return (results && (results[0].popular > 0)) ? results[0].candidateName : "N/A";
}


// var ordinalScale = d3.scale.category10();

function updateChoropleth(us) {
    ordinalScale = createCandidateScale();

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
            var color = results ? ordinalScale(determineWinner(results)) : "#c7c7c7";
            return color;
        })
        .attr("data-legend", function(d,i){
            // console.log(d.properties.election)
            var results = d.properties.election ? d.properties.election.get(selectedPartyVal) : undefined;
            return determineWinner(results);
        })
        //.on("click", countyclicked)
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
            return ordinalScale(determineWinner(results));
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
        scale = .9 / Math.max(dx / _m.width1, dy / _m.height),
        translate = [_m.width1 / 2 - scale * x, _m.height / 2 - scale * y];

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
    var winner = determineWinner(results);
    winner = (winner === "N/A") ? "No winner / Data Missing" : winner;

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
            // only show Maximum of Top-5 candidates (per county)
            var length = (results.length > 5) ? 5 : results.length;
            for (var x = 0; x < length; x++){
                $(this).append('<tr><th>' + (results[x].candidateName ? results[x].candidateName : results[x].candidate) + '</th><td>' + formatPercent(results[x].percent) + '</td></tr>');
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

    var censusData = (d.properties.census.countyRecords);
    var censusKeys = Object.keys(censusData);

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
                $(this).append('<tr><th>' + demographicMap[censusKeys[x]] + '</th><td>' + censusData[censusKeys[x]] + '</td></tr>');
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
    var extent = d3.extent(filterCounties, function(d) { return d.properties.census.countyRecords[selectedDemographicVal]; });
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
        .attr("transform", "translate(" + 50 + "," + ((_m.height + _m.margin.bottom) / 20 * 17.5) + ")");
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
            if (prefix.symbol == "m"){
                return Math.round(d)
            }
            else{
                return Math.round(prefix.scale(d)) + prefix.symbol;
            }
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
            return d.properties.census.countyRecords ? quantize(d.properties.census.countyRecords[selectedDemographic.val()]) : "#c7c7c7";
        })
        .on("mouseover", showCountyTooltipRight)
        .on("mouseout", hideTooltip);
        // .on("click", countyclicked);


    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .8 / Math.max(dx / _m.width2, dy / _m.height),
        translate = [_m.width2 / 2 - scale * x, _m.height / 2 - scale * y];
    g2.transition()
        .duration(750)
        .style("stroke-width", .75 / scale + "px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
};

/********* d3 Preparation ******************/
function createCandidateScale(){
    var scale;
    if (selectedPartyVal == "Republican"){
        scale = d3.scale.ordinal()
        //.domain(["Ted Cruz", "John Kasich", "Donald Trump", "Ben Carson", "Marco Rubio", "Mike Huckabee", "Lindsey Graham", "N/A"])
        //.range(["#e6550d", "#636363" , "#31a354", "#54B6D6", "#FFF129", "#E38CFF", "#1bdffb", "#aaa"]);
        .domain(["Ted Cruz", "John Kasich", "Donald Trump", "Marco Rubio", "N/A"])
        .range(["#ebd077", "#bf2942" , "#d95b44", "#542537", "#c7c7c7"]);
    }else{
        scale = d3.scale.ordinal()
        .domain(["Hillary Clinton", "Bernie Sanders", "Uncommitted", "N/A"])
        .range(["#1f5167", "#4699b7", "#94cfc9", "#c7c7c7"]);
    }

    return scale;
}

/************* DOM Preparation **************/

function demographicPlaceholderText(){
    svg2.append("text")
        .attr("id", "placeholderText")
        .attr("x", _m.width2/2)
        .attr("y", _m.height/2)
        .attr("text-anchor", "middle")
        .text("Select a state to the left to display more information");
}

function applyFieldListeners(){
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
}

/*
 * add to selectbox each field and its translated human-readable-label as options
 * returns a promise for when the rendering is over
 */
function renderDemographicOptions(dems){
    var doneRendering;
    var fields = [
        "INC110213",
        "POP010210",
        "PST045214",
        "RHI125214",
        "RHI225214",
        "RHI725214",
        "RHI425214",
        "PST120214",
        "HSG445213",
        "PVY020213"
    ];

    var parent = $("#selectDemographic");

    fields.forEach(function(val){
        var text = dems[val];
        doneRendering = parent.append("<option value='"+val+"'>"+text+"</option>");
    });

    return doneRendering;
}


/*********** HELPERS ***************/

function formatPercent(number){
    var arr = number.toFixed(1);
    return String(arr)+"%";
}