# CS171 Final PRoject

Team: Data, Inc.

Team Members: James Curtin, Anna Papp, Wilson Qin

Team Website: http://wilsonqin.github.io/cs171-elections-2016/site/

Team Video: https://youtu.be/Eowv_XKaIxE

## Code:

Code for our project visualizations and website is found in the `site` directory.

## Data:

Original data sources, data gathering and data wrangling scripts are contained in this directory, organized by category. The scripts are written in a mix of Node.js and iPython Notebook.

##### `data/events`

This folder contains data on key events that have happened during the presidential election. The second visualization's base data draws from the data files here. These were compiled manually; there is no code to run.

##### `data/polls`

Running the script `get_huff_polls.sh` will download poll results from the Huffington Post Pollster API. Running `node format.js` outputs poll data as a JSON string to standard output in a format aggregated by percent approval of candidates on dates.

#### `data/search`

The data files in this folder are derived from Google Trends CSV exports. Running `node format.js` outputs the Trends data to a JSON format to standard output.

#### `data/votes`

This folder contains base files and scripts pertaining to demographic and census related facts on US counties (running `node formatData.js` will format vis1_county_facts.csv to standard out as JSON).

The `politico` subfolder contains all base primary election data (JSON) from individual states and counties of individual states in the `politico/data` subfolder. Within the politico folder, running `scraper.ipynb` as a Jupyter/iPython notebook works to inject the front end `scrapePolitico.js` script into the Politico pages to get the election results from each state's page, running through `us-state-names.tsv` for state names to check for. Running `node mergeData.js` after all requisite state election data has been gathered merges them into an aggregated JSON object allowing for state result lookups and county result lookups. 

The `casper` subfolder contains a previous Node.js and CasperJS based version of a data gathering script for the Politico site. However, it produced less consistent results than the python and selenium based one described in the passage above.