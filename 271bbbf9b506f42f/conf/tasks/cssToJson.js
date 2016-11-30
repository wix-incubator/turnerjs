'use strict'
module.exports = function register(grunt) {

    grunt.registerMultiTask('cssToJson', 'compile css files into skins.js file', function () {
        const convertCssAndHtmlToJson = require('./lib/cssToJson').convertCssAndHtmlToJson

        try {
            convertCssAndHtmlToJson(this.options(), this.async())
        } catch (ex) {
            grunt.fail.fatal(`Method convertCssAndHtmlToJson (in cssToJson.js) failed with error: ${ex}`)
        }
    })
}
