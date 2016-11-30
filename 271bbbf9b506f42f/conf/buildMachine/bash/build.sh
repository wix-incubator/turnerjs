#!/bin/bash

#echo "##teamcity[buildProblem description='Broken on purpose for testing.']" && exit

# dirname "$0"
# echo dirname "$0"
DIR=`dirname "$0"`

echo "##teamcity[blockOpened name='Build Setup']"


echo "##teamcity[blockOpened name='state check']"
$DIR/state_check.sh
echo "##teamcity[blockClosed name='state check']"

echo "##teamcity[blockOpened name='bundle']"
$DIR/bundle.sh
echo "##teamcity[blockClosed name='bundle']"

echo "##teamcity[blockOpened name='npm']"
$DIR/npm.sh
echo "##teamcity[blockClosed name='npm']"


echo "##teamcity[blockClosed name='Build Setup']"
