//$(".timeline-group").map(function(d){ return this.id.split("state")[1]; });

// $(".timeline-group").map(function(d){ return $(this).find(".results-table tr .results-name"); })

// var pops = $(".timeline-group").map(function(d){ return $(this).find(".results-table tr .results-popular"); });
// pops = pops.forEach(function(d,i){ return d.innerHTML; });
// console.log(pops);

// $(".timeline-group").map(function(d){ return $(this).find(".results-table tr .results-percentage"); })


function readTable(table, isState){
  var results = [];

  var stateGroupContents = $(table).find(".results-data tr");
  stateGroupContents.each(function(i, row){
    var party = $(row).attr("class").split("-")[1];
    var candidate = $(row).find(".results-name .name-combo")[0].innerHTML;
    var spanInd = candidate.lastIndexOf("</span>");
    var spanLen = 7;
    if(spanInd >= 0){
      candidate = candidate.slice(spanInd + spanLen);
    }
    candidate = candidate.trim();
    var pctVote = parseFloat($(row).find(".results-percentage .number")[0].innerHTML);
    var popVote = parseInt($(row).find(".results-popular")[0].innerHTML.replace(",", ""));
    
    var result = {
      candidate: candidate,
      party: party,
      percent: pctVote,
      popular: popVote
    };

    if(isState){
      var delegates = parseInt($(row).find(".delegates-cell")[0].innerHTML);
      result.delegates = delegates;
    }

    results.push(result);
  });

  return results;
}

// process results group
function getState(state){
  var stateName = state;

  var resultGroups = $(".results-group");
  var stateGroup = resultGroups[0];
  var countyGroups = resultGroups.slice(1);

  // read state
  var stateResults = readTable(stateGroup, true);
  stateResults.forEach(function(state){
    state.name = stateName;
  });
  var countyResults = [];


  countyGroups.each(function(i, res){
    var fips = $(res).data('fips');
    var countyName = $(res).attr("id").replace(/county/g, "");
    var countyRecords = readTable(res);
    countyRecords.forEach(function(d){
      d.fips = fips;
      d.countyName = countyName;
    });
    countyResults = countyResults.concat(countyRecords);
  });

  return {
    state: stateResults,
    countyResults: countyResults
  };
}

function testFunc(val){
  return val;
}

window.testFunc = testFunc;
window.getState = getState;