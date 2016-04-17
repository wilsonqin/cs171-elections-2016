/*
 * format data joins and reformats the visualization 2 datasets
 * preapres polling data
 */

var d3 = require('d3');
var fs = require('fs');
var _ = require('underscore');

var trends = processCSV("terms-2016-01-03_2016-04-09.csv");

var results = {};

var processedTrends = processTrends(trends);

var nested = d3.nest()
  .key(function(d){ return d.term; })
  .sortValues(function(a,b){ return d3.descending(a.date,b.date); })
  .map(processedTrends, d3.map);

nested.keys().forEach(function(term){
  results[term] = nested.get(term);
});

console.log(results);

function processCSV(path){
  var data = fs.readFileSync(path).toString();
  return d3.csv.parse(data);
}

function processTrends(trends){
  var processedTrends = [];
  trends.forEach(function(t){
    var date = t.Week.split(" - ")[0];
    Object.keys(t).forEach(function(key){
      var record = {};
      if(key !== 'Week'){
        record.term = key;
        record.value = Number(t[key]);
        record.date = date;
        processedTrends.push(record);
      }
    });
  });

  return processedTrends;
}