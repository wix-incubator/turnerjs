'use strict';
module.exports = function register(grunt) {

    grunt.registerTask('static-upload-to-s3', function() {
        var utils = require('../lib/tpa-utils.js');
        var spec = grunt.option('spec');
        var staticFilesPrefix = 'SNAPSHOT';
        var artifactName = utils.getArtifactName(spec);
        var filesToUpload = [
            {
                expand: true,
                cwd: 'santa/',
                src: ['js/**', 'lib/**', 'packages/**', 'packages-bin/**', '!**/test/**', 'app/**', 'static/**', 'versions/**'],
                dest: staticFilesPrefix + '/santa'
            },
            {
                expand: true,
                cwd: 'runners/',
                src: ['**'],
                dest: staticFilesPrefix + '/runners'
            }
        ];

        if (spec === 'editor') {
            filesToUpload.push({
                expand: true,
                cwd: 'santa-editor/',
                src: ['js/**', 'lib/**', 'packages/**', 'packages-bin/**', '!**/test/**', 'app/**', 'static/**', 'bower_components/**', 'cssCache/**', 'baseUILibrary/**', 'node_modules/editor-add-panel/**'],
                dest: staticFilesPrefix + '/santa-editor'
            });
        }

        console.log('Artifact name: ' + artifactName);

        utils.loadWebTester(grunt);

        grunt.config.set('aws_s3', {
            options: {
                accessKeyId: 'AKIAI4L5S6DT5KXWQ4EA',
                secretAccessKey: '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',
                region: 'us-east-1',
                access: 'public-read',
                sslEnabled: false,
                maxRetries: 5,
                stream: true,
                uploadConcurrency: 12,
                downloadConcurrency: 12,
                differential: true,
                displayChangesOnly: true,
                excludedFromGzip: ['*.png', '*.jpg', '*.jpeg']
            },
            uploadTarget: {
                options: {
                    bucket: 'integration-tests-statics',
                    params: {
                        CacheControl: 'max-age=0',
                        Expires: new Date(Date.now() - 1000 * 60 * 24),
                        StorageClass: 'REDUCED_REDUNDANCY'
                    }
                },
                files: filesToUpload
            }
        });

        grunt.task.run('aws_s3:uploadTarget');
    });

};
