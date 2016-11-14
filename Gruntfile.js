// Generated on 2016-04-14 using generator-wix-angular 1.0.88
'use strict';

module.exports = function (grunt) {
  require('wix-gruntfile')(grunt, {
    version: '1.0.88',
    karmaConf: require('./karma.conf.js'),
    protractor: false,
    bowerComponent: true
  });
  var copy = grunt.config('copy');
  copy.dist.files = [
    {
      expand: true,
      cwd: '.tmp/test/lib/',
      src: ['*.d.ts', '*.js'],
      dest: 'module/generated'
    }, {
      expand: true,
      cwd: '.tmp/test/lib/',
      src: ['*.d.ts'],
      rename: function () {
        return 'index.d.ts';
      }
    }
  ];
  grunt.config('copy', copy);
};
