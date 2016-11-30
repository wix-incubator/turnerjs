'use strict'
module.exports = function register(grunt) {
    grunt.registerMultiTask('smartJsonlint', function () {
        // console.log(this.data.src)
        // console.log(grunt.config.get('eslint'))

        // const _ = require('lodash')
        const lint = require('./lib/smart-jsonlint')
        const glob = require('glob')
        const path = require('path')
        const root = process.cwd()
        const cacheDir = path.resolve(root, this.data.options.cache)

        const files = glob.sync(path.join(root, 'static/**/*.json'), {ignore: '**/node_modules/**'})
        // const files = _(this.data.src).map(f => glob.sync(path.join(root, f))).flatten().value()
        // console.log(files.length)
        // const files = glob.sync(path.join(root, 'static/**/*.json'))
        const failed = lint.checkAndCompile(files, cacheDir)
        // const failed = lint.checkAndCompile(this.filesSrc, this.data.options.cache) // for some reason this is too slow

        if (failed === 0) {
            grunt.log.ok('json lint successful')
        } else {
            grunt.fail.warn('json lint failed')
        }
    })
}
