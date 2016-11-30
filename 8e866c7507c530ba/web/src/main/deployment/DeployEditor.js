define.deployment('core.deployment.Wysiwyg-Editor', function (deploymentDef) {

    deploymentDef.atPhase(PHASES.UTILS, function (deploy) {

        function AngularLoader() {
            this._hasBootstrapped = false;
            this._angularLoadingPromise = Q.defer();

            window.W.AngularLoader = window.W.AngularLoader || {};
            window.W.AngularLoader.angularLoadingPromise = this._angularLoadingPromise;
        }

        var angularExecutorMethods = {

            _modulesToRegister: [],

            getAngularLoadingDeferredPromise: function () {
                return this._angularLoadingPromise;
            },

            bootstrap: function (executionFunction) {
                if (!this._hasBootstrapped) {
                    this.execute(executionFunction);
                    this._hasBootstrapped = true;
                }
            },

            registerAdditionalModule: function (moduleName, dependencies) {
                this._modulesToRegister.push({name: moduleName, dependencies: dependencies});
            },

            getAdditionalModules: function(){
                return this._modulesToRegister;
            },

            compileElement: function (element, data){
                var injector = angular.element(document.id('editorUI')).injector();



                var $compile = injector.get('$compile');
                var newScope = injector.get('$rootScope').$new();
                _.assign(newScope, data);

                $compile(angular.element(element))(newScope);
            },

            executeExperiment: function (experimentName, executionFunc) {
                if (W.Experiments.isDeployed(experimentName)) {
                    this.execute(executionFunc);
                }
            },

            execute: function (executionFunc) {
                return this._angularLoadingPromise.promise.then(executionFunc);
            }
        };

        AngularLoader.prototype = angularExecutorMethods;
        var angularLoader = new AngularLoader();

        window.W.AngularLoader = angularLoader;
        window.W.AngularManager = window.W.AngularLoader;
    });

    deploymentDef.atPhase(PHASES.INIT, function (deploy) {

        var $editorPreloader = $('editor_preloader');
        var preloadFirstTimeFade = false;
        var preloadFadeTime = 300;

        window.setPreloaderState = setPreloaderState;
        setPreloaderState('editorLoading');

        //Load the Language and set the Viewer Site
        resource.getResourceValue('W.Resources', function (resourceManager) {
            resourceManager.loadLanguageBundle('EDITOR_LANGUAGE', getEditorStructureData);
        });

        function wixappsLangBundleLoaded() {
            // TODO: add flowers
        }

        function wixapps2LangBundleLoaded() {
            // TODO: add flowers
        }

        function setPreloaderState(state) {
            // Fade out the preloader - only if browser is capable & its the first load
            if (Modernizr.csstransitions && state === 'ready' && !preloadFirstTimeFade) {
                $editorPreloader.className = 'fade-out';
                preloadFirstTimeFade = true;

                setTimeout(function () {
                    $editorPreloader.className = 'ready';
                }, preloadFadeTime);
            } else {
                $editorPreloader.className = state;
            }
        }

        function setViewerSite(siteStructureData) {
            LOG.reportEvent(wixEvents.SET_SITE_CALLED);
            W.Editor.setEditor(document.id('EDITOR_STRUCTURE'), siteStructureData);
        }

        function getEditorStructureData() {
            W.Data.getDataByQuery('#EDITOR_STRUCTURE', setViewerSite);
        }

        function setInitEditorMode() {
            W.Classes.getClass('wysiwyg.common.utils.OpenPanelByQuery', function (OpenPanelByQuery) {
                var editorState = new OpenPanelByQuery();
            });
        }

        W.Editor.addEvent(Constants.EditorEvents.EDITOR_READY, setInitEditorMode);

        function runAfterEditorLoads() {
            W.Classes.getClass('external_apis.GoogleTagManager', function (GoogleTagManager) {
                var googleTagManager = new GoogleTagManager();
            });
            W.Classes.getClass('external_apis.FacebookPixelScript', function (FacebookPixelScript) {
                var facebookPixelScript = new FacebookPixelScript();
            });
            resource.getResourceValue('scriptLoader', function (scriptLoader) {
                scriptLoader.loadScript({url: '//static.parastorage.com/services/third-party/misc/ConsoleRecruitment-0.0.1.js'}, {});
            });
        }

        W.Editor.addEvent(W.Editor.EDITOR_LOAD_FINISHED, function () {
            W.Utils.callLater(runAfterEditorLoads);
        });
    });
});