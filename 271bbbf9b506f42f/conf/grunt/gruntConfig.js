'use strict'

const path = require('path')
const commonPartial = str => path.resolve('./node_modules/santa-utils/common/partials', str)
const packagesAbsolutePath = path.resolve(__dirname, '..', '..', 'packages')

function scssRenamer(dest, src) {
    const srcCss = src.replace(/\.scss$/, '.css')
    return `${dest}/${srcCss}`
}

module.exports = {
    smartJsonlint: {
        all: {
            options: {
                cache: '.cache'
            },
            src: ['static/**/*.json']
        }
    },
    jsonlint: {
        all: {
            src: ['static/**/*.json', '!static/**/node_modules/**/*.json']
        }
    },
    karma: {
        options: {
            configFile: 'karma.conf.js',
            runnerPort: 9999,
            singleRun: true,
            colors: true
        },
        coverage: {
            reporters: ['progress', 'coverage'],
            coverageReporter: {
                type: 'html',
                dir: 'target/coverage/'
            },
            options: {
                client: {
                    santaTestPattern: '\.(unit|spec)\.js$'
                }
            }
        },
        teamcity: {
            colors: false,
            reporters: ['teamcity', 'coverage'],
            plugins: ['karma-requirejs', 'karma-jasmine', 'karma-coverage', 'karma-phantomjs-launcher', 'karma-teamcity-reporter'],
            coverageReporter: {type: 'teamcity'},
            browsers: ['PhantomJS']
        },
        all: {
            browsers: ['PhantomJS']
        },
        units: {
            singleRun: false,
            reporters: ['progress'],
            options: {
                client: {
                    santaTestPattern: '\.unit\.js$'
                }
            }
        },
        infra: {
            configFile: 'js/test/infra.karma.conf.js',
            browsers: ['PhantomJS']
        },
        allc: {
            reporters: ['progress', 'coverage'],
            coverageReporter: {
                type: 'html',
                dir: 'target/coverage/'
            }
        },
        mainr: {
            configFile: 'js/test/main-r.karma.conf.js',
            browsers: ['PhantomJS']
        },
        debugall: {
            singleRun: false
        },
        beaker: {
            configFile: 'beaker/karma.conf.js'
        },
        beaker_debug: {
            singleRun: false,
            configFile: 'beaker/karma.conf.js'
        },
        serverSideIntegration: {
            configFile: 'server/test/karma.conf.js'
        }
    },
    'beaker-scrape': {
        options: {
        configFile: 'beaker/sites.conf.js'

        }
    },
    clean: {
        cssCache: ['cssCache', 'static/css/viewer.css*'],
        packages: ['target/packages'],
        json: ['**/*.json.js'],
        translation: ['packages/*/src/main/**/translations/*.js'],
        typescript: ['packages/documentServices/src/main/mobileConversion/**/*.+(js|js.map)'],
        main: ['js/test/test-main.js', 'js/test/packagesList.js*', 'target/!(packages)'],
        cssTests: ['target/bootcamp']
    },
    watch: {
        scripts: {
            files: ['app/**/*.js', '!app/main-r.min.js', '!app/main-r.idea.js', 'app-seo/**/*.js', '!app/main-r-seo.min.js', 'packages/**/*.js'],
            tasks: ['default'],
            options: {spawn: false}
        },
        css: {
            files: ['packages/**/*.scss'],
            tasks: ['smartSass']
        },
        cssMain: {
            files: ['static/**/*.scss'],
            tasks: ['sass:main']
        },
        units: {
            files: ['packages/**/*.js'],
            tasks: ['jasmine:units']
        }
    },
    eslint: {
        all: {
            options: {
                cache: true
            },
            src: '.'
        },
        teamcity: {
            options: {
                format: 'checkstyle',
                outputFile: 'target/eslint.xml'
            },
            src: ['<%= eslint.all.src %>']
        }
    },
    jsduck: {
        main: {
            src: [
                'packages/documentServices/src/main/**/*.js',
                'packages/componentsPreviewLayer/src/main/**/*.js'
            ],
            dest: 'jsdocs',
            options: {
                'builtin-classes': true,
                warnings: ['-no_doc', '-dup_member', '-link_ambiguous'],
                external: ['XMLHttpRequest', 'jQuery']
            }
        }
    },
    jasmine: {
        units: ['js/test/unitInit.js', 'node_modules/santa-utils/common/jasmine/stackTraceReporter.js', 'packages/**/*.unit.js', 'app-seo/**/*.unit.js'],
        unitsTC: {
            src: ['js/test/unitInit.js', 'packages/**/*.unit.js'],
            options: {
                reporters: ['TeamCityReporter']
            }
        },
        e2e: ['beaker/e2e/**/*.e2e.js'],
        server: ['server/test/**/*.unit.js'],
        all: ['server/test/**/*.unit.js', 'conf/tasks/test/**/*.spec.js'],
        layout: ['js/test/unitInit.js', 'layout-integration/test/**/*.unit.js'],
        tasks: ['conf/tasks/test/**/*.spec.js'],
        teamcity: {
            src: ['server/test/**/*.unit.js', 'conf/tasks/test/**/*.spec.js'],
            options: {
                reporters: ['TeamCityReporter']
            }
        }
    },
    connect: {
        server: {
            options: {port: 80, hostname: '*', keepalive: true, debug: true}
        }
    },
    smartSass: {
        main: {
            cwd: '<%= sass.packages.files[0].cwd %>',
            src: ['{packages,static}/**/!(*.spec).scss'],
            dest: '<%= sass.packages.files[0].dest %>',
            // rename: '<%= sass.main.files[0].rename %>', //not in used, overridden in smart-sass
            tasksToRunIfChanged: ['postcss']
        }
    },
    sass: {
        options: {
            outputStyle: 'nested',
            precision: 5,
            includePaths: ['./node_modules/bootcamp/dist'],
            sourceMap: true
        },
        main: {
            src: 'static/css/viewer.scss',
            dest: 'static/css/viewer.css'
        },
        packages: {
            files: [{
                expand: true,
                cwd: './',
                src: ['packages/*/**/!(*.spec).scss'],
                dest: 'cssCache',
                rename: scssRenamer
            }]
        },
        tests: {
            files: [{
                expand: true,
                cwd: 'packages',
                src: ['**/*.spec.scss'],
                dest: 'target/bootcamp',
                rename: scssRenamer
            }]
        }
    },
    bootcamp: {
        test: {
            files: {
                src: ['target/bootcamp/**/*.spec.css']
            }
        }
    },
    postcss: {
        options: {
            map: true,
            processors: [
                require('autoprefixer')({browsers: ['last 2 ff versions', 'last 2 Chrome versions', 'last 2 Edge versions', 'Safari >= 7', 'ie >= 11', 'iOS >= 8', 'Android >= 4.2']})
            ]
        },
        dist: {
            src: ['cssCache/**/*.css', 'static/css/viewer.css']
        }
    },
    scsslint: {
        allFiles: ['packages/skins/src/main/mixins/skins-base.scss'],
        options: {
            reporterOutput: 'scss-lint-report.xml',
            colorizeOutput: true,
            maxBuffer: Infinity
        }
    },
    copy: {
        experiment: {
            src: commonPartial('../experiment.js'),
            dest: 'js/plugins/experiment/experiment.js'
        }
    },
    jscpd: {
        javascript: {
            path: 'packages/',
            exclude: []
        }
    },
    packages: {
        options: {
            base: '',
            sourceMain: 'src/main',
            packagesList: 'js/test/packagesList.js',
            packageTemplate: 'node_modules/santa-utils/package-template',
            packagesUtilPartial: 'app/partials/generated/packagesUtil.js'
        },
        all: {
            src: ['build']
        },
        teamcity: {
            options: {
                'out-file': 'target/verify.xml',
                format: 'checkstyle'
            },
            src: ['build']
        }
    },
    typescript: {
        local: {
            options: {sourceMap: 'inline'}
        },
        teamcity: {
            options: {sourceMap: 'external'}
        }
    },

    'get-translations': {
        options: {
            features: {
                contactFormTranslations: 'packages/translationsUtils/src/main',
                boxSlideShow: 'packages/translationsUtils/src/main',
                dialogMixinTranslations: 'packages/components/src/main/components/dialogs',
                homePageLoginTranslations: 'packages/wixSites/src/main/components/homePageLogin',
                loginButtonTranslations: 'packages/loginButton/src/main',
                siteMembersTranslations: 'packages/core/src/main/util',
                blogTranslations: 'packages/translationsUtils/src/main',
                subscribeFormTranslations: 'packages/translationsUtils/src/main',
                wixOfTheDayTranslations: 'packages/wixSites/src/main/components/wixOfTheDay',
                disqusComments: 'packages/components/src/main/components/disqusComments',
                tpaExtensionTranslations: 'packages/componentsPreviewLayer/src/main/previewExtensions'
            },
            languagesDest: 'packages/coreUtils/src/main/core/languages.js'
        },
        local: {
            options: {ci: false}
        },
        teamcity: {
            options: {ci: true}
        }
    },
    cssToJson: {
        options: {
            cssLocation: 'cssCache/**/**.css',
            htmlLocations: ['packages/**/*.html'],
            skinsJsFile: 'packages/skins/src/main/util/skins.js',
            evalsJsFile: 'packages/skins/src/main/util/evals.js',
            editorSkinsData: 'packages/documentServices/src/main/theme/skins/editorSkinsData.js'
        },
        main: {}
    },
    json: {
        main: ['packages/**/*.json', 'static/wixapps/apps/blog/**/*.json']
    },
    'smart-task': {
        cssToJson: {
            options: {
                taskSize: Number.MAX_SAFE_INTEGER,
                configFiles: ['conf/tasks/lib/skinParamMapper.js',
                              'conf/tasks/lib/convertersUtils.js',
                              'conf/tasks/lib/cssToJson.js',
                              'conf/tasks/cssToJson.js',
                              'conf/grunt/gruntConfig.js',
                              'Gruntfile.js']
            },
            mainTask: 'cssToJson',
            src: ['<%= cssToJson.options.cssLocation %>', '<%= cssToJson.options.htmlLocations %>'],
            target: ['<%= cssToJson.options.skinsJsFile %>', '<%= cssToJson.options.evalsJsFile %>', '<%= cssToJson.options.editorSkinsData %>']
        },
        getDataRefs: {
            options: {
                taskSize: Number.MAX_SAFE_INTEGER,
                configFiles: ['conf/tasks/lib/dataRefsUtils.js', 'conf/tasks/getDataRefs.js', 'conf/grunt/gruntConfig.js', 'Gruntfile.js']
            },
            mainTask: 'getDataRefs',
            src: ['<%= getDataRefs.options.data %>', '<%= getDataRefs.options.properties %>', '<%= getDataRefs.options.design %>'],
            target: ['<%= getDataRefs.options.output %>']
        }
    },
    'experiments-descriptors': {
        all: {
            src: 'descriptors/*.json',
            target: 'target/petri-experiments.json',
            options: {
                projectTag: 'santa-viewer',
                onlyForLoggedInUsers: false
            }
        }
    },
    'verify-npm': {
        options: {taskIfNotUpToDate: 'npm-dependencies-outdated'}
    },
    'versions-check': {
        main: {
            bins: {
                npm: {
                    warnBelow: '>=2.10',
                    message: 'Update npm with "npm i -g npm" (osx) or with "cd /c/Program Files/nodejs && npm i npm" (win)'
                },
                bundler: {
                    warnBelow: '~1.10.0',
                    message: 'Update bundler with "gem uninstall -aIx bundler && gem install bundler -v \'=1.10.6\'"'
                },
                node: {
                    failBelow: '>=4.2.0',
                    message: 'Read here: https://github.com/wix/santa/wiki/New-computer-setup#nodejs'
                },
                ruby: {
                    failBelow: '>=2.1.5',
                    message: 'Update ruby with "brew install ruby" on osx, and web install in windows.'
                }
            }
        },
        next: {
            bins: {
                ruby: {warnBelow: '^2.0.0'},
                git: {warnBelow: '^2.2.1'},
                grunt: {warnBelow: '^0.4.5'},
                'grunt-cli': {warnBelow: '^0.1.13'},
                'grunt-init': {warnBelow: '^0.3.2'},
                rt: {warnBelow: '^0.1.20'},
                bower: {warnBelow: '^1.4.1'},
                eslint: {warnBelow: '^0.21.2'},
                bundler: {warnBelow: '^1.7.2'}
            }
        }
    },
    createExperimentTests: {
        options: {
            modelName: 'rendererModel',
            descriptorsDir: 'descriptors',
            target: 'descriptors/test'
        }
    },
    getDataRefs: {
        options: {
            data: 'packages/documentServices/src/main/dataModel/DataSchemas.json',
            properties: 'packages/documentServices/src/main/dataModel/PropertiesSchemas.json',
            design: 'packages/documentServices/src/main/dataModel/DesignSchemas.json',
            output: 'packages/siteUtils/src/main/core/dataRefs.json'
        }
    },
    webpack: {
        imageClientApi: {
            context: packagesAbsolutePath,
            entry: ['./imageClientApi/src/main/imageClientApi'],
            output: {
                path: './target/imageClientApi',
                filename: 'imageClientApi.js',
                library: 'imageClientApi',
                libraryTarget: 'umd'
            },
            devtool: ['source-map'],
            resolve: {
                alias: {imageClientApi: path.resolve(packagesAbsolutePath, 'imageClientApi', 'src', 'main')},
                extensions: ['', '.js']
            },
            external: {
                lodash: true
            }
        }
    },
    typings: {
        install: {}
    },
    tslint: {
        options: {
            // Task-specific options go here.
        },
        all: {
            files: {
                src: [
                    "packages/**/*.ts"
                ]
            }
            // Target-specific file lists and/or options go here.
        }
    }
}
