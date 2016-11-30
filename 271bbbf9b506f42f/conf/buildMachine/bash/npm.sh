#!/bin/bash

# set -x
# set -e
#
# export NVM_DIR=/home/builduser/.nvm
# . "$NVM_DIR/nvm.sh" || echo "##teamcity[buildProblem description='nvm missing on agent!']"
# nvm install 5.6
# npm rebuild node-sass

echo "node version:"
node --version

echo "npm version:"
npm --version
echo "npm registry:"
npm config get registry

#npm cache clean
npm i || (echo "##teamcity[buildProblem description='npm install failed!']" && exit)
