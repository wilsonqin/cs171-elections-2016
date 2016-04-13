(function(){
  if(!d3) console.log("we need d3 before dataDriver!");
  if(!queue) console.log("we need d3-queue before dataDriver!");
  if(!$) console.log("we need jquery before dataDriver!");

  var dataset = {};

  var datasetReady = $.Deferred();

  // load data files async and converge
  queue()
    .defer(d3.json, "data/county_facts.json")
    .defer(d3.json, "data/us.json")
    .defer(d3.tsv, "data/us-state-names.tsv")
    .defer(d3.tsv, "data/us-county-names.tsv")
    .await(function(err, countyFacts, usTOPOJSON, stateNames, countyNames){

      var factMap = d3.map(countyFacts, function(d){ return d.fips; });

      dataset = {
        countyFacts: factMap,
        stateNames: stateNames,
        countyNames: countyNames,
        usTOPOJSON: usTOPOJSON,
      };

      window.data = window.data ? window.data : dataset;

      datasetReady.resolve();
    });

  window.dataReady = window.dataReady ? window.dataReady : datasetReady;
}());