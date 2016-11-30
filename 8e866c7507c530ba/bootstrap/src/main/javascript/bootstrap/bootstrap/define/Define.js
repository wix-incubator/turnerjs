/**
 * @class Define
 * @param {Array?} definitions pre-defined namespaces to create
 * @constructor
 */
function Define(definitions) {
    this._id = Define._id ? ++Define._id : 1;
    this._definitions = {};
    this._addArrayOfDefinitions(definitions);
}

/**
 * @lends Define
 */
Define.extendPrototype({
    /**
     * @param {String} nsString definition namespace Examples: 'bootstrapClass', 'resource', 'Class' etc.
     * @param {String?} subNsString name within <i>nsString</i> Examples: 'my.resource', 'bootstrap.bootstrap.deploy.DeploymentPhaseExecutor'
     * @param {Boolean?} forceRefreshCache If true, the cached value if refreshed. <b>Do not use this argument for class definitions!</b>
     * @param {*?} dependency the argument to pass to the definition function, default is this Define instance <b>only for functional definitions!</b>
     * @return {*}
     */
    getDefinition: function (nsString, subNsString, forceRefreshCache, dependency) {
        if (subNsString) {
            nsString = nsString + '.' + subNsString;
        }
        var result = nsUtil.getNameSpace(this._definitions, nsString);
        if (result instanceof Function) {
            if (forceRefreshCache || !result.hasOwnProperty('$cachedValue')) {
                result.$cachedValue = result(dependency || this);
            }
            return result.$cachedValue;
        } else {
            return result;
        }
    },

    /**
     *
     * @param {String} className
     * @return {*}
     */
    getBootstrapClass: function (className) {
        var Class = this.getDefinition('bootstrapClass', className);
        if (Class) {
            return Class;
        } else {
            throw new Error('Undefined bootstrapClass requested: ' + className);
        }
    },

    /**
     *
     * @param {string} className
     * @param {Array} initParams
     * @return {*} An instance of <i>className</i>
     */
    createBootstrapClassInstance: function (className, initParams) {
        var Class = this.getBootstrapClass(className);
        var classInstance = new Class();
        classInstance.define = this;
        classInstance.resource = this.getResourceFetcher();
        if (initParams) {
            classInstance.init.apply(classInstance, initParams);
        }
        return classInstance;
    },

    getResourceFetcher: function () {
        if (this.resource && this.resource._instance_) {
            return this.resource._instance_;
        } else {
            return define.resource._instance_;
        }
    },
    _addArrayOfDefinitions: function (definitions) {
        if (!definitions || !definitions.length) {
            return;
        }
        for (var i = 0; i < definitions.length; i++) {
            this.addDefinition(definitions[i]);
        }
    },
    /**
     * Creates a new definitions namespace
     * Exapmle:
     *      define.addDefinition('myNamespace')
     *      define.myNamespace('myDefinition', ...)
     * @param namespace
     * @return {Define} self
     */
    addDefinition: function (namespace) {
        var defNS,
            singleDef,
            self = this;

        if (!this._isValidNameSpace(namespace)) {
            throw new Error('your namespace: ' + namespace + ' is not valid or already exists');
        }

        defNS = this.getDefinition(namespace) || {};
        nsUtil.setNameSpace(this._definitions, namespace, defNS);
        singleDef = function SingleDefinition(name, definitionFunc) {
            if (self._skipDefinition(namespace, name)) {
                return;
            }

            if (singleDef.definitionModifier) {
                definitionFunc = singleDef.definitionModifier.apply(defNS, arguments);
            }

            if (singleDef.nameModifier) {
                name = singleDef.nameModifier.apply(defNS, arguments);
            }
            nsUtil.setNameSpace(defNS, name, definitionFunc);
            return definitionFunc;
        };

        singleDef.multi = this._createMultiDefinitionMethod(singleDef);

        singleDef.overrideName = this._createOverrideNameMethod(singleDef);

        nsUtil.setNameSpace(this, namespace, singleDef);

        return this;
    },


    /**
     * determines if the definition matches conditions where it should not be defined.
     * @param resourceNamespace
     * @param resourceName
     * @returns {boolean}
     * @private
     */
    _skipDefinition: function (resourceNamespace, resourceName) {
        if (resourceNamespace.indexOf('experiment.') !== 0) {
            return false;
        }

        return this._getExperimentListResource().isMergedExperimentResource(resourceName);
    },
    /**
     * get experiments list resource, containing merged experiments
     * @returns {value|*|.color.value|.panelControls.duration.value|.panelControls.delay.value|event.value}
     * @private
     */
    _getExperimentListResource: function () {
        var nullExperimentListResource = {
                isMergedExperimentResource: function () {
                    return false;
                }
            },
            experimentsListResource = this.getDefinition('resource', 'ExperimentsList');

        return experimentsListResource ? experimentsListResource.value : nullExperimentListResource;
    },

    /**
     * Creates a method that adds the $nameOverrides key value map field
     * on the single definition that stores names that should be
     * replaced on definition.
     * <b>this doesn't work for definitions that have custom arguments</b>
     * @param {function} singleDef the definition
     * @return {Function}
     * @private
     */
    _createOverrideNameMethod: function (singleDef) {
        singleDef.$nameOverrides = {};
        /**
         * Migrate definition to another path on the current definition
         * <b> should be implemented by the class that uses data from the definition namespace </b>
         * @param {string} originalName
         * @param {string} overrideName
         */
        var overrideMethod = function (originalName, overrideName) {
            singleDef.$nameOverrides[originalName] = overrideName;
        };
        /**
         * Migrate definitions to another path on the current definition
         * <b> should be implemented by the class that uses data from the definition namespace </b>
         * @param {object} overrideNamesMap
         */
        overrideMethod.multi = function (overrideNamesMap) {
            for (var name in overrideNamesMap) {
                overrideMethod(name, overrideNamesMap[name]);
            }
        };

        return overrideMethod;
    },

    /**
     * Create a method that splits multiple definition map or list and
     * call a definition function for each of them.
     * @param {Function} singleDef a function to call for each definition
     * @return {Function}
     * @private
     */
    _createMultiDefinitionMethod: function (singleDef) {
        return function (definitionsMapOrList) {
            if (typeof definitionsMapOrList === 'array') {
                for (var i = 0; i < definitionsMapOrList.length; ++i) {
                    singleDef(definitionsMapOrList[i]);
                }
            } else {
                for (var name in definitionsMapOrList) {
                    singleDef(name, definitionsMapOrList[name]);
                }
            }
        };
    },

    /**
     * Adds all the definitions in namespacesFunctionsMap
     * Example:<pre>
     * /** @~lends Define
     * define.addDefinitions({
     *      myNamespace:{
     *          /**
     *          * @~param {String} name
     *          * @~param {Array} array
     *          **~/
     *          arrays:function(name, array)
     *      }});</pre>
     * @param {Object} namespacesFunctionsMap an map with functions as leafs. The functions are discarded, as they use only for code completion.
     * @return {Define} self
     */
    addDefinitions: function (namespacesFunctionsMap) {
        if (namespacesFunctionsMap) {
            var define = this;
            nsUtil.forEachLeaf(namespacesFunctionsMap, function (value, namespace) {
                define.addDefinition(namespace);
            });
        }
        return this;
    },

//    shallowCopy:function(defined, namespacesToCopy){
//        var self = this;
//        namespacesToCopy.forEach(function (namespace) {
//            var original = defined.getDefinition(namespace);
//            nsUtil.setNameSpace(self._definitions, namespace, original);
//        });
//        return this;
//    },


    /* *
     *!!!!!!! IF NOT IN USE SHOULD BE DELETED!!!!!!!
     * Copies defined namespaces from other instances of Define, clones instances that
     * implement GlobalInstance
     * @param {Define} defined
     * @param {Array<String>} namespacesToCopy
     * @param {Array<String>} exclude
     * @return {Define} self
     */
//    copyDefinitionsFrom:function (defined, namespacesToCopy, exclude) {
//        var self = this;
//
//        namespacesToCopy.forEach(function (namespace) {
//            var copy = {};
//            var original = defined.getDefinition(namespace);
//
//            nsUtil.forEachLeaf(original, function(item, itemName){
//
//                var copyItem = item;
//                if(item && item.clone && typeof item.clone === 'function') {
//                    copyItem = item.clone(self);
//                }
//                nsUtil.setNameSpace(copy, itemName, copyItem);
//            }, '', exclude);
//
//            if(!self.getDefinition(namespace)) {
//                self.addDefinition(namespace);
//            }
//            var defineNs = self[namespace];
//            if(defineNs){
//                defineNs.overrideName.multi(defined[namespace].$nameOverrides);
//            }
//            nsUtil.setNameSpace(self._definitions, namespace, copy);
//        });
//
//        return this;
//
//    },

    _isValidNameSpace: function (nameSpace) {
        return !(this._definitions[nameSpace] || this[nameSpace] || nsUtil.getNameSpace(this._definitions, nameSpace) || nsUtil.getNameSpace(this, nameSpace));
    }
});