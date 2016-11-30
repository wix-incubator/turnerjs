'use strict';

process.env.BABEL_ENV = 'specs';
process.env.wallabyScriptDir = __dirname;

module.exports = function(wallaby) {
  return {
    env: {
      type: 'node'
    },

    testFramework: 'jasmine',

    files: [
      {pattern: `node_modules/jasmine-expect/**/*.*`, instrument: false, load: false},
      {pattern: `node_modules/a-wix-react-native-commons/lib/**/*.*`, instrument: false, load: false},
      {pattern: 'node_modules/enzyme-drivers/**/*.*', instrument: false, load: false},
      'src/**/*.js', 'test/components/drivers/**/*.js', 'test/mock/**/*.js'
    ],

    tests: [
      {pattern: 'test/**/*.spec.js', load: true, instrument: true}
    ],

    compilers: {
      '**/*.js': wallaby.compilers.babel({
        "presets": [
          "react-native"
        ],
        "retainLines": true
      })
    },

    workers: { initial: 1, regular: 1 },

    setup: function(w) {
      require('babel-polyfill');
    }
  };
};