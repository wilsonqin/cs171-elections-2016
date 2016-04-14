/* 
 * Serves as the data import driver
 * and does initial first level d3 data manipulation
 */

(function(){
  if(!d3) console.log("we need d3 before dataDriver!");
  if(!queue) console.log("we need d3-queue before dataDriver!");
  if(!$) console.log("we need jquery before dataDriver!");

  var dataset = {};

  var datasetReady = $.Deferred();

  // a jQuery Deferred synchronization variable available globally
  // this is resolved in the queue callback when all data is ready
  window.dataReady = window.dataReady ? window.dataReady : datasetReady;

  // load data files async and converge
  queue()
    .defer(d3.json, "data/county_facts.json")
    .defer(d3.json, "data/us.json")
    .defer(d3.json, "data/primary_results.json")
    .defer(d3.tsv, "data/us-state-names.tsv")
    .defer(d3.tsv, "data/us-county-names.tsv")
    .defer(d3.csv, "data/demographics.csv")
    .await(function(err, countyFacts, usTOPOJSON, primaryResults, stateNames, countyNames, demographics){

      var factMap = d3.map(countyFacts, function(d){ return d.fips; });

      // init state and county name structures

      // primaryResults groupBy fips then party
      var primaryResultsFipsParty = d3.nest()
        .key(function(d){ return d.fips; })
        .key(function(d){ return d.party; })
        .sortValues(function descending(a, b) {
          a = a.votes;
          b = b.votes;
          return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
        })
        .map(primaryResults, d3.map);

      // primaryResults groupBy state_abbreviation, fips, party
      var primaryResultsStateFipsParty = d3.nest()
        .key(function(d){ return d.state_abbreviation; })
        .key(function(d){ return d.fips; })
        .key(function(d){ return d.party; })
        .sortValues(function descending(a, b) {
          a = a.votes;
          b = b.votes;
          return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
        })
        .map(primaryResults, d3.map);

        var demoraphicLabels = {};
        demographics.forEach(function (d) {
            // console.log(d);
            demoraphicLabels[d.id] = d.name;
        });


      dataset = {
        countyFacts: factMap,
        primaryResults: primaryResultsStateFipsParty,
        primaryResultsFipsParty: primaryResultsFipsParty,
        stateNames: stateNames,
        countyNames: countyNames,
        usTOPOJSON: usTOPOJSON,
        getCountyData: getCountyData
      };

      usTOPOJSON = populateTopoAttr(usTOPOJSON, stateNames, countyNames, factMap);


      window.vis1 = {
          topoJSONdata: usTOPOJSON,
          getCountyData: getCountyData,
          getStateData: getStateData,
          stateNames: stateNames,
          countyNames: countyNames,
          demographics: demoraphicLabels
      };

      // attach completed dataset to the window for global access
      // window.data = window.data ? window.data : dataset;

      // signal that the global data is ready to be accessed
      datasetReady.resolve();
    });
  
  /********** DATA MODEL METHODS *********/
  /* pre-req: these should only be called when window.dataReady is resolved! **/

  // Enter FIPS code and get object with data for the selected county
  function getCountyData(fips){
    var fips_data = dataset.countyFacts.get(fips);
    var getCountyResults = dataset.primaryResultsFipsParty.get(fips);
    var partyMap = getCountyResults ? getCountyResults : d3.map([]);

    return {
      census: fips_data,
      election: partyMap
    };
  }

  // TODO
  // Enter State ID and get list of county objects associated with the state
  function getStateData(stateCode){
    
    var state_data = dataset.primaryResults.get(stateCode);
    return state_data;
  }

  
  function populateTopoAttr(usTOPOJSON, stateNames, countyNames, countyFacts){
    var stateById = d3.map(stateNames, function(d){
      return d.id;
    });

    var countyNameById = d3.map(countyNames, function(d){
      return d.id;
    });

    usTOPOJSON.objects.states.geometries.forEach(function(state,i){
      state.properties = stateById.get(state.id);
    });

    usTOPOJSON.objects.counties.geometries.forEach(function(county,i){
      county.properties = {};
      $.extend(county.properties, getCountyData(county.id), countyNameById.get(county.id));
    });

    return usTOPOJSON;
  }


}());

