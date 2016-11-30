'use strict';
const env = require('./dist/test/environment');

exports.config = {
  framework: 'jasmine',
  capabilities: {
    browserName: 'chrome'
  },
  specs: ['dist/test/**/*.e2e.js'],
  onPrepare() {
    browser.ignoreSynchronization = true;
    return env.start();
  }
};
