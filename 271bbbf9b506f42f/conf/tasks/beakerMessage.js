'use strict'
module.exports = function register(grunt) {

    grunt.registerTask('beakerMessage', () => {
        const line = '-------------------------------------------------------'

        grunt.log.ok('')
        grunt.log.ok(line)
        grunt.log.ok('This is Beaker!')
        grunt.log.ok('Karma integration testing.')
        grunt.log.ok('See the documentation here:')
        grunt.log.ok('https://github.com/wix-private/santa/wiki/Beaker')
        grunt.log.ok(line)
        grunt.log.ok('')

    })
}
