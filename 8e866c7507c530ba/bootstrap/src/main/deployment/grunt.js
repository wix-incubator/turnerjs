module.exports = function (grunt) {

    // Project configuration.
    var projectName = 'bootstrap';
    var sourceDirectory = 'src/main/';
    var targetDirectory = 'target/' + projectName + '/src/main/';

    grunt.initConfig({
        anylint: {
            src: ['src/main/**/*.js', '!src/main/javascript/oldexperiments/**/*', '!**/~*.js',
                '!src/main/javascript/bootstrap/bootstrap/combinedExperimentDescriptors.js', '!src/main/deployment.min.js'],
            options: {
                validations: [
                    'src/main/deployment/validators/no-define-with-the-same-name.js'
//                    'src/main/deployment/validators/verify-namespace-matches-path.js'
                ]
            }
        },
        pkg: grunt.file.readJSON('./package.json'),
        meta: {
            name: 'html-bootstrap'
        },
        jshint: {
            all: {
                options: grunt.file.readJSON('src/main/deployment/jshint.json'),
                files: { src: [
                    'src/main/javascript/**/*.js',
                    '!src/main/javascript/experiments/**/*.js',
                    '!src/main/javascript/bootstrap/bootstrap/es5-shim-sham.js',
                    '!src/main/javascript/bootstrap.debug.js',
                    '!src/main/javascript/bootstrap/managers/classmanager/WClass.js',
                    '!src/main/javascript/bootstrap/managers/classmanager/XClass.js',
                    '!src/main/javascript/bootstrap/utils/browser/Browser.js',
                    '!src/main/javascript/bootstrap/utils/browser/Validation.js',
                    '!src/main/javascript/bootstrap/bootstrap/windowOnError.js',
                    '!src/main/javascript/bootstrap/bootstrap/utils/fnvHash.js',
                    '!src/main/javascript/bootstrap/bootstrap/scriptloader/Plugins.js',
                    '!src/main/javascript/bootstrap/bootstrap/utils/ExperimentsList.js',
                    '!src/main/javascript/bootstrap/bootstrap/utils/ProfilingUtil.js',
                    '!src/main/javascript/bootstrap/bootstrap/utils/BrowserUtils.js',
                    '!src/main/javascript/bootstrap/bootstrap/isExperimentOpen.js',
                    '!src/main/javascript/bootstrap/bootstrap/deploy/DeploymentDefinition.js',
                    '!src/main/javascript/bootstrap/bootstrap/define/Define.js',
                    '!src/main/javascript/bootstrap/bootstrap/capture/loadCapturedSite.js',
                    '!src/main/javascript/bootstrap/bootstrap/bi/biBootstrap.js',
                    '!src/main/javascript/bootstrap/bootstrap/scriptloader/ManifestContext.js',
                    '!src/main/javascript/bootstrap/bootstrap/scriptloader/ScriptLoader.js',
                    '!src/main/javascript/bootstrap/managers/experiments/Experiments.js',
                    '!src/main/javascript/bootstrap/managers/experiments/ExperimentsOrganizer.js',
                    '!src/main/javascript/bootstrap/bootstrap/bi/WixBI.js',
                    '!src/main/javascript/bootstrap/bootstrap/capture/additionalScripts.js',
                    '!src/main/javascript/bootstrap/utils/SupportUtils.js',
                    '!src/main/javascript/bootstrap/utils/misc/Helpers.js',
                    '!src/main/javascript/bootstrap/managers/events/TimersHandler.js',
                    '!src/main/javascript/bootstrap/bootstrap/classList.js',
                    '!src/main/**/resources/**/*.js',
                    '!src/main/**/libs/**/*.js',
                    '!**/~*.js']}
            }
        },
        aggregate: {
            main: {
                src: 'src/main/deployment/main.json',
                manifest: 'target/' + projectName + '/src/main/index.json',
                manifestCopy: 'src/main/index.json'
            },
            test: {
                src: 'src/test/deployment/test.json',
                manifest: 'target/' + projectName + '/src/test/index.json',
                manifestCopy: 'src/test/index.json',
                min: false
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
        alias: {
            js: {
                base: 'target/bootstrap/src/main/javascript/',
                target: 'target/' + projectName + '/src/main/hash',
                include: ['**/*.js'],
                exclude: ['**/~*']
            }
        },
        clean: ['target', sourceDirectory + 'javascript/migration/combinedExperimentDescriptors.js'],
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
        'debug-map': {
            json: "main.json",
            'package-id': "bootstrap",
            target: ["target/bootstrap/src/main/javascript/bootstrap.debug.js" , "src/main/javascript/bootstrap.debug.js"],
            scriptLocationPrefix: "/javascript/bootstrap/bootstrap"
        },

        combineExperimentDescriptors: {
            all: {
                src: sourceDirectory + '/experiment-descriptors/*.json',
                dest: sourceDirectory + 'javascript/bootstrap/combinedExperimentDescriptors.js'
            }
        },
        combineExperimentDescriptorsToSingleJson: {
            all: {
                src: sourceDirectory + '/experiment-descriptors/*.json',
                dest: 'target/bootstrap/src/main/combinedExperimentDescriptors.json'
            }
        },
        integratedTestingAutomation: {
            artifact: projectName,
            deploymentDirectory: targetDirectory + '/test/it/'
        }
    });

    grunt.loadTasks('src/main/deployment/tasks/');
    grunt.loadTasks('../node_modules/grunt-contrib-copy/tasks');
    grunt.loadTasks('../node_modules/grunt-contrib-jshint/tasks');
    grunt.loadTasks('../node_modules/grunt-aggregator/tasks');
    grunt.loadTasks('../node_modules/grunt-contrib-uglify/tasks');
    grunt.loadTasks('../node_modules/grunt-contrib-clean/tasks');
    grunt.loadTasks('../node_modules/grunt-contrib-cssmin/tasks');
    grunt.loadTasks('../node_modules/grunt-anylint/tasks');
    grunt.loadTasks('../node_modules/grunt-it-automation-suite-parser/tasks');

    // Default task.
    grunt.registerTask('default', ['clean', 'combineExperimentDescriptors', 'combineExperimentDescriptorsToSingleJson', 'aggregate', 'anylint', 'debug-map', 'integrated-testing-automation', 'jshint']);
    grunt.registerTask('prep-test', 'aggregate:test');
    grunt.registerTask('prep-main', 'aggregate:main');
    grunt.registerTask('it', ['integrated-testing-automation']);

};
