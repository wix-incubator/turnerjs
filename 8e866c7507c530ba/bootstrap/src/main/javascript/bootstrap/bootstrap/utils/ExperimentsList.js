resource.getResources(['BrowserUtils'], function (resources) {
    define.resource('ExperimentsList', {

        getExperimentsList: function () {
            var modelExperiments = this._isInEditor() ? this._getEditorExperiments() : this._getRendererExperiments();
            var queryExp = this._getExperimentsFromQuery();
            var append = function (original) {
                return Array.prototype.slice.call(arguments).splice(1).reduce(function (c, a) {
                    Object.keys(a).forEach(function (key) {
                        c[key] = a[key];
                    });
                    return c;
                }, original);
            };
            return append({}, modelExperiments, queryExp);
        },

        _isInEditor: function () {
            return (viewMode === 'editor');
        },

        _getExperimentsFromQuery: function () {
            var rt = {};
            var experimentsStrings = resources.BrowserUtils.getQueryParams()['experiment'];

            if (experimentsStrings) {
                while (exp = experimentsStrings.pop()) {
                    var expData = exp.split(":");
                    var experimentId = expData[0].toLowerCase();
                    rt[experimentId] = expData.length > 1 ? expData[1].toLowerCase() : 'new';
                }
            }

            this._addAggregatedExperimentsFromQuery(rt);
            return rt;
        },

        //this will retrieve experiments in the form: experiments=exp1,exp2,exp3:old,exp4
        _addAggregatedExperimentsFromQuery: function (rt) {
            var experimentsStrings = resources.BrowserUtils.getQueryParams()['experiments'];

            if (experimentsStrings && experimentsStrings.length === 1) {
                var exps = experimentsStrings[0].split(',');

                while (exp = exps.pop()) {
                    var expData = exp.split(":");
                    var experimentId = expData[0].toLowerCase();
                    rt[experimentId] = expData.length > 1 ? expData[1].toLowerCase() : 'new';
                }
            }
        },

        _getEditorExperiments: function () {
            return !editorModel ? {} : this._experimentsToLowerCase(editorModel.runningExperiments);
        },

        _getRendererExperiments: function () {
            return !rendererModel ? {} : this._experimentsToLowerCase(rendererModel.runningExperiments);
        },

        _experimentsToLowerCase: function (experiments) {
            var rt = {};
            for (var i in experiments) {
                rt[i.toLowerCase()] = experiments[i].toLowerCase();
            }
            return rt;
        },

        /**
         * @deprecated use isMergedExperimentResource() instead
         */
        isExperimentMerged: function (artifactName, experimentName) {
            //deprecated method - use isMergedExperimentResource() instead
            var mergedExperiments = this.getMergedExperimentResource(artifactName);
            return !!mergedExperiments[experimentName.toLowerCase()];
        },

        getMergedExperimentResource: function (artifactName) {
            var res =  define.getDefinition('resource', 'web.experiments.merged');
            this._lowerCaseExperimentsObject = this._lowerCaseExperimentsObject || {};
            if (!this._lowerCaseExperimentsObject[artifactName] && res){
                this._lowerCaseExperimentsObject[artifactName] = this._updateKeysToLowerCase(res.value);
            }
            return this._lowerCaseExperimentsObject[artifactName] || {};
        },

        getArtifactName: function (resourceName) {
            var artifactNames = resourceName.split('.'),
                isCore = function (names) {
                    return names[0] === 'core' || names[0] === 'mobile' && names[1] === 'core';
                };

            if (isCore(artifactNames)) {
                return 'core';
            }

            if (['bootstrap', 'skins', 'ecommerce', 'wixapps'].indexOf(artifactNames[0]) !== -1) {
                return artifactNames[0];
            }
            return 'web';
        },

        getExperimentName: function (experimentResourceName) {
            var names = experimentResourceName.split('.'),
                experimentName =names[names.length - 1].toLowerCase() === 'new' ? names[names.length - 2] : names[names.length - 1];
            return experimentName.toLowerCase();
        },

        isMergedExperimentResource: function (resourceName) {
            var artifactName = this.getArtifactName(resourceName),
                experimentName = this.getExperimentName(resourceName) || '',
                mergedExperiments = this.getMergedExperimentResource(artifactName);

            return !!mergedExperiments[experimentName.toLowerCase()];
        },

        _updateKeysToLowerCase: function(originalObject){
            var updatedObject = {};
            var key;
            for (key in originalObject) {
                if (originalObject.hasOwnProperty(key)) {
                    updatedObject[key.toLowerCase()] = originalObject[key];
                }
            }
            return updatedObject;
        }
    });
});