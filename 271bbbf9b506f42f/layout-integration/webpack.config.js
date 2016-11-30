/*eslint strict:["error", "global"]*/
'use strict';
const webpack = require('webpack'); //eslint-disable-line no-unused-vars
const path = require('path');
const libraryName = 'santaLayoutAPI';
const fs = require('fs');

const packagesRoot = path.resolve(__dirname, '../packages');

/**
 * return an array of folder names
 * @param {string} parent path
 * @return {Array.<string>} array of sub directories names
 */
function readDirs(parent) {
    var dirs = fs.readdirSync(parent);
    return dirs.filter(child => {
        var childPath = path.resolve(parent, child);
        var stats = fs.lstatSync(childPath);
        return stats.isDirectory();
    });
}

/**
 * list all the names of the packages in the project
 * @param {string} root
 * @return {Array.<string>}
 */
function getPackageNames(root) {
    if (!fs.existsSync(root)) {
        throw new Error(`This is not a valid packages project, packages folder is missing at ${root}`);
    }
    return readDirs(root);
}

const packages = getPackageNames(packagesRoot);

var config = {
    devtool: 'inline-source-map',
    entry: [
        path.resolve(__dirname, 'buildAPI.js')
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/', //what is this for?
        filename: libraryName + '.js',
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        loaders: [
            {test: /\.json$/, loader: 'json-to-jsonjs-loader', include: packagesRoot}
        ]
    },
    plugins: [
        //new webpack.optimize.UglifyJsPlugin({minimize: true, compress: {warnings: false}})
    ],
    resolveLoader: {
        root: path.resolve(__dirname, 'loaders')
    },
    resolve: {
        root: packagesRoot,
        extensions: ['', '.js'],
        alias: {
            experiment$: path.resolve(__dirname, 'santa-plugins/mock-experiment.js'),
            zepto: 'zepto-node'
        }
    },
    externals: {
        lodash: 'lodash'
    }
};

packages.forEach(packageName => {
    config.resolve.alias[`${packageName}$`] = path.resolve(packagesRoot, packageName, 'src', 'main', `${packageName}.js`);
    config.resolve.alias[packageName] = path.join(packagesRoot, packageName, 'src', 'main');
});

module.exports = config;
