// Generated on 2016-04-14 using generator-wix-angular 1.0.88
'use strict';

module.exports = function (grunt) {
  require('wix-gruntfile')(grunt, {
    version: '1.0.88',
    karmaConf: require('./karma.conf.js'),
    protractor: false,
    bowerComponent: true
  });
  var useminPrepare = grunt.config('useminPrepare');
  useminPrepare.options.flow.steps.concat = ['concat'];
  grunt.config('useminPrepare', useminPrepare);
};
