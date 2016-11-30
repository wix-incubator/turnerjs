'use strict';

var path = require('path');

module.exports = {
  context: path.join(__dirname, '/'),
  entry: './src/main/index.js',
  output: {
    path: path.join(__dirname, '/.temp/')
  },
  module: {
    loaders: [
      {
        test: './src/main/worker.js',
        loader: 'worker-loader?inline=true'
      }
    ]
  }
};
