/**
 * Created by annapapp on 4/17/16.
 */

function loadData5(debateSelection){

    $.when(window.dataReady.vis2).then(function(){
        if(!vis2 || !window.vis2) console.log("error: dataDriver not intialized before maps.js");

        var data = vis2.events;
        console.log(data);

       formatData3(debateSelection, data);

    });

}

function getDebateSelection()
{
    var debateSelection = $(event.target)[0].id;
    loadData5(debateSelection);

}

function formatData3(debateSelection, data)
{
    var localData = data;
    var formatDate = d3.time.format("%Y-%m-%d");

    var events = [];

    localData.forEach(function(d){
        events.push({date: formatDate.parse(d.date), title:d.title} )
    });

    console.log(events);

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<strong>Event:</strong> <span style='color:red'>" + d.title + "</span>";
        });

    svg3.call(tip);

    svg3.selectAll("eventsRectangle")
        .data(events)
        .enter()
        .append("rect")
        .attr("class", "eventsRectangle")
        .text(function(d){
            return d.date;
        })
        .attr("x", function(d){return x1(d.date);})
        .attr("y", 0)
        .attr("width", 2)
        .attr("height", height3)
        .attr("fill", "black")
        .attr("opacity", "0.3")
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    if(indicator != 1) {
        svg4.selectAll("eventsRectangle2")
            .data(events)
            .enter()
            .append("rect")
            .attr("class", "eventsRectangle2")
            .text(function (d) {
                return d.date;
            })
            .attr("x", function (d) {
                return x1(d.date);
            })
            .attr("y", 0)
            .attr("width", 3)
            .attr("height", height4)
            .attr("fill", "black")
            .attr("opacity", "0.3")
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    }

    // set position etc.

    // set position etc.

    /*var lines2 = svg4.append('line')
        .attr({
            x1: x1(formatDate.parse("2016-02-02")), // x() is your scaling function, 10 is the value where you want a line to be placed
            y1: 0, // height of your chart
            x2:  x1(formatDate.parse("2016-02-02")), // same as x1 for a horizontal line
            y2: height3 // height of your chart
        })
        .attr("stroke", "black");*/

}

function removeEvents()
{
    svg3.selectAll(".eventsRectangle").remove();
    svg4.selectAll(".eventsRectangle2").remove();
}