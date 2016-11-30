'use strict'
module.exports = function register(grunt) {

    grunt.registerTask('local-ploader-config', () => {
        const packagesUtils = require('requirejs-packages').packagesUtils
        const path = require('path')

        const template = grunt.file.read(path.resolve(__dirname, 'lib', 'pLoaderTemplate.template'))
        const baseDir = path.resolve(__dirname, '..', '..')

        const templateData = {
            data: {
                packages: JSON.stringify(packagesUtils.getPackageNames(packagesUtils.getPackagesRoot(baseDir, 'packages'))),
                rjsConfig: grunt.file.read(path.resolve(baseDir, 'app', 'rjs-config.js'))
            }
        }
        const filePath = path.resolve(baseDir, 'target', 'versions', 'pLoaderConfig.js')
        grunt.file.write(
            filePath,
            grunt.template.process(template, templateData))
        grunt.log.ok(`created file ${filePath}`)
    })
}
