/*
 * formatData joins and reformats the visualization 1 datasets
 * county facts >-< county votes
 */

var d3 = require('d3');
var fs = require('fs');
var _ = require('underscore');

var countyFacts = processCSV("vis1_county_facts.csv");
//var primaryResults = processCSV("vis1_primary_results.csv");

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
    "PST120214", 
    "POP010210", // pop 2010
    "RHI125214", // percent white
    "RHI225214", // percent black
    "RHI725214", // percent latino
    "RHI425214", // percent asian
    "HSG445213", // homeownership rate
    "INC110213", // median household income
    "PVY020213", // percent in poverty
    
  ];

  var vitalFields = ["fips", "area_name", "state_abbreviation"];

  var numberFields = _.intersection(Object.keys(countyFacts[0]), interestedFields);
  var record,
      countyRecord;
  var results = [];

  countyFacts.forEach(function(d,i){
    record = {};
    countyRecord = {};

    vitalFields.forEach(function(field,ii){
      record[field] = d[field];
    });

    numberFields.forEach(function(field,ii){
      countyRecord[field] = Number(d[field]);
    });
    record["countyRecords"] = countyRecord;
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

  return factsMap;
}

function formatPrimaryData(primaryResults){
  var numberFields = [
    'votes', 'fraction_votes'
  ];

  primaryResults.forEach(function(d,i){
    numberFields.forEach(function(field,ii){
      d[field] = Number(d[field]);
    });
  });

  return primaryResults;
}

function processAggregatePrimaryData(primaryResults){
  primaryResults = formatPrimaryData(primaryResults);

  return d3.nest()
    .key(function(d){ return d.state_abbreviation; })
    .key(function(d){ return d.party; })
    .key(function(d){ return d.candidate; })
    .rollup(function(counties){ return {
      "total_votes": d3.sum(counties, function(d){ return d.votes; })
    }; })
    .map(primaryResults, d3.map);
}

function totalVotes(primaryResults){
  primaryResults = formatPrimaryData(primaryResults);

  return d3.nest()
    .rollup(function(counties){ return {
      "total_votes": d3.sum(counties, function(d){ return d.votes; })
    }; })
    .entries(primaryResults);
}

function processPrimaryData(primaryResults){
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


countyFacts = formatCountyFacts(countyFacts);
console.log(JSON.stringify(countyFacts));


// primaryResults = formatPrimaryData(primaryResults);

// primaryResults = processAggregatePrimaryData(primaryResults);

//var tot = processAggregatePrimaryData(primaryResults);

//console.log(primaryResults.get("VT").get("Democrat"));

//console.log(tot.get("VA").get("Democrat").get("Bernie Sanders"));

// console.log(primaryResults);