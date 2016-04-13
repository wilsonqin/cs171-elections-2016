var width1 = $("#choropleth1").parent().width(),
    width2 = $("#choropleth2").parent().width(),
    height = 500,
    centered,
    allData,
    stateList = {},
    countiesList = {};

var projection = d3.geo.albersUsa()
    .scale(800)
    .translate([width1 / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#choropleth1")
    .append("svg")
    .attr("width", width1)
    .attr("height", height)
    .attr("id", "choropleth-svg");

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

demographicPlaceholderText();


loadData();
function loadData() {


    $.when(window.dataReady).then(function(){
        console.log('data ready in chloro');
        var data = window.data;

        console.log(data.stateNames);

        allData = data.usTOPOJSON;
        console.log(allData);
        mapNames(data.stateNames, data.countyNames);
        updateChoropleth(allData);
    });

    console.log('data not yet ready in chloro');
}

function mapNames(stateNames, countyNames){

    stateNames.forEach(function (d) {
        stateList[d.id] = d.name;
    });
    countyNames.forEach(function (d) {
        countiesList[d.id] = d.name;
    });
}

function updateChoropleth(us) {
    g.append("g")
        .attr("id", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "county-boundary")
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
    alert(d.id);
}

function showCountyTooltip (d) {
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip.html("County: " + countiesList[d.id])
        .style("left", (d3.event.pageX) +25 + "px")
        .style("top", (d3.event.pageY - 40) + "px");
}

function showStateTooltip (d) {
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip.html(stateList[d.id])
        .style("left", (d3.event.pageX) +25 + "px")
        .style("top", (d3.event.pageY - 40) + "px");
}

function hideTooltip() {
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}

function genNewState(d) {
    clicked(d);
    var states = topojson.feature(allData, allData.objects.states),
        state = states.features.filter(function(datum) {return datum.id === d.id; })[0];
    var allCounties = topojson.feature(allData, allData.objects.counties),
        filterCounties = allCounties.features.filter(function(datum) {
            if (String(d.id).length === 1){
                if(String(datum.id).length === 4) {
                    return String(datum.id).substring(0, 1) === String(d.id);
                }
            }
            else{
                return String(datum.id).substring(0, 2)=== String(d.id);
            }
        });
    g2.selectAll('path').remove();
    g2.selectAll('g').remove();
    svg2.selectAll('text').remove();

    var stateText = $("#stateText");
    stateText.text(stateList[d.id]);

    g2.append("path")
        .datum(state)
        .attr("d", path)
        .attr("class", "state")
        .attr("id", "focusState");

    g2.append("g")
        .attr("id", "selectedCounties")
        .selectAll("path")
        .data(filterCounties)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "countyInset")
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