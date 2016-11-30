/**
 * Created by avim on 4/27/16.
 */
'use strict'
module.exports = function register(grunt) {

    grunt.registerTask('local-requirejs-config', () => {
        const path = require('path')
        const santaRoot = path.resolve(__dirname, '..', '..')
        const packagesUtils = require('requirejs-packages').packagesUtils
        const packages = packagesUtils.getPackages(santaRoot, 'packages', 'src/main')
        const vm = require('vm')
        const template = grunt.file.read(path.resolve(__dirname, 'lib', 'localRequirejsConfigTemplate.template'))
        const rjsText = grunt.file.read(path.resolve(santaRoot, 'app', 'rjs-config.js'))
        // console.log(rjsText)
        const rjsConfig = grunt.template.process(template, {data: {rjsConfig: rjsText}})
        // console.log(rjsConfig)
        const rjs = vm.runInNewContext(rjsConfig)

        const config = Object.assign({}, rjs, {packages})

        const filePath = path.resolve(santaRoot, 'server', 'resources', 'generated', 'local-requirejs-config.json')
        grunt.file.write(
            filePath,
            JSON.stringify(config, null, 4))
        grunt.log.ok(`created file ${filePath}`)
    })
}
