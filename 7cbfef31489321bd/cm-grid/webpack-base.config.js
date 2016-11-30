const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')

module.exports = {
  context: path.resolve('src'),
  entry: {
    'grid': './app.jsx',
    'grid.test': '../test/browser/infrastructure/app.jsx'
  },
  output: {
    libraryTarget: 'umd',
    path: path.resolve('dist'),
    filename: '[name].js'
  },
  devtool: 'source-map',
  plugins: [
    new CaseSensitivePathsPlugin(),
    new webpack.DefinePlugin({'process.env': {'NODE_ENV': JSON.stringify(process.env.NODE_ENV)}}),
    new CopyWebpackPlugin([
      {from: '../test/browser/infrastructure/index.html', to: 'grid.test.html'}
    ])
  ],
  resolveLoader: {
    root: path.resolve(__dirname, 'node_modules')
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: p => {
          return p.includes('node_modules') && !p.includes('common-test/src') && !p.includes('common/src') && !p.includes('wix-code-media-manager-support/src')
        },
        loader: 'babel',
        query: {
          presets: require.resolve('babel-preset-es2015')
        }
      },

      {
        test: /\.css$/,
        loader: 'style!css'
      },
      {
        test: /node_modules.*\.scss$/,
        loader: 'style!css!postcss!sass'
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: 'style!css?modules=true&camelCase=true&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass'
      }

    ]
  },
  postcss: [autoprefixer({
    browsers: ['last 2 ff versions', 'last 2 Chrome versions', 'last 2 Edge versions', 'Safari >= 8', 'ie >= 11']
  })]
}
