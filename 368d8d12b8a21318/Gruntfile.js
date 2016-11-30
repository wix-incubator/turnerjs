module.exports = function (grunt) {
    var utils = require('./config/lib/tpa-utils');

    // Supported arguments - editor/viewer
    var spec = grunt.option('spec');

    // Run viewer spec by default
    if (spec !== 'viewer' && spec !== 'editor' && spec !== 'ui-lib') {
        spec = 'viewer';
    }

    var artifactName = utils.getArtifactName(spec);

    var config = {
        protractor_rc: {
            browserstack_editor_rc: {
                options: {
                    configFile: "config/browserstack.config.js",
                    args: {
                        params: {
                            debug: 'tpaIntegrationEditor',
                            artifact: 'santaEditor',
                            suite: 'rcSuite',
                            retries: 3
                        }
                    }
                }
            },
            saucelabs_editor_rc: {
                options: {
                    configFile: "config/saucelabs.config.js",
                    args: {
                        params: {
                            debug: 'tpaIntegrationEditor',
                            artifact: 'santaEditor',
                            suite: 'rcSuite',
                            retries: 3
                        }
                    }
                }

            }
        },
        protractor_local_rc: {
            protractor_local_rc: {
                options: {
                    configFile: "config/local.config.js",
                    args: {
                        params: {
                            debug: 'tpaIntegrationEditor',
                            artifact: 'santaEditor',
                            suite: 'rcSuite'
                        }
                    }
                }
            }
        },
        protractor: {
            options: {
                keepAlive: true
            },
            browserstack: {
                options: {
                    configFile: "config/" + spec + "/browserstack.config.js"
                }
            },
            browserstack_editor: {
                options: {
                    configFile: "config/browserstack.config.js",
                    args: {
                        params: {
                            debug: 'tpaIntegrationEditor',
                            artifact: 'santaEditor',
                            suite: 'santaEditorSuite',
                            retries: 3
                        }
                    }
                }
            },
            saucelabs: {
                options: {
                    configFile: "config/" + spec + "/saucelabs.config.js"
                }
            },
            saucelabs_editor: {
                options: {
                    configFile: "config/saucelabs.config.js",
                    args: {
                        params: {
                            debug: 'tpaIntegrationEditor',
                            artifact: 'santaEditor',
                            suite: 'santaEditorSuite',
                            retries: 3
                        }
                    }
                }

            },
            local_code: {
                options: {
                    configFile: "config/" + spec + "/localCode.config.js"
                }
            },
            santa_local_code: {
                options: {
                    configFile: "config/local.config.js",
                    args: {
                        params: {
                            ReactSource: 'http://localhost',
                            artifact: 'santa',
                            suite: 'santaSuite',
                            retries: 3
                        }
                    }
                }
            },
            editor_local_code: {
                options: {
                    configFile: "config/local.config.js",
                    args: {
                        params: {
                            debug: 'tpaIntegrationEditor',
                            ReactSource: 'http://localhost',
                            EditorSource: 'http://localhost/editor-base',
                            artifact: 'santaEditor',
                            suite: 'santaEditorSuite',
                            retries: 0,
                            /**
                             * add runner names here to run specific tests
                             * example: tests: ['appMarketPanelsRunner']
                             */
                            tests: []
                        }
                    }
                }
            },
            rc_suite_local_code: {
                options: {
                    configFile: "config/local.config.js",
                    args: {
                        params: {
                            debug: 'tpaIntegrationEditor',
                            ReactSource: 'http://localhost',
                            EditorSource: 'http://localhost/editor-base',
                            artifact: 'santaEditor',
                            suite: 'rcSuite',

                            /**
                             * add runner names here to run specific tests
                             * example: tests: ['openSettingsForAppInDemoModeRunner', 'addAppProvisionUserSiteRunner']
                             */
                            tests: []
                        }
                    }
                }
            },
            browserstack_editor_rc: {
                options: {
                    configFile: "config/browserstack.config.js",
                    args: {
                        params: {
                            debug: 'tpaIntegrationEditor',
                            artifact: 'santaEditor',
                            suite: 'rcSuite',
                            retries: 3
                        }
                    }
                }
            },
            saucelabs_editor_rc: {
                options: {
                    configFile: "config/saucelabs.config.js",
                    args: {
                        params: {
                            debug: 'tpaIntegrationEditor',
                            artifact: 'santaEditor',
                            suite: 'rcSuite',
                            retries: 3
                        }
                    }
                }

            },
            your_target: {
                all: {}
            }
        },

        execute: {
            download_santa_snapshot: {
                call: function (grunt, options, async) {
                    var done = async();

                    downloadArtifact('santa', function () {
                        if (isSantaEditorBuild(spec)) {
                            downloadArtifact('santa-editor', function () {
                                done();
                            });
                        } else {
                            done();
                        }
                    });
                }
            },
            clean: {
                call: function (grunt, options, async) {
                    var done = async();

                    cleanArtifactResources('santa', function () {
                        if (isSantaEditorBuild(spec)) {
                            cleanArtifactResources('santa-editor', function () {
                                done();
                            });
                        } else {
                            done();
                        }
                    });
                }
            }
        },

        exec: {
            extract_santa_snapshot: {
                cmd: function () {
                    var command = getExtractArtifactCommand('santa');

                    if (isSantaEditorBuild(spec)) {
                        command += ' && ' + getExtractArtifactCommand('santa-editor');
                    }

                    return command;
                }
            },
            wait_for_rc_deploy: 'sleep 20m'
        }
    };

    if (spec === 'ui-lib') {
        config.execute = {
            clean: {},
            download_santa_snapshot: {}
        };
        config.exec = {
            extract_santa_snapshot: {
                cmd: function(){
                    return '';
                }
            }
        }
    }

    grunt.initConfig(config);


    function getRcVersions(cb) {
        var fetcher = require('./config/lib/artifactFetcher');
        if (getRcVersions.cache){
            cb(getRcVersions.cache);
        }
        else {
            getRcVersions.cache = getRcVersions.cache || {};
            fetcher.getArtifactRcVersion('santa-editor', function(EditorSource) {
                getRcVersions.cache.EditorSource = EditorSource;
                fetcher.getArtifactRcVersion('santa', function (ReactSource) {
                    getRcVersions.cache.ReactSource = ReactSource;
                    grunt.task.run('exec:wait_for_rc_deploy');
                    cb(getRcVersions.cache);
                });
            });
        }
    }

    function runProtractorWithLatestRc() {
        var done = this.async();
        var config = this.data;
        var target = this.target;

        getRcVersions(function(rcVersions){
            config.options.args.params.ReactSource = rcVersions.ReactSource;
            config.options.args.params.EditorSource = rcVersions.EditorSource;
            var protractorConf = grunt.config.get('protractor');
            protractorConf[target] = config;
            grunt.config.set('protractor', protractorConf);
            grunt.task.run('protractor:' + target);
            done();
        });
    }


    grunt.loadTasks('config/tasks');
    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-aws-s3');

    grunt.registerTask('test-local', ['execute:set_rc_versions', 'protractor:local_rc']);
    grunt.registerTask('build', ['execute:clean', 'execute:download_santa_snapshot', 'exec:extract_santa_snapshot', 'static-upload-to-s3', 'protractor:browserstack']);
    grunt.registerTask('build-rc', ['protractor:saucelabs_editor_rc', 'protractor:browserstack_editor_rc']);
    grunt.registerTask('build-ui-lib', ['protractor:saucelabs']);
    grunt.registerMultiTask('protractor_rc', 'get the latest rc versions and run integration tests', runProtractorWithLatestRc);
    grunt.registerTask('rc-local-code', ['protractor:rc_suite_local_code']);
    grunt.registerTask('santa-local-code', ['protractor:santa_local_code']);
    grunt.registerTask('editor-local-code', ['protractor:editor_local_code']);
};

function getExtractArtifactCommand(artifactName) {
    var command = 'mkdir ' + artifactName + ' && tar zxf ' + artifactName + '-snapshot.tar.gz -C ./' + artifactName;
    console.log('Executing command: ' + command);
    return command;
}

function cleanArtifactResources(artifactName, onComplete) {
    var rimraf = require('rimraf');
    var fs = require('fs');

    fs.unlink(artifactName + '-snapshot.tar.gz', function () {
        console.log('Cleaned: ' + artifactName + '-snapshot.tar.gz');

        // Remove folder with the extracted artifact
        rimraf(artifactName, function () {
            console.log('Cleaned: ' + artifactName + '/');
            onComplete();
        });
    });
}

function downloadArtifact(artifactName, onComplete) {
    var fetcher = require('./config/lib/artifactFetcher');

    fetcher.downloadArtifact(artifactName, function () {
        onComplete();
    });
}

function isSantaEditorBuild(spec) {
    return spec === 'editor';
}
