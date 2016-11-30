#!/bin/bash

rm -rf .bundle
rm -rf vendor
echo "bundle version:"
bundle --version
bundle install --path vendor/bundle
# Check bundle:
which sass > /dev/null || (echo "##teamcity[buildProblem description='Bad agent! (no sass)']" && exit)
((which sass && sass -v) | grep -e 'Sass 3\.[3456789]') || (echo "##teamcity[buildProblem description='Bad agent! (bad sass version)']" && exit)
