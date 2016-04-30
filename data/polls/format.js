/*
 * format data joins and reformats the visualization 2 datasets
 * preapres polling data
 */

var d3 = require('d3');
var fs = require('fs');
var _ = require('underscore');

var polls = [];

var i = 1;
for(; i < 50; i++){
  polls = polls.concat(require("./huff-poll-page-"+i.toString()+".json"));
}

var formatDate =  d3.time.format("%Y-%m-%d");

var records = [];

polls.forEach(function(d){
  var repNational = d.questions.filter(function(q){ return (q.name === "2016 National Republican Primary") || (q.name === "2016 National Democratic Primary"); })[0];
  if(repNational && repNational.subpopulations[0]){
    var i;
    var responses = repNational.subpopulations[0].responses;
    for(i in responses){
      var response = responses[i];
      response.date = d.start_date;
      response.pollster = d.pollster;
      records.push(response);
    }
  }
});

var aggregatePolls = d3.nest()
  .key(function(d){ return d.choice; })
  .key(function(d){ return d.date; })
  .rollup(function(polls){
    polls[0].value = d3.mean(polls, function(p){ return p.value; });
    return polls[0];
  })
  .map(records, d3.map);

var candidates = ["Trump", "Kasich", "Cruz", "Clinton", "Sanders"];

var results = {};
candidates.forEach(function(candidate){
  results[candidate] = aggregatePolls.get(candidate).values().sort(function(a,b){
    return a.date.localeCompare(b.date);
  });
});

console.log(JSON.stringify(results))