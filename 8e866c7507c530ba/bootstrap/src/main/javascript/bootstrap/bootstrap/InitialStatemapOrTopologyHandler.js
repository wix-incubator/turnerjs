(function() {
    'use strict';

    var InitialStatemapOrTopologyHandlerClass = function(dependencies) {
        dependencies = dependencies || {};
        var windowScope = dependencies.windowScope;

        this._getModel = function() {
            return windowScope.editorModel || windowScope.rendererModel || {};
        };

        this._getRunningExperiments = function(){
            return this._getModel().runningExperiments || {};
        };

        this._clone = function(obj){
            if (obj === undefined) {
                return undefined;
            }
            return JSON.parse(JSON.stringify(obj));
        };

        this._saveOldScriptsLocationMap = function() {
            var oldServiceTopology = windowScope.serviceTopology || {};
            /* jshint ignore:start */
            windowScope.__original_serviceTopology_scriptsLocationMap__ =
            /* jshint ignore:end */
                this._clone(oldServiceTopology.scriptsLocationMap);
        };

        this._overrideServiceTopologyScriptsLocationMap = function(overrideScriptsLocationMap){
            var serviceTopology = windowScope.serviceTopology = windowScope.serviceTopology || {};
            var scriptsLocationMap = serviceTopology.scriptsLocationMap = serviceTopology.scriptsLocationMap || {};

            var val;
            for(var key in overrideScriptsLocationMap) {
                if (overrideScriptsLocationMap.hasOwnProperty(key)) {
                    val = overrideScriptsLocationMap[key];
                    if (val === 'none') {
                        delete scriptsLocationMap[key];
                    } else {
                        scriptsLocationMap[key] = val;
                    }
                }
            }
        };

        this._replaceServiceTopologyScriptsLocationMap = function(replacementScriptsLocationMap) {
            var serviceTopology = windowScope.serviceTopology = windowScope.serviceTopology || {};
            serviceTopology.scriptsLocationMap = replacementScriptsLocationMap;
        };

        this._replaceRunningExperiments = function(experiments){
            /* jshint ignore:start */
            windowScope.__original_runningExperiments__ =
            /* jshint ignore:end */
                this._clone(this._getRunningExperiments());

            if(experiments) {
                this._getModel().runningExperiments = experiments;
            }
        };

        this._isInEditor = function() {
            return windowScope.viewMode === "editor";
        };

        this._fakeDeployment = function(){
            if(this._isInEditor()){
                return;
            }

            if(!windowScope.define || !windowScope.define.resource){
                setTimeout(this._fakeDeployment.bind(this), 100);
            } else {
                windowScope.define.resource('status.structure.loaded', true);
            }
        };

        this.execute = function() {
            var statemapOrTopology = dependencies.statemapOrTopology || {};

            var topology = statemapOrTopology.topology || dependencies.statemapOrTopology;
            var experiments = statemapOrTopology.experiments;

            this._saveOldScriptsLocationMap();

            if (statemapOrTopology.replaceTopology) {
                this._replaceServiceTopologyScriptsLocationMap(topology);
            } else {
                this._overrideServiceTopologyScriptsLocationMap(topology);
            }

            this._replaceRunningExperiments(experiments);

            this._fakeDeployment();
        };
    };

    if (window.W) {
        if (window.W.isUnitTestMode) {
            window.WT = window.WT || {};
            window.WT.InitialStatemapOrTopologyHandlerClass = InitialStatemapOrTopologyHandlerClass;
        } else if (window.W.statemapOrTopology) { // loadInitialScriptsDynamically.js was run
            var statemapOrTopologyHandler = new InitialStatemapOrTopologyHandlerClass({
                statemapOrTopology: window.W.statemapOrTopology,
                windowScope: window
            });

            statemapOrTopologyHandler.execute();
        }
    }

})();