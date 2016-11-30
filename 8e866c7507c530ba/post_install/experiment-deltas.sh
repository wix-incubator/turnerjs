#!/bin/sh

HOST="ci.dev.wix"
buildId=$1
buildTypeId=$2

prevBuildId=`wget -q -O - http://releaseuser:releaseuser@$HOST/httpAuth/app/rest/buildTypes/$2/builds?count=2 | awk -F "build " '{print $3}' | awk '{print $1}' | sed  's/id=//' | sed 's/"//g'`
wget -q -O /tmp/$buildId http://releaseuser:releaseuser@$HOST/httpAuth/downloadBuildLog.html?buildId=$buildId 
wget -q -O /tmp/$prevBuildId http://releaseuser:releaseuser@$HOST/httpAuth/downloadBuildLog.html?buildId=$prevBuildId 

new=`cat /tmp/$buildId | grep " experiment=" | awk '{print $3}' | sed 's/.$//g'`
old=`cat /tmp/$prevBuildId | grep " experiment=" | awk '{print $3}' | sed 's/.$//g'`

node post_install/experiment-deltas.js "'$old'" "'$new'"

rm /tmp/$buildId /tmp/$prevBuildId
