/* 
 * Serves as the data import driver
 * and does initial first level d3 data manipulation
 */

// visualization 1 handling
(function(){
  if(!d3) console.log("we need d3 before dataDriver!");
  if(!queue) console.log("we need d3-queue before dataDriver!");
  if(!$) console.log("we need jquery before dataDriver!");

  var dataset = {};

  var datasetReady = $.Deferred();

  // a jQuery Deferred synchronization variable available globally
  // this is resolved in the queue callback when all data is ready
  window.dataReady = {};

  window.dataReady.vis1 = window.dataReady.vis1 ? window.dataReady.vis1 : datasetReady;

  // load data files async and converge
  queue()
    .defer(d3.json, "data/county_facts.json")
    .defer(d3.json, "data/us.json")
    //.defer(d3.json, "data/primary_results.json")
    .defer(d3.json, "data/vis1_primary_politico.json")
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
          a = a.popular;
          b = b.popular;
          return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
        })
        .map(primaryResults.counties, d3.map);

      // fips to countyname lookup
      var countyNameLookup = d3.map(primaryResults, function(d){ return d.fips; });


      dataset = {
        countyFacts: factMap,
        primaryResultsFipsParty: primaryResultsFipsParty,
        stateNames: stateNames,
        countyNames: countyNames,
        usTOPOJSON: usTOPOJSON,
        getCountyData: getCountyData,
        countyNameLookup: countyNameLookup,
        stateWinners: getStateAggregateMap(primaryResults)
      };

      usTOPOJSON = populateTopoAttr(usTOPOJSON, stateNames, countyNames, factMap);
      var demographicLabels = getDemographicMap(demographics);

      // attach completed dataset to the window for global access
      window.vis1 = {
          topoJSONdata: usTOPOJSON,
          getCountyData: getCountyData,
          getStateData: getStateData,
          demographics: demographicLabels
      };

      // signal that the global data is ready to be accessed
      datasetReady.resolve();
    });

  function getDemographicMap(demographics){
    var demLabels = {};
    demographics.forEach(function (d) {
        demLabels[d.id] = d.name;
    });

    return demLabels;
  }

  function getStateAggregateMap(primaryResults){
    return d3.nest()
      .key(function(d){ return d.code; })
      .key(function(d){ return d.party; })
      .sortValues(function descending(a, b) {
          a = a.popular_vote;
          b = b.popular_vote;
          return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
        })
      .map(primaryResults.states, d3.map);
  }
  
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
  function getStateData(stateCode, party){
    var state_data = dataset.stateWinners.get(stateCode).get(party);
    return state_data;
  }

  function fipsNonStateCounty(fips){
    return fips >= 60000;
  }

  function fipsNonState(fips){
    return fips >= 60;
  }

  
  function populateTopoAttr(usTOPOJSON, stateNames, countyNames, countyFacts){
    var stateById = d3.map(stateNames, function(d){
      return d.id;
    });

    var countyNameById = d3.map(countyNames, function(d){
      return d.id;
    });

    usTOPOJSON.objects.states.geometries = usTOPOJSON.objects.states.geometries.filter(function(state,i){
      return !fipsNonState(state.id);
    });

    usTOPOJSON.objects.states.geometries.forEach(function(state,i){
      state.properties = stateById.get(state.id);
      state.properties.election = dataset.stateWinners.get(state.properties.code);
    });

    // filter out all topoJSON counties that are not 50 US State counties
    usTOPOJSON.objects.counties.geometries = usTOPOJSON.objects.counties.geometries.filter(function(county, i){
      return !fipsNonStateCounty(county.id);
    });

    usTOPOJSON.objects.counties.geometries.forEach(function(county,i){
      county.properties = {};

      var countyData = getCountyData(county.id);

      if(countyData){
        var basicCountyIdentity = countyNameById.get(county.id);

        // if basicCountyIdentity can't be found on county id table, get it from demographics data
        if(!basicCountyIdentity){
          basicCountyIdentity = {
            name: countyData.census.area_name.split(" County")[0]
          }
        }

        $.extend(county.properties, countyData, basicCountyIdentity);
      }
    });

    return usTOPOJSON;
  }
}());

// visualization 2 handling
(function(){
  if(!d3) console.log("we need d3 before dataDriver!");
  if(!queue) console.log("we need d3-queue before dataDriver!");
  if(!$) console.log("we need jquery before dataDriver!");

  var dataset = {};

  var datasetReady = $.Deferred();

  // a jQuery Deferred synchronization variable available globally
  // this is resolved in the queue callback when all data is ready
  window.dataReady.vis2 = window.dataReady.vis2 ? window.dataReady.vis2 : datasetReady;

  // load data files async and converge
  queue()
    //.defer(d3.tsv, "data/vis2_contests.tsv")
    //.defer(d3.tsv, "data/vis2_debates.tsv")
    .defer(d3.csv, "data/vis2_events.csv")
    .defer(d3.json, "data/vis2_search.json")
    .defer(d3.json, "data/vis2_polls.json")
    .await(function(err, events, search, polls){
      console.log(events, search, polls);
    
      window.vis2 = {
        polls: polls,
        search: search,
        events: events
      };

      datasetReady.resolve();
    });

}());

