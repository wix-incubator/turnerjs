'use strict'

module.exports = (grunt) => {

    require('time-grunt')(grunt)

    grunt.initConfig(require('./gruntConfig.js'))

    grunt.loadTasks('./config/tasks')

    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-exec')
    grunt.loadNpmTasks('grunt-aws-s3')
    grunt.loadNpmTasks('grunt-protractor-runner')

    grunt.registerTask('build', [
        'clean',
        'download',
        'exec:extract_santa',
        'exec:extract_santa_editor',
        'aws_s3:uploadTarget'
    ])
    grunt.registerTask('test', ['protractor:browserstack', 'protractor:saucelabs'])
}
