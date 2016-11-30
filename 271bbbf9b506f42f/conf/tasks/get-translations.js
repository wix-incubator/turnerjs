'use strict'
module.exports = function (grunt) {
    grunt.registerMultiTask('get-translations', function () {
        const translationUtil = require('./lib/translationUtil')
        const _ = require('lodash')
        const path = require('path')
        const done = this.async()
        const options = this.options()
        const requestUtils = require('santa-utils').requestUtils

        const langsGaPromise = requestUtils.getArtifactGa('santa-langs', options.ci, '1.482.0')
        Promise.all([
            langsGaPromise,
            langsGaPromise.then(translationUtil.getLanguages)
        ]).then(promises => {
            const langsGa = promises[0]
            const languages = promises[1]
            grunt.file.write(options.languagesDest, `define([], function() {\n\t'use strict';\n\treturn ${JSON.stringify(languages, null, 2)};\n});`)
            return Promise.all(_.map(options.features, (featurePath, featureName) => {
                const pathToWrite = path.join(__dirname, '..', '..', featurePath, 'translations', `${featureName}.js`)
                return translationUtil.createFeatureTranslationFile(langsGa, languages, featureName)
                    .then(contents => {
                        try {
                            if (grunt.file.read(pathToWrite) !== contents) {
                                grunt.file.write(pathToWrite, contents)
                            }
                        } catch (e) {
                            grunt.file.write(pathToWrite, contents)
                        }
                    })
            }))
        })
        .catch(err => {
            if (options.ci) {
                grunt.log.writeln("##teamcity[buildProblem description='get-translations failed, lifecycle probably down.']")
                grunt.fail.warn(`Error: ${err}`)
                done(err)
            } else {
                grunt.log.writeln(`could not get translations, did not update. Error: ${err}`)
                done()
            }
        })
        .then(done)
    })
}
