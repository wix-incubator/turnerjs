module.exports = function (grunt) {

    // Project configuration.
    var projectName = 'web';
    var sourceDirectory = 'src/main/';
    var targetDirectory = 'target/html-client/' + projectName + '/src/main/';
//    var testDirectory = 'target/html-client/' + projectName + '/src/test/';
    var path = require('path');

    grunt.initConfig({
        pkg: grunt.file.readJSON('./package.json'),
        meta: {
            name: 'html-wysiwyg'
        },
        anylint: {
            src: ['src/main/**/*.js', '!src/main/javascript/oldexperiments/**/*', '!**/~*.js',
                '!src/main/deployment.min.js', '!src/main/deployment/TestTags.js'],
            options: {
                validations: [
                    'src/main/deployment/validators/no-define-with-the-same-name.js'
//                    'src/main/deployment/validators/verify-namespace-matches-path.js'
                ]
            }
        },
        jshint: {
            all: {
                options: grunt.file.readJSON('src/main/deployment/jshint.json'),
                files: { src: [
                    'src/main/javascript/wysiwyg/**/*.js',
                    'src/main/javascript/angular/**/*.js',
                    '!src/main/javascript/wysiwyg/common/components/**/*.js',
                    '!src/main/javascript/wysiwyg/common/utils/**/*.js',
                    '!src/main/javascript/wysiwyg/editor/**/*.js',
                    '!src/main/javascript/wysiwyg/viewer/**/*.js',
                    '!src/main/javascript/wysiwyg/viewer/**/*.js',
                    '!src/main/javascript/wysiwyg/editor/managers/serverfacade/lz-string-1.3.3-min.js',
                    '!src/main/javascript/oldexperiments/**/*', '!src/main/**/resources/**/*.js', '!src/main/**/libs/**/*.js', '!**/~*.js']}
            }
        },
        aggregate: {
            main: {
                src: 'src/main/deployment/main.json',
                manifest: 'target/html-client/' + projectName + '/src/main/index.json',
                manifestCopy: 'src/main/index.json'
            },
            test: {
                src: 'src/test/deployment/test.json',
                manifest: 'target/html-client/' + projectName + '/src/test/' + projectName + '.test.json',
                manifestCopy: 'src/test/' + projectName + '.test.json',
                min: false
            }
        },
        buildSkinMaps: {
            main: {
                includes: ['**/javascript/wysiwyg/common/components/*/viewer/skins/*.js'],
                existingMaps: ['**/wysiwyg/common/components/*/viewer/*SkinMap.js'],
                base: 'src/main',
                itemTemplate: '\t\'<%= Package %>.<%= Class %>\'\: ' +
                    '\n\t\t<%=Params %>',
                itemSeparator: '\n\n',
                listTemplate: 'define.resource(\'<%= FileName %>\'\, {' +
                    '\n<%= items %>\n' +
                    '});'
            }
        },
        modify: {
            json: {
                base: 'src/main/json',
                files: ['**/*.json'],
                dest: 'src/main/json',
                modifier: function (name, content) {
                    content = JSON.stringify(JSON.parse(content));
                    return {
                        name: name.replace(/\.json$/, ".js"),
                        content: 'define.resource("' + name.replace(/\//g, '.') + '", ' + content + ', "' + name + '");'
                    };
                }
            }
        },
        copy: {
            target: {
                files: [
                    {
                        expand: true,
                        cwd: sourceDirectory,
                        dest: targetDirectory,
                        src: [
                            'html/**', 'images/**', 'resources/**',
                            'flash/GalleryRefreshNotifier.swf',
                            'OfflineEditorNewDeploy.html', 'OfflinePreviewNewDeploy.html'
                        ]
                    },
                    {
                        expand: true,
                        cwd: sourceDirectory + 'flash/bin-release/',
                        dest: targetDirectory + 'flash/',
                        src: [
                            'MediaUploader.swf'
                        ]
                    }
                ]
            },
            docsSource: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/main/javascript/angular/',
                        src: '**/*',
                        dest: 'target/docs/resources/docular-partials/'
                    },
                    {
                        src: 'src/main/docs/wixlogo.png',
                        dest: 'target/docs/resources/img/docular-small.png'
                    },
                    {
                        expand: true,
                        cwd: 'src/main/docs/resources/img/',
                        src: '**/*',
                        dest: 'target/docs/resources/img/'
                    },
                    {
                        src: 'src/main/libs/w-mocks.js',
                        dest: 'target/docs/resources/js/w-mocks.js'
                    }

                ]
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            },
            single: {
                configFile: 'karma.conf.js',
                singleRun: true
            },
            coverage: {
                configFile: 'karma.conf.js',
                preprocessors: {
                    'src/main/javascript/angular/!(cloud)/**/*.js': ['coverage']
                }
            },
            teamcity: {
                configFile: 'karma.conf.js',
                preprocessors: {
                    'src/main/javascript/angular/!(cloud)/**/*.js': ['coverage']
                },
                runnerPort: 9999,
                singleRun: true,
                colors: false,
                browsers: ['PhantomJS'],
                reporters: ['teamcity', 'coverage'],
                plugins: ['karma-jasmine', 'karma-coverage', 'karma-phantomjs-launcher', 'karma-teamcity-reporter'],
                coverageReporter: { type: 'teamcity' }
            }
        },
        ngAnnotate: {
            all: {
                expand: true,
                cwd: sourceDirectory + 'javascript/',
                src: ['angular/**/*.js', '!angular/init/**/*.js'],
                dest: sourceDirectory + 'javascript/' + 'ngannotate'
            }
        },
        ngtemplates: {
            all: {
                cwd: sourceDirectory + 'javascript/',
                src: [
                    'angular/**/*.html',
                    '!**/angular/examples/**/*.*',
                    '!**/angular/**/*Example.*'
                ],
                dest: sourceDirectory + 'javascript/angular/propertypanel/templatesCache.js',
                options: {
                    module: "htmlTemplates",
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeComments: true,
                        removeRedundantAttributes: true
                    },
                    bootstrap: function (module, script) {
                        // Wrap the produced code with the AngularManager execution method
                        var wrapperStr = "W.AngularManager.executeExperiment('NGCore', function() {\n";
                        wrapperStr += "angular.module('" + module + "').run(['$templateCache', function($templateCache) {\n" + script + "\n}]);\n";
                        wrapperStr += "});";

                        return wrapperStr;
                    },
                    url: function (filepath) {
                        return filepath.toLowerCase();
                    }
                }
            }
        },
        docular: {
            docular_webapp_target: 'target/docs',
            docular_partial_home: 'src/main/docs/partials/home.html',
            docular_partial_navigation: 'src/main/docs/partials/navigation.html',
            docular_partial_footer: 'src/main/docs/partials/footer.html',
            examples: {
                autoBootstrap: false,
                include: {
                    angular: false,
                    js: ['src/main/javascript/angular/examples/DemosBootstrap.js'],
                    css: ['src/main/css/stylesheets/editor.css']

                }
            },
            groups: [
                {
                    groupTitle: 'ngEditor',
                    groupId: 'ngeditor',
                    groupIcon: 'icon-book',
                    showSource: true,
                    sections: [
                        {
                            id: 'setup',
                            title: 'Setup',
                            docs: ['src/main/docs/guide/setup']
                        },
                        {
                            id: 'guide',
                            title: 'Guide',
                            docs: ['src/main/docs/guide/conventions']
                        },
                        {
                            id: 'api',
                            title: 'ngEditor API',
                            scripts: ['src/main/javascript/angular'],
                            docs: ['src/main/javascript/angular']
                        },
                        {
                            id: 'tech',
                            title: 'Tech Stuff',
                            docs: ['src/main/docs/guide/tech']
                        }
                    ]
                }
            ]
        },
        docularserver: {
            targetDir: '/target/docs/',
            livereload: true
        },
        sass: {
            dev: {
                options: {
                    style: 'expanded',
                    sourcemap: 'none'
                },
                files: [
                    {
                        expand: true,
                        src: ['src/main/**/*.scss'],
                        ext: '.css'
                    }
                ]
            },
            examples: {
                options: {
                    style: 'expanded',
                    sourcemap: 'none'
                },
                files: [
                    {
                        expand: true,
                        src: ['src/main/**/*.scss'],
                        cwd: 'src/main/javascript/angular/',
                        dest: 'src/main/javascript/angular/examples/css',
                        ext: '.css'
                    }
                ]
            },
            prod: {
                options: {
                    style: 'compressed',
                    sourcemap: 'none'
                },
                files: [
                    {
                        expand: true,
                        src: ['src/main/**/*.scss'],
                        ext: '.css'
                    }
                ]
            }
        },
        scsslint: {
            allFiles: [
                'src/main/**/*.scss'
            ]
        },
        autoprefixer: {
            all: {
                expand: true,
                src: 'src/main/css/stylesheets/**/*.css',
                options: {
                    browsers: ['> 1%', 'last 2 version', 'ie 9', 'Firefox ESR', 'Opera 12.1']
                }
            }
        },
        watch: {
            css: {
                files: 'src/main/**/*.scss',
                tasks: ['css']
            },
            docs: {
                files: ['src/main/javascript/angular/**/*.js', 'src/main/**/*.ngdoc'],
                tasks: ['docs'],
                options: {livereload: true}
            }

        },

        alias: {
            js: {
                base: targetDirectory + '/javascript/',
                target: 'target/hash',
                include: ['**/*.js'],
                exclude: ['**/~*']
            }
        },
        clean: {
            target: [
                targetDirectory
            ],
            angularPost: [
                "<%= ngAnnotate.all.dest %>"
            ]
        },
        compress: {
            main: {
                options: {
                    mode: 'tgz',
                    archive: 'target/build.tar.gz'
                },
                files: [
                    {src: ['**'], cwd: 'target/build', dest: '/', expand: true}
                ]
            }
        },
        integratedTestingAutomation: {
            artifact: projectName,
            deploymentDirectory: targetDirectory + '/test/it/'
        }
    });


    grunt.loadTasks('../node_modules/grunt-contrib-copy/tasks');
    grunt.loadTasks('../node_modules/grunt-contrib-jshint/tasks');
    grunt.loadTasks('../node_modules/grunt-aggregator/tasks');
    grunt.loadTasks('../node_modules/grunt-contrib-uglify/tasks');
    grunt.loadTasks('../node_modules/grunt-contrib-clean/tasks');
    grunt.loadTasks('../node_modules/grunt-contrib-cssmin/tasks');
    grunt.loadTasks('../node_modules/grunt-ng-annotate/tasks');
    grunt.loadTasks('../node_modules/grunt-angular-templates/tasks');
    grunt.loadTasks('../node_modules/grunt-anylint/tasks');
    grunt.loadTasks('../node_modules/grunt-it-automation-suite-parser/tasks');
    grunt.loadTasks('../node_modules/grunt-wdocular/tasks');
    grunt.loadTasks('../node_modules/grunt-contrib-sass/tasks');
    grunt.loadTasks('../node_modules/grunt-contrib-watch/tasks');
    grunt.loadTasks('../node_modules/grunt-scss-lint/tasks');
    grunt.loadTasks('../node_modules/grunt-autoprefixer/tasks');
    grunt.loadNpmTasks('grunt-karma');


    grunt.task.loadTasks(path.resolve(__dirname, 'tasks'));

    // Default task.
    grunt.registerTask('default', ['buildSkinMaps', 'ngtemplates', 'ngAnnotate', 'sass:dev', 'autoprefixer', 'aggregate', 'clean:angularPost', 'anylint', 'copy:target', 'integrated-testing-automation', 'jshint']);
    grunt.registerTask('prep-test', ['modify', 'aggregate:test']);
    grunt.registerTask('prep-main', ['modify', 'buildSkinMaps:main', 'aggregate:main']);
    grunt.registerTask('it', ['integrated-testing-automation']);
    grunt.registerTask('docs', [ 'docular', 'copy:docsSource']);
    grunt.registerTask('css', [ 'scsslint', 'sass:dev', 'autoprefixer']);
};
