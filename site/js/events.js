/**
 * Created by annapapp on 4/17/16.
 */

function changeEventsCheckbox()
{
    chartBody.selectAll(".eventsRectangle").remove();
    chartBody2.selectAll(".eventsRectangle2").remove();
    chartBody.selectAll(".eventsBox").remove();
    chartBody2.selectAll(".eventsBox2").remove();
    $('#show_events').prop('checked', true);
    loadData5();
}

function loadData5(){

    $.when(window.dataReady.vis2).then(function(){
        if(!vis2 || !window.vis2) console.log("error: dataDriver not intialized before maps.js");

        var data = vis2.events;

       formatData3(data);

    });

}

function formatData3(data)
{
    var localData = data;
    var formatDate = d3.time.format("%Y-%m-%d");
    var formatDate2 = d3.time.format("%b %_d");

    var events = [];

    localData.forEach(function(d){
        events.push({date: formatDate.parse(d.date), title:d.title} )
    });

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-5, 0])
        .html(function(d) {
            return "<strong>" + formatDate2(d.date) + ": </strong> <span style='color:dimgrey'>" + d.title + "</span>";
        });

    chartBody.call(tip);

    console.log(events);

    chartBody.selectAll("eventsRectangle")
        .data(events)
        .enter()
        .append("line")
        .attr("class", "eventsRectangle")
        .text(function(d){
            return d.date;
        })
        .attr("x1", function(d){return x1(d.date);})
        .attr("y1", height3)
        .attr("x2", function(d){return x1(d.date);})
        .attr("y2", 0)
        .attr("opacity", 0.9)
        .attr("stroke", function(d){
            if (d.title == "Republican Debate")
            {
                return "#DC143C";
            }
            else if (d.title == "Democrat Debate")
            {
                return "#0000CD";
            }
            else
                return "black";
        })
        .attr("stroke-width", "1")
        .attr("stroke-dasharray", "3 4");
        //.on('mouseover', tip.show)
        //.on('mouseout', tip.hide);
        //.attr("width", 2)
        //.attr("height", height3)
        //.attr("fill", "red")
        //.attr("opacity", "0.3")
        //.attr("border", "2px solid #73AD21")

    chartBody.selectAll("eventsBox")
        .data(events)
        .enter()
        .append("rect")
        .attr("class", "eventsBox")
        .text(function(d){
            return d.date;})
        .attr("x", function(d){return x1(d.date)-4;})
        .attr("y", 0)
        .attr("height", height3)
        .attr("width", 8)
        .attr("opacity", 0)
        .attr("fill", function(d){
            if (d.title == "Republican Debate")
            {
                return "#DC143C";
            }
            else if (d.title == "Democrat Debate")
            {
                return "#0000CD";
            }
            else
                return "black";
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    var checkboxSelection = $('input[name=checkbox]:checked').map(function () { return this.value; }).toArray();
    if(checkboxSelection[0] != undefined) {
        chartBody2.selectAll("eventsRectangle2")
            .data(events)
            .enter()
            .append("line")
            .attr("class", "eventsRectangle2")
            .text(function(d){
                return d.date;
            })
            .attr("x1", function(d){return x1(d.date);})
            .attr("y1", height4)
            .attr("x2", function(d){return x1(d.date);})
            .attr("y2", 0)
            .attr("opacity", 0.9)
            .attr("stroke", function(d){
                if (d.title == "Republican Debate")
                {
                    return "#DC143C";
                }
                else if (d.title == "Democrat Debate")
                {
                    return "#0000CD";
                }
                else
                    return "black";
            })
            .attr("stroke-width", "1")
            .attr("stroke-dasharray", "3 4");

        chartBody2.selectAll("eventsBox2")
            .data(events)
            .enter()
            .append("rect")
            .attr("class", "eventsBox2")
            .text(function(d){
                return d.date;})
            .attr("x", function(d){return x1(d.date)-4;})
            .attr("y", 0)
            .attr("height", height4)
            .attr("width", 8)
            .attr("fill", function(d){
                if (d.title == "Republican Debate")
                {
                    return "#DC143C";
                }
                else if (d.title == "Democrat Debate")
                {
                    return "#0000CD";
                }
                else
                    return "black";
            })
            .attr("opacity", 0)
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
    svg3.selectAll(".eventsBox").remove();
    svg4.selectAll(".eventsRectangle2").remove();
    svg4.selectAll(".eventsBox2").remove();
    $('#show_events').prop('checked', false);
}