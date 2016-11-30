'use strict'
module.exports = {
    loadWebTester: grunt => {
        if (require('fs').existsSync('./node_modules/web-tester2')) {
            grunt.loadTasks('./node_modules/web-tester2/src/grunt-tasks')
        }
    },
    getStaticFilesPrefix: grunt => {
        const hostname = require('os').hostname().replace(/[^a-z0-9]/ig, '').toLowerCase()
        return `${grunt.option('statics-prefix') || hostname}/santa`
    }
}
