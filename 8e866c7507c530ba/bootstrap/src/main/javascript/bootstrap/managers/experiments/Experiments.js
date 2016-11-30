/**
 * @class bootstrap.managers.experiments.Experiments
 */
resource.getResources(
    ['ExperimentsList', 'deployment'],
    function(resources){
    define.bootstrapClass('bootstrap.managers.experiments.Experiments', function(){
        /** @constructor */
        function Experiments(){
            this._pluginsMap = {};
        }

        Experiments.DESCRIPTORS_NAMESPACE = 'resource.experimentDescriptors';

        /** @lends bootstrap.managers.experiments.Experiments */
        Experiments.extendPrototype({
            /**
             * Setup method for Experiments manager
             * @return {bootstrap.managers.experiments.Experiments} self
             */
            init: function(modelRunningExperiments, getDescriptorOverride){
                this._initArgs = arguments;

                // used for tests
                if (getDescriptorOverride) {
                    this.getExperimentDescriptor = getDescriptorOverride;
                }

                if (!modelRunningExperiments){
                    modelRunningExperiments = resources.ExperimentsList.getExperimentsList();
                }
                this._finishInit(modelRunningExperiments);
                return this;
            },

            _finishInit : function(modelRunningExperiments) {
                var modelRunningExperimentIds = _.keys(modelRunningExperiments).filter(function(id) {
                    return modelRunningExperiments[id] == 'new';
                });

                this._experimentDescriptorMap =
                    this._getRunningExperimentsDescriptorMap(modelRunningExperimentIds);

                this._organizer = this.define.createBootstrapClassInstance(
                    'bootstrap.managers.experiments.ExperimentsOrganizer', []);

                this._runningExperimentIds = this._organizer.organize(
                    modelRunningExperimentIds, this._experimentDescriptorMap);

                if (window && window.console && !window.console.isWConsole && resources.deployment && resources.deployment.addOnDeploymentComplete) {
                    resources.deployment.addOnDeploymentComplete(this._printNonSkippedErrors.bind(this));
                }

                this._runningExperimentsSet = _.reduce(
                    this._runningExperimentIds,
                    function(result, id, index) {
                        result[id] = (index + 1);
                        return result;
                    },
                    {}
                );

                this._setExperimentPluginDefinitions();
            },

            _setExperimentPluginDefinitions: function() {
                var definedExperimentPlugin = this.define.getDefinition('experimentPlugin');
                for (var plugin in definedExperimentPlugin){
                    this._addPlugin(plugin, definedExperimentPlugin[plugin]);
                }

                this.define.experimentPlugin.definitionModifier = this._onExperimentPluginDefined.bind(this);
            },

            getErrors: function() {
                if (!this._organizer) {
                    return null;
                }

                var removalLog = this._organizer.getRemovalLog();
                return this._formatErrors(removalLog);
            },

            _formatErrors: function(removalLog) {
                var cols = removalLog.map(function(e) {
                    return [e.removedId, e.name, e.message];
                });

                return '\n' + W.Utils.StringUtils.printTable([].concat(cols));
            },

            _printNonSkippedErrors: function() {
                var removalLog = this._organizer.getRemovalLog();
                removalLog = removalLog.filter(function(log) { return !log.skipLog; });
                if (removalLog.length > 0) {
                    console.error('Experiment definition errors: \n' + this._formatErrors(removalLog));
                }
            },

            _getRunningExperimentsDescriptorMap: function(runningExperimentIds) {
                var result = {};
                runningExperimentIds.forEach(function(id) {
                    var descriptor = this.getExperimentDescriptor(id);
                    if (descriptor) {
                        result[id] = descriptor;
                    }
                }.bind(this));

                return result;
            },

            applyExperiments: function (name, definition, pluginTypeToApply) {
                if (!pluginTypeToApply) {
                    function applyExperiment(plugin) {
                        definition = plugin.applyExperiments(name, definition);
                    }
                    _.each(this._pluginsMap, applyExperiment);
                } else {
                    var pluginToApply = this._pluginsMap[pluginTypeToApply];
                    definition = pluginToApply.applyExperiments(name, definition);
                }
                return definition;
            },

            _onExperimentPluginDefined: function(name, plugin){
                this._addPlugin(name, plugin);
            },

            _addPlugin: function(name, pluginDefinition){
                var experimentPlugin = this.define.createBootstrapClassInstance('bootstrap.managers.experiments.ExperimentPlugin');
                pluginDefinition(experimentPlugin);

                experimentPlugin.setRunningExperimentsIds(this._runningExperimentIds, this._runningExperimentsSet);

                this._pluginsMap[name] = experimentPlugin;
            },

            /**
             *  returns the manager's current status
             *  Returns: true
             */
            isReady: function(){
                return this._runningExperimentIds !== undefined;
            },

            isDeployed: function(experiments){
                if (typeof experiments == 'string') {
                    return !!this._runningExperimentsSet[experiments.toLowerCase()];
                }

                if (typeof experiments.every == 'function') {
                    return experiments.every(function(id) {
                        return this._runningExperimentsSet[id.toLowerCase()];
                    }.bind(this));
                }

                var val, id, group;
                for(var key in experiments) {
                    if (experiments.hasOwnProperty(key)) {
                        val = experiments[key];
                        if (typeof key == 'string') {
                            id = key;
                            group = val;
                            if (typeof group == 'string' && group.toLowerCase() != 'new') {
                                LOG.reportError(wixErrors.EXPERIMENT_INVALID_DEFINITION,
                                    'group must be "new" (case insensitive), specified: "' + id + '", for experiments: "' + JSON.stringify(experiments) + '" in call to Experiments.isDeployed');
                                return false;
                            }
                        } else {
                            id = '' + val;
                        }

                        if (!this._runningExperimentsSet[id.toLowerCase()]) {
                            return false;
                        }
                    }
                }

                return true;
            },

            getRunningExperimentIds: function() {
                return this._runningExperimentIds.slice();
            },

            getAllDefinedExperimentIds: function() {
                var definition = this.define.getDefinition(Experiments.DESCRIPTORS_NAMESPACE);
                if (!definition) {
                    throw new Error('Could not get definition "' + Experiments.DESCRIPTORS_NAMESPACE + '"');
                }
                return nsUtil.getNamespacesAsStrings(definition);
            },

            getExperimentDescriptor: function(id) {
                var descriptorDefinition =
                    this.define.getDefinition(Experiments.DESCRIPTORS_NAMESPACE + '.' + id.toLowerCase());

                if (!descriptorDefinition) {
                    return null;
                }

                return descriptorDefinition.value;
            },

            /**
             *  clones this instance and its data.
             *  Returns: a new instance of Experiments.
             */
            clone: function(newDefine){
                return newDefine.createBootstrapClassInstance('bootstrap.managers.experiments.Experiments', this._initArgs);
            },

            /**
             * @deprecated use isDeployed
             */
            isExperimentOpen: function(expName, groupName) {
                if (typeof groupName == 'string' && groupName.toLowerCase() != 'new') {
                    LOG.reportError(wixErrors.EXPERIMENT_INVALID_DEFINITION,
                        'groupName must be "new" (case insensitive), specified: "' + groupName + '", for experiment: "' + groupName + '" in call to Experiments.isExperimentOpen');

                    return false;
                }
                return this.isDeployed(expName);
            }
        });

        return Experiments;
    });
});