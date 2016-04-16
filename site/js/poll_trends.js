// Sets width and height elements of graphs
var width3 = $("#polls").parent().width(),
    width4 = $("#trends").parent().width(),
    height1 = 500;
    height2 = 300;

// Initialize SVG elements
var svg3 = d3.select("#polls")
    .append("svg")
    .attr("width", width3)
    .attr("height", height1)
    .attr("id", "polls-svg");

var svg4 = d3.select("#trends")
    .append("svg")
    .attr("width", width4)
    .attr("height", height2)
    .attr("id", "trends-svg");



