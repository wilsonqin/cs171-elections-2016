// --> CREATE SVG DRAWING AREA
var width = 960,
    height = 500;
var scale = 1000;
var projection = d3.geo.albersUsa()
    .scale(scale)
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
        .defer(d3.json, "data/cb_2014_us_county_5m.json")
        // .defer(d3.csv, "data/global-malaria-2015_touse.csv")
        .await(function(error, us, malariaDataCsv) {
            // --> PROCESS DATA
            // cleandata(malariaDataCsv);
            // Update choropleth
            // selection = d3.select("#ranking-type").property("value");
            updateChoropleth(us);
        });
}

function updateChoropleth(us) {
    console.log(us);
    console.log(us.objects.cb_2014_us_county_5m);
    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.cb_2014_us_county_5m).features)
        .enter()
        .append("path")
        .attr("d", path)
        .on("mouseover", function(d){
            var boundaries = this.getBoundingClientRect();
            d3.select("#tooltip")
                .style("left", (boundaries.right + 10) + "px")
                .style("top", (boundaries.top + 10) + "px");
            d3.select("#county")
                .text(d.properties.NAME);
            d3.select("#tooltip")
                .classed("hidden", false);
        })
        .on("mouseout", function(){
            d3.select("#tooltip").classed("hidden", true);
        });
}