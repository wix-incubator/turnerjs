// Generated on 2016-04-14 using generator-wix-angular 1.0.88
'use strict';

module.exports = function (grunt) {
  var turnerModuleNames = ['index.d.ts', 'module/index.d.ts'];

  require('wix-gruntfile')(grunt, {
    version: '1.0.88',
    karmaConf: require('./karma.conf.js'),
    protractor: false,
    bowerComponent: true
  });
  var copy = grunt.config('copy');
  copy.dist.files.push({
    expand: true,
    cwd: '.tmp/test/lib/',
    src: ['*.d.ts', '*.js'],
    dest: 'module/generated'
  });
  copy.dist.files = copy.dist.files.concat(turnerModuleNames.map(function (name) {
    return {
      expand: true,
      cwd: '.tmp/test/lib/',
      src: ['*.d.ts'],
      rename: function () {
        return name;
      }
    };
  }));
  grunt.config('copy', copy);

  var replace = grunt.config('replace');
  replace.dtsAsModule = {
    src: turnerModuleNames,
    overwrite: true,
    replacements: [{
      from: /declare /g,
      to: 'export '
    }]
  };
  grunt.config('replace', replace);
  grunt.hookTask('package').push('replace:dtsAsModule');
};
