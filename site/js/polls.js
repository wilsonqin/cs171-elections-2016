// margins
var margin = {top: 20, right:50, bottom:140, left:50};

// Sets width and height elements of graphs
var width3 = $("#polls").parent().width() - margin.left - margin.right,
    height3 = 350 - margin.top - margin.bottom;

var margin2 = {top: 0, right: 50, bottom: 20, left:50};
var height3_2 = 85 - margin2.top - margin2.bottom;


// Initialize SVG elements
var svg3 = d3.select("#polls")
    .append("svg")
    .attr("width", width3 + margin.left + margin.right)
    .attr("height", height3 + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Scales
var x1 = d3.time.scale()
    .range([0, width3]);
var x1_2 = d3.time.scale()
    .range([0, width3]);
var y1 = d3.scale.linear()
    .range([height3, 0]);
var y1_2 = d3.scale.linear()
    .range([height3_2, 0]);

// brush
var brush = d3.svg.brush()
    .x(x1_2)
    .on("brush", brushed);

// color scale
var color4 = d3.scale.ordinal()
    .domain(["Cruz", "Kasich", "Trump", "Clinton", "Sanders"])
    .range(["#e6550d", "#636363" , "#31a354", "#3182bd", "#9e9ac8"]);


// Initialize Axes for both graphs
var xAxis3 = d3.svg.axis()
    .scale(x1)
    .orient("bottom");
var xAxis3_2 = d3.svg.axis()
    .scale(x1_2)
    .orient("bottom");
var yAxis3 = d3.svg.axis()
    .scale(y1)
    .orient("left");
var yAxis3_2 = d3.svg.axis()
    .scale(y1_2)
    .orient("left");

// initialize line graph
var line;
var line2;
var legend3;
var clip = svg3.append("svg:clipPath").attr("id", "clip").append("svg:rect")
var chartBody;
var context;
var position;


// initialize data
var candidateArray = ["Clinton", "Sanders", "Trump", "Cruz", "Kasich"];

var formatDate = d3.time.format("%Y-%m-%d");
var max_date = formatDate.parse("2016-04-30");
var min_date = formatDate.parse("2015-11-01");
var startDateSpan = [min_date, max_date];

//******** TRENDS *********************/
// margins
var margin3 = {top: 20, right:50, bottom:20, left:50};

// Sets width and height elements of graphs
var width4 = $("#trends").parent().width() - margin3.left - margin3.right,
    height4 = 290 - margin3.top - margin3.bottom;

// Initialize SVG elements

var svg4 = d3.select("#trends")
    .append("svg")
    .attr("width", width4 + margin3.left + margin3.right)
    .attr("height", height4 + margin3.top + margin3.bottom)
    .append("g")
    .attr("transform", "translate(" + margin3.left + "," + margin3.top + ")");

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
var line3;
var legend2;
var indicator;

// initialize data
// max and min date
var formatDate2 = d3.time.format("%Y-%m-%d");
var max_date2 = max_date; //formatDate2.parse("2016-04-30");
var min_date2 = min_date; //formatDate2.parse("2015-10-25");
var initialExtent = [min_date2, max_date2];
loadData4(initialExtent);

/////////////

loadData3(candidateArray, startDateSpan);

function loadData3(domain, datedomain){

    $.when(window.dataReady.vis2).then(function(){
        if(!vis2 || !window.vis2) console.log("error: dataDriver not intialized before maps.js");

        var data = vis2.polls;

        var localDomain = domain;
        formatData(data, localDomain, datedomain);
        showContext(data, candidateArray);
        // hover line - polls
        drawHoverLine(chartBody, chartBody2);
    });

}

function getCandidateSelection(extent)
{

    var checkboxSelection2 = $('input[name=checkbox2]:checked').map(function () { return this.value; }).toArray();
    // console.log(checkboxSelection2);

    var candidateArray2;

    if (checkboxSelection2 != undefined && checkboxSelection2 != 0 ) {
        candidateArray2 = checkboxSelection2;
    }
    else
    {
        candidateArray2 = candidateArray;
    }

    svg3.selectAll("path").remove();
    //svg3.selectAll("g").remove();
    context.selectAll("g").remove();
    //chartBody2.selectAll("g").remove();
    //svg4.selectAll("g2").remove();
    svg3.selectAll('.legend3').remove();


    // console.log(candidateArray2);
    loadData3(candidateArray2, extent);

}


function formatData(data, domain, datedomain){
    var localData = data;
    var formatDate = d3.time.format("%Y-%m-%d");

    // color.domain(["Clinton", "Sanders", "Trump", "Cruz", "Kasich"]);

    var politicians = domain.map(function(name){
        return{
            name: name,
            values: localData[name].map(function(d){
                return {date: formatDate.parse(d.date), rating: d.value}
            })
        }
    });

    updatePollsDomain(politicians, datedomain);
}

function updatePollsDomain(data, datedomain){

    x1.domain(datedomain);
    //x1.domain(d3.extent(data[0].values, function(d){return d.date;}));
    y1.domain([
        d3.min(data, function(p) { return d3.min(p.values, function(v) { return v.rating; }); }),
        d3.max(data, function(p) { return d3.max(p.values, function(v) { return v.rating; }); })
    ]);

    updatePollsAxes(data);
}

function updatePollsAxes(data, datedomain){
    // initialize Axis Groups
    var xAxisGroup3 = svg3.append("g")
        .attr("class", "x-axis1 axis");
    var yAxisGroup3 = svg3.append("g")
        .attr("class", "y-axis1 axis");

    yAxisGroup3.append("text")
        .text("% Support")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -30)
        .attr("x", -(height3 / 3));
        
    // call axes
    svg3.select(".x-axis1")
        .attr("transform", "translate(0, "+ height3 + ")")
        .transition()
        .call(xAxis3);
    svg3.select(".y-axis1")
        .transition()
        .call(yAxis3);

        clip.attr("x", 0)
        .attr("y", 0)
        .attr("width", width3)
        .attr("height", height3);

    chartBody = svg3.append("g")
        .attr("clip-path", "url(#clip)")
        .attr("class", "chartBody");

    // chartBody.append("svg:path")
    //     .datum(data)
    //     .attr("class", "line")
    //     .attr("d", line);

    drawPollLines(data);
}

/*
 * Attaches hoverLine to the specific anchor element with `anchor` as string css selector
 */
function attachHoverLineHandler(anchor, components){
    var hoverDate = components.hoverDate,
        hoverLine = components.hoverLine,
        hoverLineGroupMain = components.hoverLineGroupMain,
        hoverLineGroupContext = components.hoverLineGroupContext,
        hoverLineGroupTrends = components.hoverLineGroupTrends,
        hoverLine2 = components.hoverLine2,
        hoverDate3 = components.hoverDate3,
        hoverLine3 = components.hoverLine3;

    d3.select(anchor).on("mouseover", function() {
        //console.log('mouseover');
        //hoverLineGroupMain.style("opacity", 1);
    }).on("mousemove", function() {
        //console.log('mousemove', d3.mouse(this));
        var mouse_x = d3.mouse(this)[0] - margin.left + 3;
        var mouse_y = d3.mouse(this)[1];
        var graph_y = y1.invert(mouse_y);
        var graph_x = x1.invert(mouse_x);
        var mouse_x2 = x1_2(graph_x);
        var formatTime = d3.time.format("%b %_d");
        var graph_x2 = formatTime(graph_x);
        hoverDate.text("  " + graph_x2);
        hoverDate.attr('x', mouse_x + 5);
        //hoverDate2.text(" " + graph_x2);
        //hoverDate2.attr('x', mouse_x2 + 5);
        //console.log(x1.invert(mouse_x));
        hoverLine.attr("x1", mouse_x).attr("x2", mouse_x);
        hoverLine2.attr("x1",mouse_x2).attr("x2", mouse_x2);
        hoverLineGroupMain.style("opacity", 1);
        hoverLineGroupContext.style("opacity", 1);

        var checkboxSelection = $('input[name=checkbox]:checked').map(function () { return this.value; }).toArray();

        // only show if search term selected
        if(checkboxSelection.length > 0){
            hoverDate3.text(" " + graph_x2);
            hoverDate3.attr('x', mouse_x + 5);
            hoverLine3.attr("x1",mouse_x).attr("x2", mouse_x);
            hoverLineGroupTrends.style("opacity", 1);
        }

    })  .on("mouseout", function() {
        //console.log('mouseout');
        hoverLineGroupMain.style("opacity", 0);
        hoverLineGroupContext.style("opacity", 0);
        hoverLineGroupTrends.style("opacity", 0);

    });
}

function drawHoverLine(chartBody, chartBody2){

    chartBody.selectAll(".hover-line").remove();
    chartBody2.selectAll("g.hover-line").remove();
    //chartBody2.selectAll("g").remove();
    //$("#clip2").remove();

    // main hover line
    var hoverLineGroupMain = chartBody.append("g")
        .attr("class", "hover-line");
    var hoverLine = hoverLineGroupMain
        .append("line")
        .attr("x1", 0).attr("x2", 0)
        .attr("y1", 0).attr("y2", height3)
        .attr("stroke", "black");
    var hoverDate = hoverLineGroupMain.append('text')
        .attr("class", "hover-text")
        .attr('y', 10);

    // context hover line
    var hoverLineGroupContext = context.append("g")
        .attr("class", "hover-line");

    var hoverLine2 = hoverLineGroupContext
        .append("line")
        .attr("x1", 0).attr("x2", 0)
        .attr("y1", -5).attr("y2", height3_2)
        .attr("stroke", "black");

    var hoverDate2 = hoverLineGroupContext
        .append('text')
        .attr("class", "hover-text")
        .attr('y', -(margin.top/2));

    // trends hover line
    var hoverLineGroupTrends = chartBody2.append("g")
        .attr("class", "hover-line");
    var hoverLine3 = hoverLineGroupTrends
        .append("line")
        .attr("x1", 0).attr("x2", 0)
        .attr("y1", 0).attr("y2", height4)
        .attr("stroke", "black");
    var hoverDate3 = hoverLineGroupTrends.append('text')
        .attr("class", "hover-text")
        .attr('y', 10);

    var components = {
        hoverDate: hoverDate,
        hoverLine: hoverLine,
        hoverLineGroupMain: hoverLineGroupMain,
        hoverLineGroupContext: hoverLineGroupContext,
        hoverLineGroupTrends: hoverLineGroupTrends,
        hoverLine2: hoverLine2,
        hoverDate3: hoverDate3,
        hoverLine3: hoverLine3
    };

    attachHoverLineHandler("#polls", components);

    attachHoverLineHandler("#trends", components);

}

function drawPollLines(data){

    line = d3.svg.line()
        .interpolate("bundle")
        .x(function(d) {
            return x1(d.date); })
        .y(function(d) { return y1(d.rating);});

    var politicians = chartBody.selectAll(".politician")
        .data(data)
        .enter().append("g")
        .attr("class", "politician");

    var politicianLabel;

    politicians.append("path")
        .attr("class", "line")
        .attr("d", function(d){return line(d.values);})
        .attr("data-legend", function(d){return d.name;})
        .style("stroke", function(d) { return color4(d.name); })
        .on("mouseover", function(){
            var test = $(this).attr("data-legend");
            var test2 = test.toString();
            console.log(test2);
            var mouse_x = d3.mouse(this)[0] - margin.left + 5;
            var mouse_y = d3.mouse(this)[1] - 10;
            politicianLabel = svg3.append("text")
                .attr("class", "lineText")
                .attr("x", mouse_x)
                .attr("y", mouse_y)
                .attr("dy", ".35em")
                .text(test2)
        })
        .on("mousemove", function(){
            var mouse_x = d3.mouse(this)[0] - margin.left + 5;
            var mouse_y = d3.mouse(this)[1] - 10;
            politicianLabel.attr("x", mouse_x).attr("y", mouse_y);
        })
        .on("mouseout", function(){
            svg3.selectAll(".lineText").remove();
        });

    legend3 = svg3.append("g")
        .attr("class", "legend3")
        .attr("transform","translate(50,30)")
        .style("font-size","12px")
        .call(d3.legend);


    //hover lines used to be here
}

function showContext(data, candidateArray) {
    var formatDate = d3.time.format("%Y-%m-%d");
    var localData = data;

    var politicians = candidateArray.map(function (name) {
        return {
            name: name,
            values: localData[name].map(function (d) {
                return {date: formatDate.parse(d.date), rating: d.value}
            })
        }
    });

    // console.log(politicians);

    updateContextDomain(politicians);

}

function updateContextDomain(data)
{
    var formatDate = d3.time.format("%Y-%m-%d");
    var politician = data;

    // max and min date
    //var max_date = formatDate.parse("2016-04-01");
    //var min_date = formatDate.parse("2015-10-25");

    // update domains
    x1_2.domain([min_date, max_date]);
    y1_2.domain([
        d3.min(politician, function (p) {
            return d3.min(p.values, function (v) {
                return v.rating;
            });
        }),
        d3.max(politician, function (p) {
            return d3.max(p.values, function (v) {
                return v.rating;
            });
        })
    ]);

    showContextUpdateAxes(politician);

}

function showContextUpdateAxes(data) {

    context = svg3.append("g")
        .attr("class", "context")
        .attr("transform", "translate(0, 240)");

    var xAxisGroup3_2 = context.append("g")
        .attr("class", "x-axis1_2 axis");

    context.select(".x-axis1_2")
        .attr("transform", "translate(0, "+height3_2+")")
        .transition()
        .call(xAxis3_2);

    // context.append("svg:path")
    //     .datum(data)
    //     .attr("class", "line2")
    //     .attr("d", line2);

    context.append("g")
        .attr("class", "x brush x_brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", height3_2 + 7);

    drawContextLines(data);

}

function drawContextLines(data){

    line2 = d3.svg.line()
        .interpolate("bundle")
        .x(function(d) { return x1_2(d.date); })
        .y(function(d) { return y1_2(d.rating);});

    var politiciansContext = context.selectAll(".politicianContext")
        .data(data)
        .enter().append("g")
        .attr("class", "politicianContext");

    politiciansContext.append("path")
        .attr("class", "line2")
        .attr("d", function(d){return line2(d.values);})
        .style("stroke", function(d) { return color4(d.name); });

}

function resetVisualization2(){

    brush.clear();
    removeEvents();
    svg3.selectAll("path").remove();
    svg3.selectAll("g").remove();
    svg3.selectAll('.legend3').remove();
    context.selectAll("g").remove();
    d3.selectAll(".image_button").classed("grey-out", false);

    loadData3(candidateArray, startDateSpan);

    svg4.selectAll(".politician").remove();
    svg4.selectAll('.legend2').remove();


    $('input:checkbox').removeAttr('checked');
    
    trendsPlaceholderText();
}

function checkExtent2(brushExtent)
{
    var localExtent;

    if (brushExtent[1] - brushExtent[0] == 0)
    {
        localExtent = startDateSpan;
    }
    else
        localExtent = brushExtent;

    candidateSelection(localExtent);

}

function candidateSelection(extent) {

    // check checkbox id
    var checkImgId = "#" + $(event.target)[0].id;
    var checkId = "#" + $(event.target)[0].id + "_select";
    // console.log(checkId);

    var checked = $(checkId).prop('checked');
    // console.log(checked);

    if (checked == false) {
        $(checkId).prop('checked', true);
        d3.select(checkImgId).classed("grey-out", true);
        // $(checkImgId).css('opacity', 1);

    }
    else if (checked == true) {
        $(checkId).prop('checked', false);
        d3.select(checkImgId).classed("grey-out", false);
        // $(checkImgId).css('opacity', 0.65);
    }

    var test = $(checkId).prop('checked');

    // console.log(test);
    getCandidateSelection(extent);
}

function brushed() {
    var newDomain = brush.extent();
    // console.log(newDomain);

    svg3.selectAll("path").remove();
    svg3.selectAll("g").remove();
    svg4.selectAll("g.hover-line").remove();
    svg3.selectAll('.legend3').remove();
    svg4.selectAll('#trendsPlaceholderText').remove();
    $("g.hover-line").attr("opacity", 0);
    $("#clip2").remove();

    getCandidateSelection(newDomain);
    //loadData3(candidateArray, newDomain);
    loadData4(newDomain);

    chartBody.selectAll(".eventsRectangle").remove();
    chartBody2.selectAll(".eventsRectangle2").remove();
    chartBody.selectAll(".eventsBox").remove();
    chartBody2.selectAll(".eventsBox2").remove();
    var checked = $('#show_events').prop('checked');
    if (checked == true)
    {
        loadData5();
    }
}

//************************************//
//***********trends******************//

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

    var indicator = $('#show_events').prop('checked');
    //console.log(indicator);
    if (indicator == true) {
        loadData5();
    }

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
        // console.log(data);

        getCheckboxSelection(data, extent);

    });

}

function getCheckboxSelection(data, extent){
    svg4.selectAll("path").remove();
    svg4.selectAll(".g2").remove();
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
        //svg4.selectAll("g.hover-lines").remove();
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
    // console.log(extent);
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
        .attr("class", "x-axis axis g2");
    var yAxisGroup4 = svg4.append("g")
        .attr("class", "y-axis axis g2");

    yAxisGroup4.append("text")
        .text("Google Trends Score")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -30)
        .attr("x", -(height4 / 3));

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

    line3 = d3.svg.line()
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
        .attr("class", "politician g2");

    var politicianLabel;

    politicians.append("path")
        .attr("class", "line")
        .attr("d", function(d){return line3(d.values);})
        .attr("data-legend", function(d){return d.name;})
        .style("stroke", function(d) { return color5(d.name); })
        .on("mouseover", function(){
            var test = $(this).attr("data-legend");
            var test2 = test.toString();
            console.log(test2);
            var mouse_x = d3.mouse(this)[0] - margin3.left + 15;
            var mouse_y = d3.mouse(this)[1] - 10;
            politicianLabel = svg4.append("text")
                .attr("class", "lineText")
                .attr("x", mouse_x)
                .attr("y", mouse_y)
                .attr("text-anchor", "end")
                .attr("dy", ".35em")
                .text(test2)
        })
        .on("mousemove", function(){
            var mouse_x = d3.mouse(this)[0] - margin3.left + 15;
            var mouse_y = d3.mouse(this)[1] - 10;
            politicianLabel.attr("x", mouse_x).attr("y", mouse_y);
        })
        .on("mouseout", function(){
            svg4.selectAll(".lineText").remove();
        });


    if (indicator != 1) {
        legend2 = svg4.append("g")
            .attr("class", "legend2 g2")
            .attr("transform", "translate(50,30)")
            .style("font-size", "12px")
            .call(d3.legend);
    }
}
