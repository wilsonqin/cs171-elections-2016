// --> CREATE SVG DRAWING AREA
var width = 960,
    height = 600;

var projection = d3.geo.albersUsa()
    .scale(1280)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#choropleth1")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "choropleth-svg");

loadData();

function loadData() {
    // Use the Queue.js library to read two files
    queue()
        .defer(d3.json, "data/us.json")
        // .defer(d3.csv, "data/global-malaria-2015_touse.csv")
        .await(function(error, mapTopoJson, malariaDataCsv) {
            // --> PROCESS DATA
            // cleandata(malariaDataCsv);
            // Update choropleth
            // selection = d3.select("#ranking-type").property("value");
            updateChoropleth(mapTopoJson);
        });
}

function updateChoropleth(mapTopoJson) {
    console.log(mapTopoJson);

    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(mapTopoJson, mapTopoJson.objects.counties).features)
        .enter().append("path")
        // .attr("class", function(d) { return quantize(rateById.get(d.id)); })
        .attr("d", path);

    svg.append("path")
        .datum(topojson.mesh(mapTopoJson, mapTopoJson.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "states")
        .attr("d", path);

}