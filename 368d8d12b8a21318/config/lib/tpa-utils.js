'use strict';
module.exports = {
    loadWebTester: function (grunt) {
        if (require('fs').existsSync('./node_modules/web-tester2')) {
            grunt.loadTasks('./node_modules/web-tester2/src/grunt-tasks');
        }
    },
    getStaticFilesPrefix: function (grunt) {
        var hostname = require('os').hostname().replace(/[^a-z0-9]/ig, '').toLowerCase();
        return (grunt.option('statics-prefix') || hostname) + '/santa';
    },
    getArtifactName: function (spec) {
        // Run viewer spec by default
        if (spec !== 'viewer' && spec !== 'editor') {
            spec = 'viewer';
        }

        return spec === 'viewer' ? 'santa' : 'santa-editor';
    }
};
