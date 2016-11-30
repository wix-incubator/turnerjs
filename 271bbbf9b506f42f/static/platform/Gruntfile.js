'use strict';

module.exports = function(grunt) {

  if (grunt.option('grunt-time')) {
    require('time-grunt')(grunt);
  }

  ////////////////////// get and edit config: ////////////////////////////////
  function replaceConfig(options) {
    return {
      options: {
        patterns: [{
          match: 'SCRIPTS_LOCATION',
          replacement: function() { return require('fs').readFileSync(options.bundle); }
        }, {
          match: 'WIX_CODE_DEBUG',
          replacement: options.isDebug
        }]
      },
      files: [{flatten: true, src: ['templates/index.html'], dest: options.targetFile}]
    };
  }
  ////////////////////////////////////////////////////////////////////////////
  var config = {
    clean: {
      main: ['target/', '.temp/']
    },
    eslint: {
      main: {
        options: {
          cache: true
        },
        src: ['src/**/*.js', 'Gruntfile.js', 'webpack*']
      }
    },
    jasmine_nodejs: {
      options: {
        specNameSuffix: 'spec.js'
      },
      main: {
        specs: 'src/test/**'
      },
      teamcity: {
        options: {
          reporters: {
            teamcity: true
          }
        },
        specs: '<%= jasmine_nodejs.main.specs %>'
      }
    },
    watch: {
      test: {
        files: ['src/**/*.js'],
        tasks: ['test'],
        options: {spawn: true}
      }
    },
    webpack: {
      debug: [require('./webpack.config.debug.js')],
      min: [require('./webpack.config.min.js')]
    },
    replace: {
      debug: replaceConfig({bundle: './.temp/bundle.js', targetFile: 'target/index.debug.html', isDebug: true}),
      min: replaceConfig({bundle: './.temp/bundle.min.js', targetFile: 'target/index.html', isDebug: false})
    }
  };

    ////////////////////////////////////////////////////////////////////////////

  grunt.initConfig(config);

  require('jit-grunt')(grunt, {})({
      // customTasksDir: './conf/tasks/'
  });

  ////////////////////////////////////////////////////////////////////////////
  grunt.registerTask('lint', 'Lint source', ['eslint']);
  grunt.registerTask('test', 'Testing', ['jasmine_nodejs:main']);
  grunt.registerTask('test-watch', 'Testing', ['watch:test']);
  grunt.registerTask('build', 'Build project', ['webpack', 'replace']);

  grunt.registerTask('default', ['lint', 'test', 'clean', 'build']);

  grunt.registerTask('teamcity', 'Teamcity maven step #1', ['lint', 'clean', 'build']);
  grunt.registerTask('teamcity-test', 'Teamcity maven step #2', ['jasmine_nodejs:teamcity']);
  ////////////////////////////////////////////////////////////////////////////

};
