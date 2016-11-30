'use strict';

var path = require('path');

module.exports = {
  context: path.join(__dirname, '/'),
  entry: './RemoteModelInterface.js',
  output: {
    path: path.join(__dirname, './'),
    filename: 'rmi-bundle.js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  }
};
