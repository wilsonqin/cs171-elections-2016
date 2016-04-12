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

var svg2 = d3.select("#choropleth2")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "choropleth-svg2");

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var g = svg.append("g");
var g2 = svg2.append("g");

loadData();
var testdata;
function loadData() {
    // Use the Queue.js library to read two files
    queue()
        .defer(d3.json, "data/us.json")
        .defer(d3.tsv, "data/us-state-names.tsv")
        .defer(d3.tsv, "data/us-county-names.tsv")
        // .defer(d3.csv, "data/global-malaria-2015_touse.csv")
        .await(function(error, us, stateNames, countyNames) {
            // --> PROCESS DATA
            // cleandata(malariaDataCsv);
            // Update choropleth
            // selection = d3.select("#ranking-type").property("value");
            updateChoropleth(us, stateNames, countyNames);
        });
}

function updateChoropleth(us, stateNames, countyNames) {
    console.log(us);
    testdata = us;
    var states = {};
    var counties = {};
    stateNames.forEach(function (d, i) {
        states[d.id] = d.name;
    });
    countyNames.forEach(function (d, i) {
        counties[d.id] = d.name;
    });

    g.append("g")
        .attr("id", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "county-boundary")
        .on("click", countyclicked)
        .on("mouseover", function (d) {
            var boundaries = this.getBoundingClientRect();
            d3.select("#tooltip")
                .style("left", (boundaries.right + 10) + "px")
                .style("top", (boundaries.top + 10) + "px");
            d3.select("#county")
                .text("County: " + counties[d.id]);
            d3.select("#tooltip")
                .classed("hidden", false);
        })
        .on("mouseout", function () {
            d3.select("#tooltip").classed("hidden", true);
        });

    g.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "state")
        .on("click", clicked)
        .on("click", gennewstate)
        .on("mouseover", function (d) {
            var boundaries = this.getBoundingClientRect();
            d3.select("#tooltip")
                .style("left", (boundaries.right + 10) + "px")
                .style("top", (boundaries.top + 10) + "px");
            d3.select("#county")
                .text(states[d.id]);
            d3.select("#tooltip")
                .classed("hidden", false);
        })
        .on("mouseout", function () {
            d3.select("#tooltip").classed("hidden", true);
        });


    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function (a, b) {
            return a !== b;
        }))
        .attr("id", "state-borders")
        .attr("d", path);

}


function clicked(d) {
    // console.log(d);
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

function gennewstate(datum) {
    var states = topojson.feature(testdata, testdata.objects.states),
        state = states.features.filter(function(d) {return d.id === datum.id; })[0];
    console.log(state);
    svg2.selectAll('path').remove();
    svg2.append("path")
        .datum(state)
        .attr("d", path)
        .attr("class", "state")
        .attr("id", "focusstate");

    var focusState = d3.select("#focusstate");
    var x, y, k;
    var centroid = path.centroid(datum);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = focusState;


    svg2.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

    focusState.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
};