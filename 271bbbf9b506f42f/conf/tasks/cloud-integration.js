'use strict'
module.exports = function register(grunt) {

    grunt.registerTask('cloud-integration', () => {
        const utils = require('./lib/tpa-utils.js')
        utils.loadWebTester(grunt)

        const staticFilesPrefix = utils.getStaticFilesPrefix(grunt)

        grunt.config.set('webTester', {
            tpa: {
                options: {
                    staticFilesUrl: `http://s3.amazonaws.com/integration-tests-statics/${staticFilesPrefix}`,
                    tags: ['dev'],
                    browsers: ['chrome']
                },
                files: [
                    {cwd: 'packages/tpaIntegration/src/main', expand: true, src: 'runners/*.js', dest: '/', artifact: 'tpaIntegration'}
                ]
            }
        })

        grunt.task.run('webTester:tpa')
    })
}
