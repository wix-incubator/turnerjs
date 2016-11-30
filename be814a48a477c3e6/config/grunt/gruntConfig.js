'use strict'

module.exports = {
    clean: [
        'santa-snapshot.tar.gz',
        'santa-editor-snapshot.tar.gz',
        'santa/**',
        'santa-editor/**'
    ],
    download: {
        options: {
            snapshots: [
                'santa',
                'santa-editor'
            ]
        }
    },
    exec: {
        extract_santa: 'mkdir -p santa/ && tar zxf santa-snapshot.tar.gz -C santa/',
        extract_santa_editor: 'mkdir -p santa-editor/ && tar zxf santa-editor-snapshot.tar.gz -C santa-editor/'
    },
    aws_s3: {
        options: {
            // TODO don't hold credentials here?
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
                    Expires: new Date(),
                    StorageClass: 'REDUCED_REDUNDANCY'
                }
            },
            files: [
                {
                    expand: true,
                    cwd: 'santa/',
                    src: [
                        'js/**',
                        'lib/**',
                        'packages/**',
                        'packages-bin/**',
                        '!**/test/**',
                        'app/**',
                        'static/**',
                        'versions/**'
                    ],
                    dest: 'SNAPSHOT/santa'
                },
                {
                    expand: true,
                    cwd: 'santa-editor/',
                    src: [
                        'js/**',
                        'lib/**',
                        'packages/**',
                        'packages-bin/**',
                        '!**/test/**',
                        'app/**',
                        'static/**',
                        'bower_components/**',
                        'cssCache/**',
                        'baseUILibrary/**',
                        'node_modules/editor-add-panel/**'
                    ],
                    dest: 'SNAPSHOT/santa-editor'
                },
                {
                    expand: true,
                    cwd: 'runners/',
                    src: ['**'],
                    dest: 'SNAPSHOT/runners'
                }
            ]
        }
    },
    protractor: {
        local_selenium: {
            options: {
                configFile: 'config/protractor/local-selenium.config.js'
            }
        },
        local_all: {
            options: {
                configFile: 'config/protractor/local-all.config.js'
            }
        },
        browserstack: {
            options: {
                configFile: 'config/protractor/browserstack.config.js'
            }
        },
        saucelabs: {
            options: {
                configFile: 'config/protractor/saucelabs.config.js'
            }
        }
    }
}
