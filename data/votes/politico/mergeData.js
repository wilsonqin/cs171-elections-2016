/*
 * Stitch together the results of running scrapePolitco.js and runScrape.js on many states
 */

var d3 = require('d3');
var fs = require('fs');
var stateFile = "us-state-names.tsv";

function processCSV(path){
  var data = fs.readFileSync(path).toString();
  return d3.tsv.parse(data);
}

var candidateFullNameLookup = {
  'H. Clinton': "Hillary Clinton",
  'B. Sanders': "Bernie Sanders",
  'R. De La Fuente': "Roque De La Fuente",
  'M. O\'Malley': "Martin O'Malley",
  'D. Trump': "Donald Trump",
  'T. Cruz': "Ted Cruz",
  'M. Rubio': "Marco Rubio",
  'B. Carson': "Ben Carson",
  'J. Kasich': "John Kasich",
  'J. Bush': "Jeb Bush",
  'M. Huckabee': "Mike Huckabee",
  'R. Paul': "Rand Paul",
  'C. Christie': "Chris Christie",
  'C. Fiorina': "Carly Fiorina",
  'R. Santorum': "Rick Santorum",
  'L. Graham': "Lindsey Graham",
  'M. Steinberg': "Michael Steinberg",
  'H. Hewes': "Henry Hewes",
  'T. Cook': "Tim Cook",
  'G. Pataki': "George Pataki",
  'No Preference': 'No Preference',
  'Uncommitted': "Uncommitted",
  "Other" : "Other"
};

function transformPartyName(pname){
  return pname[0].toUpperCase() + pname.slice(1);
}

function processAllVotes(){
  var stateLookup = d3.map(processCSV(stateFile), function(d){ return d.name; });
  
  var dataRoot = "./data/";

  var allStateResults = [];

  var allCountyResults = [];

  var stateJSONs = fs.readdirSync(dataRoot);
  stateJSONs.forEach(function(statePath){
    var stateRecord = require(dataRoot + statePath);
    var stateName = statePath.replace(/\.json/g, "");
    var stateFacts = stateLookup.get(stateName);
    //console.log(stateAbbr);
    //console.log(stateRecord);

    stateRecord.state.forEach(function(s){
      s.id = stateFacts.id;
      s.code = stateFacts.code;
      s.name = stateName;
      s.party = transformPartyName(s.party);
      s.candidateName = candidateFullNameLookup[s.candidate];
    });
    
    allStateResults = allStateResults.concat(stateRecord.state);

    stateRecord.countyResults
      // .filter(function(cres){
      //   // filter out nonResults, or primaries yet to happen
      //   return cres !== null;
      // })
      .forEach(function(cres){
        cres.state = stateFacts.code;
        cres.candidateName = candidateFullNameLookup[cres.candidate];
        cres.party = transformPartyName(cres.party);
      });
      allCountyResults = allCountyResults.concat(stateRecord.countyResults);
  });

  var results = {
    states: allStateResults,
    counties: allCountyResults
  };

  console.log(JSON.stringify(results));
}

processAllVotes();