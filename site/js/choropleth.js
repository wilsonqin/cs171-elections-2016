var width = 960,
    height = 500,
    centered;

var projection = d3.geo.albersUsa()
    .scale(1070)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#choropleth1")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "choropleth-svg");

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var g = svg.append("g");

loadData();

function loadData() {
    // Use the Queue.js library to read two files
    queue()
        .defer(d3.json, "data/us.json")
        // .defer(d3.csv, "data/global-malaria-2015_touse.csv")
        .await(function(error, us) {
            // --> PROCESS DATA
            // cleandata(malariaDataCsv);
            // Update choropleth
            // selection = d3.select("#ranking-type").property("value");
            updateChoropleth(us);
        });
}

function updateChoropleth(us){
    console.log(us);
    g.append("g")
        .attr("id", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "county-boundary")
        .on("click", countyclicked)
        .on("mouseover", function(d){
            var boundaries = this.getBoundingClientRect();
            d3.select("#tooltip")
                .style("left", (boundaries.right + 10) + "px")
                .style("top", (boundaries.top + 10) + "px");
            d3.select("#county")
                .text(d.id);
            d3.select("#tooltip")
                .classed("hidden", false);
        })
        .on("mouseout", function(){
            d3.select("#tooltip").classed("hidden", true);
        });

    g.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "state")
        .on("click", clicked);


    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("id", "state-borders")
        .attr("d", path);
};


function clicked(d) {
    console.log(d);
    var x, y, k;

    if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
    } else {
        x = width / 2;
        y = height / 2;
        k = 1;
        centered = null;
    }

    g.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

    g.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
}

function countyclicked(d) {
    alert(d.id);
}