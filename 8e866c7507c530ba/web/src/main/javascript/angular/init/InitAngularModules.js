(function() {
    W.AngularLoader.registerAdditionalModule('PagesBackgroundCustomizer', []);
    W.AngularLoader.registerAdditionalModule('EditorUserPanel', ['angularEditor']);
    function InitAngularModules(scriptLoader, deferred) {
        this.deferred = deferred;
        this.scriptLoader = scriptLoader ;
        this.ANGULAR_RESOURCES_TO_LOAD = [];
    }

    InitAngularModules.prototype.initialize = function() {
        var self = this ;
        window.resource.getResourceValue('angularResource', function(resources) {
            if(resources){
                resources.loadAngularResources(
                    self.ANGULAR_RESOURCES_TO_LOAD,
                    self.scriptLoader,
                    self._onLoadingComplete.bind(self)) ;
            } else {
                self._onLoadingComplete(deferred) ;
            }
        }) ;
    };

    InitAngularModules.prototype._onLoadingComplete = function() {
        this._initAngularModules();
        this._setExperimentsStateInAngularModule() ;
        this.deferred.resolve();
    };

    InitAngularModules.prototype._initAngularModules = function () {
        var additionalModuleDefs = W.AngularLoader.getAdditionalModules();
        var additionalModules = [];
        _.forEach(additionalModuleDefs, function(def){
            angular.module(def.name, def.dependencies);
            additionalModules.push(def.name);
        });
        angular.module('additionalApps', additionalModules);

        angular.module('editorInterop', []);
        angular.module('htmlTemplates', []);
        angular.module('angularEditor', ['editorInterop']);
        angular.module('utils', ['angularEditor', 'editorInterop']);
        angular.module('wixElements', ['utilsDirectives', 'utils', 'angularEditor', 'editorInterop', 'htmlTemplates']);


        var editorDependencies = ['additionalApps'];

        if(W.isExperimentOpen("NGDialogManagement")) {
            _addNGDialogManagementModules(editorDependencies);
        }

        if (W.isExperimentOpen("ngpromotedialog")) {
            angular.module('utilsDirectives', ['utils', 'angularEditor', 'editorInterop']);
            angular.module('newSavePublish', ['utilsDirectives', 'utils', 'wixElements', 'htmlTemplates']);

            editorDependencies.push('newSavePublish');
        }

        if(W.isExperimentOpen("WixCode")) {
            angular.module('cloud-providers', []);
            angular.module('cloud-initialization', ['cloud-providers']);
            angular.module('cloud', ['cloud-initialization','angularEditor', 'editorInterop', 'utils', 'wixElements', 'htmlTemplates', 'newSavePublish']);

            editorDependencies.push('cloud');
        }

        if(W.isExperimentOpen("NGPanels")) {
            _addNGPanelsModules(editorDependencies);
        }

        angular.module('Editor', editorDependencies);
    };

    function _addNGDialogManagementModules(editorDependencies) {
        angular.module('utilsDirectives', ['utils', 'angularEditor', 'editorInterop']);
        angular.module('dialogs', ['utilsDirectives', 'utils', 'wixElements', 'htmlTemplates', 'newSavePublish']);

        editorDependencies.push('dialogs');
    }
    
    function _addNGPanelsModules(editorDependencies) {
        angular.module('propertyPanel', ['wixElements', 'utilsDirectives', 'utils', 'angularEditor', 'editorInterop', 'dialogs', 'htmlTemplates']);

        editorDependencies.push('propertyPanel');
    }

    InitAngularModules.prototype._setExperimentsStateInAngularModule = function(){
        var allExperiments = W.Experiments.getAllDefinedExperimentIds();
        var runningExperiments = W.Experiments.getRunningExperimentIds();
        var experimentsMap = {};
        _.forEach(allExperiments, function(expId){
            experimentsMap[expId] = false;
        });
        _.forEach(runningExperiments, function(expId){
            experimentsMap[expId] = true;
        });

        _.forEach(experimentsMap, function(isRunning, experimentId){
            angular.module('angularEditor').constant('EXP_' + experimentId, isRunning);
        }, this);
    };


    // Loading starts here!!!
    if(W.isExperimentOpen("NGCore")) {
        window.W = window.W || {} ;
        window.W.AngularLoader = window.W.AngularLoader || {} ;
        var deferred = window.W.AngularLoader.getAngularLoadingDeferredPromise() ;

        resource.getResourceValue('scriptLoader', function(scriptLoader) {
            var angularInitializer = new InitAngularModules(scriptLoader, deferred);
            angularInitializer.initialize();
        });
    }
})();
