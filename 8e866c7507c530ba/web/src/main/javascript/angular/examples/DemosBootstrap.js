(function () {

    function initW() {
        window.W = {
            AngularManager: {
                execute: function (f) {
                    f();
                },
                executeExperiment: function (expName, f) {
                    f();
                }
            },
            Resources: {
                resources: {
                    topology: {wysiwyg: '/html-client/web/src/main'},
                    angularPath: ''
                },
                get: function (bundleName, key) {
                    return key;
                }
            },
            Commands: {
                executeCommand: function (commandName, cmdParams, source) {
                    console.log("Command %s was executed", commandName);
                    if (cmdParams && cmdParams.callback) {
                        cmdParams.callback("Image picked from gallery..");
                    }
                }
            },
            Config: {
                getMediaStaticUrl: function () {
                    return '';
                }
            },
            Classes: {
                getClass: function (className, callback) {
                    callback(null);
                }
            }
        };
    }

    function initResource() {
        window.resource = {
            getResources: function (arg1, callback) {
                callback(
                    {
                        mode: {
                            debug: true
                        }

                    });
            }
        };
    }

    function loadModuleScripts(scripts, callback) {
        _loadModuleScripts(scripts, callback, false);
    }

    function _loadModuleScripts(scripts, callback, shootEvent) {
        if (scripts.length > 0) {
            var s = document.createElement('script');
            s.src = scripts.shift();
            s.onload = function () {
                _loadModuleScripts(scripts, callback, shootEvent);
            };
            document.head.appendChild(s);
        } else {
            if (shootEvent) {
                document.dispatchEvent(new Event("loadModuleScriptsDone"));
            }
            if (callback) {
                callback();
            }
        }
    }

    document.addEventListener("loadModuleScriptsDone", function (event) {
        /* jshint ignore:start */


        setTimeout(function () {
            startExample();
            setTimeout(function () {
                angular.bootstrap(document, ['Editor']);
            }, 200);
        }, 0);

        /* jshint ignore:end */
    });

    var thirdPartyScripts = [
        '//cdnjs.cloudflare.com/ajax/libs/jasmine/2.0.0/jasmine.js',
        '//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-rc.0/angular.min.js',
        '//cdnjs.cloudflare.com/ajax/libs/q.js/1.0.1/q.min.js',
        '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min.js'
    ];

    var angularScripts = [
        '/resources/js/w-mocks.js',
        'init/InitAngularModules.js'
    ];

    var bootstrapScripts = [
        'angulareditor/ImageUtilService.js',
        'editorinterop/EditorCommandsService.js',
        'utilsdirectives/wixTranslateDirective.js'
    ];


    function _createServiceMocks() {
        angular.module('angularEditor').factory('editorResources', function ($sce) {
            return {
                'topology': undefined,
                'getAngularPartialPath': function (partialPath) {
                    if (partialPath[0] === '/') {
                        partialPath = partialPath.slice(1);
                    }
                    return $sce.trustAsResourceUrl(partialPath);
                },
                'translate': function (key) {
                    return key;
                },
                'getMediaStaticUrl': function () {
                    return '';
                },
                'isDebugMode': function () {
                    return true;
                }
            };
        });
    }

    //initW();
    initResource();
    _loadModuleScripts(thirdPartyScripts, function () {
        window.jasmine = window.jasmineRequire.core(window.jasmineRequire);
        _loadModuleScripts(angularScripts, function () {
            _createServiceMocks();
            _loadModuleScripts(bootstrapScripts, null, true);
        }, false);
    });
    window.loadModuleScripts = loadModuleScripts;
})();