/*
 * formatData joins and reformats the visualization 1 datasets
 * county facts >-< county votes
 */

var d3 = require('d3');
var fs = require('fs');
var _ = require('underscore');

var countyFacts = processCSV("vis1_county_facts.csv");
var primaryResults = processCSV("vis1_primary_results.csv");

processNestData(countyFacts, primaryResults);

function processCSV(path){
  var data = fs.readFileSync(path).toString();
  return d3.csv.parse(data);
}

/*
 * formatCountyFacts
 * takes county facts array and cleans it
 *  with remapped object structure w relevant fields only
 */
function formatCountyFacts(countyFacts){
  var interestedFields = [
    "PST045214", // pop 2014
    "PST040210",
    "PST120214", 
    "POP010210" // pop 2010
  ];

  var vitalFields = ["fips", "area_name", "state_abbreviation"];

  var numberFields = _.intersection(Object.keys(countyFacts[0]), interestedFields);
  var record;
  var results = [];

  countyFacts.forEach(function(d,i){
    record = {};

    vitalFields.forEach(function(field,ii){
      record[field] = d[field];
    });

    numberFields.forEach(function(field,ii){
      record[field] = Number(d[field]);
    });

    results.push(record);
  });

  return results;
}

/*
 * processCountyFacts
 * takes county facts array and transforms it into a map
 * returns a d3.map with fips codes as keys
 */
function processCountyFacts(countyFacts){
  var facts = formatCountyFacts(countyFacts);

  var factsMap = d3.map(facts, function(d){ return d.fips; });

  return factsMap;
}

countyFacts = processCountyFacts(countyFacts);

console.log(countyFacts);

function processNestData(countyFacts, primaryResults){
  var factMap = d3.map(countyFacts, function(d){ return d.fips; });

  //console.log(factMap.get('51650'));

  // groupBy fips
  var groupByFips = d3.nest()
    .key(function(d){
      return d.fips;
    })
    .map(primaryResults, d3.map);

  // groupBy fips then party
  var groupByFipsParty = d3.nest()
    .key(function(d){ return d.fips; })
    .key(function(d){ return d.party; })
    .map(primaryResults, d3.map);

  // groupBy state, then county, then party
  var groupByStateFipsParty = d3.nest()
    .key(function(d){
      return d.state_abbreviation;
    })
    .key(function(d){
      return d.fips;
    })
    .key(function(d){
      return d.party;
    })
    .map(primaryResults, d3.map);

  return groupByFipsParty;
}