'use strict';

var _ = require('lodash');
var base = require('./webpack.config.js');

module.exports = _.merge({}, base, {
  output: {
    filename: 'rmi-bundle.js'
  }
});
