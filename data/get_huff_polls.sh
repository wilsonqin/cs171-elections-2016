COMMAND="/usr/bin/curl";
COMMAND="$COMMAND http://elections.huffingtonpost.com/pollster/api/polls.json"
COMMAND="$COMMAND?topic=2016-president-gop-primary&page=";

END=1;

for i in $(seq 1 $END); do $($COMMAND$i > huff-poll-page-$i.json); done