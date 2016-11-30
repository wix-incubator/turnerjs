const path = require('path')
const webpack = require('webpack')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const autoprefixer = require('autoprefixer')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  context: path.resolve('src'),
  entry: {
    'cmMyAccountApp': './index.js'
  },
  output: {
    libraryTarget: 'umd',
    path: path.resolve('dist'),
    filename: '[name].js'
  },
  externals: {
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom'
    },
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    }
  },
  devtool: 'source-map',
  plugins: [
    new CaseSensitivePathsPlugin(),
    new webpack.DefinePlugin({'process.env': {'NODE_ENV': JSON.stringify(process.env.NODE_ENV)}}),
    new CopyWebpackPlugin([
      {from: './index.vm'},
      {from: '**', to: 'assets', context: '../assets'},
      {from: '**', to: 'assets', context: '../node_modules/cm-grid/assets'}
    ])
  ],
  resolveLoader: {
    root: path.resolve(__dirname, 'node_modules')
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  postcss: [autoprefixer({
    browsers: ['last 2 ff versions', 'last 2 Chrome versions', 'last 2 Edge versions', 'Safari >= 8', 'ie >= 11']
  })]
}
