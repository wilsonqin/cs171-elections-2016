/* 
 * Script to get politico's presidential data
 */

var casper = require('casper').create();

var urlBase = "http://www.politico.com/2016-election/results/map/president/";

var curState = casper.cli.args[0];
var curStateSlug = curState.toLowerCase().replace(/ /g, "-");

casper.start();

casper.open(urlBase + curStateSlug, function(){
  this.wait(2500, function(){
    this.scrollToBottom();

    this.page.injectJs("scrapePolitico.js");
    var results = this.evaluate(function(stateName){
      return getState(stateName);
    }, curState);

    if(!results) results = {};
    results.title = this.getTitle();
    this.echo(JSON.stringify(results));
  });
});

/* Go to each state's page and run custom functions that are injected */
casper.then(function(){
  this.page.injectJs("scrapePolitico.js");
  var results = this.evaluate(function(stateName){
    return getState(stateName);
  }, curState);

  if(!results) results = {};
  results.title = this.getTitle();
  this.echo(JSON.stringify(results));
});

casper.run();