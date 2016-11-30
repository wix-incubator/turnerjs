'use strict'
module.exports = function register(grunt) {

    const dataRefsUtils = require('./lib/dataRefsUtils')

    function getFileContent(path) {
        return JSON.parse(grunt.file.read(path))

    }

    grunt.registerTask('getDataRefs', 'Gets a map of all the properties and data schema refs', function () {
        try {
            const options = this.options()
            const dataRefs = {
                Data: dataRefsUtils.getAllRefs(getFileContent(options.data)),
                Design: dataRefsUtils.getAllRefs(getFileContent(options.design)),
                Properties: dataRefsUtils.getAllRefs(getFileContent(options.properties))
            }

            grunt.file.write(options.output, JSON.stringify(dataRefs, null, 4))
        } catch (ex) {
            grunt.fail.fatal(`Generating data refs from data and properties schema: ${ex}`)
        }
    })
}
