/*eslint semi:0 curly:0*/
'use strict'

const renameSync = require('fs').renameSync

const fileNameToPair = fileName => ({
    specjs: fileName,
    unitjs: fileName.replace(/\.spec\.js$/, '.unit.js')
})

const checkFile = file => {
    renameSync(file.specjs, file.unitjs)
    const err = require('shelljs').exec('grunt jasmine:units', {silent: true}).code
    if (err) renameSync(file.unitjs, file.specjs)
    console.log(err ? 'FAIL' : 'PASS', 'for file', file.specjs)
}

module.exports = grunt => {
    grunt.registerTask('unitize', pattern => {
        require('glob')
            .sync(`packages/${pattern || ''}*/**/*.spec.js`)
            .map(fileNameToPair)
            .map(f => (console.log(f), f)) //eslint-disable-line no-sequences
            .forEach(checkFile)
    })
}
