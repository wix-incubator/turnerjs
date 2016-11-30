/*eslint strict:["error", "global"]*/
'use strict';
var webpack = require('webpack');
var config = require('./webpack.config.js');
var _ = require('lodash');
var createLayoutTestsDataAPI = require('./utils/createLayoutTestsDataAPI');

function build(targetPath, fileName, cb){
    let buildConfig = _.chain(config).cloneDeep().set(['output', 'path'], targetPath).set(['output', 'filename'], fileName).value();
    webpack(buildConfig, function(err/*, stats*/){
        if (err){
            console.log(err);
            cb(err, null);
        } else {
            cb(null, {
                //possibly include some stats on success?
            });
        }
    });
}


module.exports = {
    build: build,
    testsDataAPI: createLayoutTestsDataAPI()
};
