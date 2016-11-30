/**
 * @class bootstrap.managers.experiments.ExperimentPlugin
 */
define.bootstrapClass('bootstrap.managers.experiments.ExperimentPlugin', function () {
    /**
     * see @link{bootstrap.managers.experiments.ExperimentPlugin#init}
     * @constructor
     */

    function ExperimentPlugin() {
    }

    /** @lends bootstrap.managers.experiments.ExperimentPlugin */
    ExperimentPlugin.extendPrototype({

        /**
         *
         * @param {String} modifyNamespace
         * @param {String} newNamespace
         * @param {Function} mergeSingleExperiment
         * @param {Function} convertNew
         * @return {*}
         */
        init:function (modifyNamespace, newNamespace, mergeSingleExperiment, convertNew) {
            this._modifyNamespace = modifyNamespace;
            this._newNamespace = newNamespace;
            this._mergeSingleExperiment = mergeSingleExperiment;
            this.convertNew = convertNew;
            return this;
        },

        _setModifiers: function() {
            this.define.experiment[this._newNamespace].definitionModifier = this._experimentDefined.bind(this);
            this.define.experiment[this._newNamespace].nameModifier = this._experimentNameDefined.bind(this);
            this.define.experiment[this._modifyNamespace].nameModifier = this._experimentNameDefined.bind(this);
        },

        _convertFromNewNamespace: function() {
            // Convert from new namespace
            var loadedNewExperiments = this.define.getDefinition('experiment', this._newNamespace);
            if(loadedNewExperiments){
                nsUtil.forEachLeaf(loadedNewExperiments, function(definition, namespace){
                    this._experimentDefined(namespace, definition);
                }.bind(this));
            }
        },

        setRunningExperimentsIds: function(runningExperimentIds, runningExperimentsSet) {
            this._runningExperimentIds = runningExperimentIds;
            this._runningExperimentsIndexes = runningExperimentsSet;
            this._convertFromNewNamespace();
            this._setModifiers();
        },

        _experimentNameDefined:function(namespace, definition){
            var info = this._getExperimentInfo(namespace);
            return info.definitionName + '.' + info.experimentName;
        },

        _experimentDefined:function(namespace, definition){
            var info = this._getExperimentInfo(namespace);
            var experimentName = info.experimentName.toLowerCase();

            var isExperimentRunning = this._runningExperimentsIndexes[experimentName];

            if(isExperimentRunning){
                this.convertNew(info.definitionName, definition);
            }

            return definition;
        },

        convertNew:function(name, classDefinition){
            throw new Error('Invalid ExperimentPlugin: convertNew method not set. Use init to override it', this);
        },

        /**
         *
         * @param {Object} resourceObj {id:id, url:url}
         * @param {bootstrap.bootstrap.scriptloader.ScriptLoader} scriptLoader
         * @return {Boolean} true if <i>url</i> should be handled by this plugin
         */
        _mergeSingleExperiment:function (resourceObj, scriptLoader) {
            throw new Error('Invalid ExperimentPlugin: _mergeSingleExperiment method not set. Use init to override it', this);
        },

        applyExperiments:function(name, definition){
            var namespace = this._modifyNamespace + '.' + name;
            var loadedExperiments = this.define.getDefinition('experiment', namespace);

            if (!loadedExperiments) {
                return definition;
            }

            var orderedRunningExperiments = this._getOrderedLoadedExperiments(loadedExperiments, this._runningExperimentsIndexes);

            return _.reduce(orderedRunningExperiments, this._mergeSingleExperiment, definition);
        },

        _isKeyEqualToNewCaseInsensitive: function(possibleVal, groupName) {
            return groupName.toLowerCase() === 'new';
        },

        _getExperimentDefinitionFunction: function(val) {
            if (typeof val === 'function') {
                return val;
            }

            return _.find(val, this._isKeyEqualToNewCaseInsensitive);
        },

        _compactSparseArray: function(ar) {
            var result = [];
            if (ar.length) {
                for (var index in ar) {
                    if (ar.hasOwnProperty(index)) {
                        result.push(ar[index]);
                    }
                }
            }
            return result;
        },

        _getOrderedLoadedExperiments: function(loadedExperiments, runningExperimentsSet, namespace){
            var sparseOrderedExperimentFunctions = [];

            var that = this;
            _.forOwn(loadedExperiments, function(val, experimentId) {
                var lowerCaseExperimentId = experimentId.toLowerCase();
                var index = runningExperimentsSet[lowerCaseExperimentId];

                if (!index) {
                    return;
                }

                var defFunction = that._getExperimentDefinitionFunction(val);

                if (defFunction && typeof defFunction.call === 'function') {
                    sparseOrderedExperimentFunctions[index] = defFunction;
                } else {
                    LOG.reportError(
                        wixErrors.EXPERIMENT_INVALID_DEFINITION,
                        'Could not find experiment definition function in definition "experiment.' +
                            namespace + '" for experiment "' + experimentId + '"');
                }
            });

            return this._compactSparseArray(sparseOrderedExperimentFunctions);
        },

        _getExperimentInfo:function(namespace){
            var parts = namespace.split('.');
            var experimentName = parts.pop();
            if (experimentName.toLowerCase() == 'new') {
                experimentName = parts.pop();
            }
            var overrideName = parts.join('.');
            return{
                experimentName:experimentName.toLowerCase(),
                definitionName:overrideName
            };
        }
    });

    return ExperimentPlugin;
});