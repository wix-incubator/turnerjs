/**
 * @class bootstrap.managers.classes.ClassParser
 */
define.bootstrapClass('bootstrap.managers.classmanager.ClassParser', function () {

    var isDebugMode =
        (window.rendererModel && window.rendererModel.debugMode !== 'nodebug') ||
            (window.editorModel && window.editorModel.mode !== 'nodebug') ||
            /[?&]debugArtifacts?\b/i.test(window.location.search);

    /** @constructor */
    function ClassParser() {
        this.registerClass = this.registerClass.bind(this);
        this._onDependenciesReady = this._onDependenciesReady.bind(this);
    }

    /** @lends bootstrap.managers.classes.ClassParser */
    ClassParser.extendPrototype({

        /**
         * Setup method for ClassParser
         * @param {bootstrap.managers.classmanager.ClassRepository} repository
         * @param {Function} ClassDefinition class constructor of bootstrap.managers.classmanager.ClassDefinition
         * @return {bootstrap.managers.classmanager.ClassParser} self
         */
        init:function (repository, ClassDefinition, experimentManager) {
            /** @type bootstrap.managers.classes.ClassRepository */
            this._repository = repository;
            this._overrides = {};
            this.ClassDefinition = ClassDefinition;
            this._experimentManager = experimentManager;
            this._xclass = new window.XClass(isDebugMode);
            return this;
        },


        override:function (key, value) {
            this._overrides[key] = this._overrides[key] || [];
            var ret = this._overrides[key].length ? this._overrides[key].getLast() : key;

            this._overrides[key].push(value);

            return ret;
        },

        registerNewClass:function (className, classDefinitionFunc) {
            /** @type {bootstrap.managers.classmanager.ClassDefinition} */
            var classDefObject = new this.ClassDefinition();
            classDefinitionFunc(classDefObject, classDefObject._inheritStrategy_);
            classDefObject = this._experimentManager.applyExperiments(className, classDefObject, 'ExperimentClassPlugin');
            return this.registerClassDefinition(className, classDefObject);
        },

        registerClassDefinition:function (className, classDefObject) {
            this._wrapMethodsIfProfilerIsOn(className, classDefObject);
            this._fixClassDefinition(classDefObject);
            return this.registerClass(className,classDefObject);
        },

        _wrapMethodsIfProfilerIsOn: function(className,classDefObject) {
            var isProfileOn = window.location.href.indexOf("profiler=true") > -1;
            if (isProfileOn) {
                _.forEach(classDefObject._methods_, function(method, methodName) {
                    classDefObject._methods_[methodName] = window.__profiler.___profileFunction(method, methodName, className);
                });
            }
        },

        registerClass: function(className, classDef) {
            if(this._checkClassRegistraionErrors(className, classDef)){return;}
            var itemDependencies = this._getItemDependencies(className, classDef);
            this._registerDependencies(itemDependencies);
            var areDependenciesReady = this._repository.registerDependentClass(itemDependencies, this._onDependenciesReady, classDef, className);
            if(!areDependenciesReady){
                return itemDependencies;
            }
        },

        _onDependenciesReady: function(className, classDef){
            this._prepClassData(classDef);
            var resourcesDeps = this._prepResources(classDef);
            var self = this;

            if(resourcesDeps && resourcesDeps.length) {
                classDef._fields_.Resources = resourcesDeps;
                resource.getResources(resourcesDeps, function(resources) {
                    classDef._fields_.$Resources = resources;
                    classDef._fields_.resources = resources;
                    self._createAndRegisterXClass(className, classDef);
                });
            }else{
                self._createAndRegisterXClass(className, classDef);
            }
        },

        _fixClassDefinition: function(classDef) {
            if (classDef._binds_) {
                classDef._fields_._binds_ = classDef._binds_;
            }
        },

        _createAndRegisterXClass:function(className, classDef){
            var _class = this._xclass.createClass(classDef, className);
            _class._classDef_ = classDef; // Still used for new base component!!

            this._repository.registerClass(_class);
            if (classDef.onClassReady) {
                classDef.onClassReady(_class);
            }
        },

        _checkClassRegistraionErrors:function(className, classData){
            var errorCode = this._getClassDataErrorCode(className, classData);
            if (errorCode) {
                LOG.reportError(wixErrors.CLASS_INVALID_PENDING_OBJECT, classData && classData.name || "Unknown class", "class data validation", errorCode);
                return true;
            }
        },
        _registerDependencies: function(dependenciesArray) {
            var loadedClasses = this.define.getDefinition('Class');
            for(var i = 0; i < dependenciesArray.length; ++i) {
                var className = dependenciesArray[i];
                if(this._repository.getClassStatus(className) === 'loaded') {
                    var ClassDefFunc = nsUtil.getNameSpace(loadedClasses, className);
                    this.registerNewClass(className, ClassDefFunc);
                }
            }
        },

        _getFullNotReadyDependencyList: function (className, dependeincies, fullDependencyObj) {
            fullDependencyObj = fullDependencyObj || {};
            for (var i = 0; i < dependeincies.length; i++) {
                var current = dependeincies[i];
                if (current === className || fullDependencyObj[current]) {
                    continue;
                }
                var currentDependencies = this._repository.getClassWaitingDependencies(current);
                if (currentDependencies) {
                    var notReadyCurrentDependencies = [];
                    for (var j = 0; j < currentDependencies.length; j++) {
                        if (!this._repository.isClassReady(currentDependencies[j])) {
                            notReadyCurrentDependencies.push(currentDependencies[j]);
                        }
                    }
                    if (notReadyCurrentDependencies.length > 0) {
                        fullDependencyObj[current] = notReadyCurrentDependencies;
                        this._getFullNotReadyDependencyList(className, notReadyCurrentDependencies, fullDependencyObj);
                    }
                }
                return fullDependencyObj;
            }
        },

        _checkReadyRamificationsOnDependencies:function(className, dependencyObj){
            for(var dependencyName in dependencyObj){
                var dependenciesList = dependencyObj[dependencyName];
                for(var i=0; i<dependenciesList.length; i++){
                    var item = dependenciesList[i];
                    if(!dependencyObj[item] && className !== item){
                        return false;
                    }
                }
            }
            return true;
        },

        _getItemDependencies:function (className, classDef) {
            if(!classDef) {
                return;
            }
            var dependencies = [];

            if (classDef._extends_) {
                dependencies.combine(this._extractStringsOnlyArray(classDef._extends_));
            }

            if (classDef._imports_) {
                dependencies.combine(this._extractStringsOnlyArray(classDef._imports_));
            }

            if (classDef._traits_) {
                dependencies.combine(this._extractStringsOnlyArray(classDef._traits_));
            }

            // adjust dependencies to currently loaded experiments
            dependencies = this._replaceDependenciesWithOverrides(className, dependencies);

            return dependencies;
        },

        _replaceDependenciesWithOverrides:function (className, dependencies) {
            if (Object.keys(this._overrides).length) {
                Array.each(dependencies, function (dependency, index) {
                    if (this._overrides[dependency]) {
                        // first step - takes the last from the array, there can be multiple experiments loaded
                        var replacementIndex = this._overrides[dependency].length - 1;
                        // second step - if class name is in the list (and not the only one) take the previous one
                        var myIndex = this._overrides[dependency].indexOf(className);
                        if (myIndex >= 0) {
                            replacementIndex = myIndex ? myIndex - 1 : 0;
                        }
                        // avoid circular dependencies
                        if (this._overrides[dependency][replacementIndex] != className) {
                            dependencies[index] = this._overrides[dependency][replacementIndex];
                        }
                    }
                }.bind(this));
            }
            return dependencies;
        },

        /**
         * returns an array of strings.
         * for a string item - returns [item]
         * for an array item - returns an array of the strings contained in item
         */
        _extractStringsOnlyArray:function (item) {
            if (typeOf(item) == 'string') {
                return [item];
            }

            if (typeOf(item) == 'array') {
                return item.filter(this._isString);
            }

            return [];
        },

        _isString:function (item) {
            return typeOf(item) == 'string';
        },

        /**
         * Prepare classDef
         * Populate matching functions to classDef
         * @param classDef
         */
        _prepClassData:function (classDef) {
            this._prepClassExtends(classDef);
            this._prepClassTraits(classDef);
            this._prepClassImports(classDef);
            classDef._methods_.injects = this._WClassInjects;
            classDef._fields_.define = this.define;
            classDef._fields_.resource = this.resource;

            return classDef;
        },

        _WClassInjects: function(){
            return window.W;
        },

        _prepClassExtends:function (classDef) {
            if (classDef._extends_ && (typeOf(classDef._extends_) == 'string')) {
                classDef._fields_._extends_ = this._repository.getClass(classDef._extends_);
            }
        },

        _prepClassTraits:function (classDef) {
            if (classDef._traits_) {
                var traitNames = classDef._traits_;
                classDef._fields_._traits_ = [];
                for (var i = 0; i < traitNames.length; i++) {
                    var trait = traitNames[i];
                    classDef._fields_._traits_.push(this._repository.getClass(trait));
                }
            }
        },


        _prepClassImports:function (classDef) {
            var _imports = {};
            var isExtended = classDef._fields_._extends_ && classDef._fields_._extends_.prototype && classDef._fields_._extends_.prototype.imports;

            if (isExtended) {
                _imports = Object.clone(classDef._fields_._extends_.prototype.imports);
            }

            if (classDef._imports_) {
                for (var j = 0; j < classDef._imports_.length; j++) {
                    var classFullName = classDef._imports_[j];
                    var className = classFullName.split('.').getLast();

                    if (_imports[className]) {
                        _imports[classFullName] = this._repository.getClass(classFullName);
                    } else {
                        _imports[className] = this._repository.getClass(classFullName);
                    }
                }
            }
            if (!_.isEmpty(_imports)) {
                classDef._fields_.imports = _imports;
            }

            // Add traits imports
            if (classDef._fields_._traits_) {
                for (var i = 0; i < classDef._fields_._traits_.length; ++i) {
                    if (!classDef._fields_._traits_[i]) {
                        return classDef;
                    }

                    var traitProto = classDef._fields_._traits_[i].prototype;
                    if (traitProto && traitProto.imports) {
                        if (!classDef._fields_.imports) {
                            classDef._fields_.imports = {};
                        }

                        Object.merge(classDef._fields_.imports, traitProto.imports);
                    }
                }
            }
        },

        _prepResources:function (classDef) {
            var _resources = classDef._resources_ || [];

            var _extends = classDef._fields_._extends_;
            var parentResourcesNames = _extends && _extends.prototype && _extends.prototype.Resources;
            parentResourcesNames = parentResourcesNames ? Array.clone(_extends.prototype.Resources) : [];

            _resources = Array.combine(_resources, parentResourcesNames);


            // Add traits resources
            if (classDef._fields_._traits_) {
                for (var i = 0; i < classDef._fields_._traits_.length; ++i) {
                    var traitProto = classDef._fields_._traits_[i].prototype;
                    if (traitProto && traitProto.Resources) {
                        _resources = Array.combine(_resources, traitProto.Resources);
                    }
                }
            }

            return _resources;
        },

        _getClassDataErrorCode:function (className, classDef) {
            if (!className || !instanceOf(className, String)) {
                return  "No class name";
            }

            if (!this._isValidClassName(className)) {
                return "Invalid class name: [" + className +"]";
            }

            if (classDef._extends_ && typeOf(classDef._extends_) !== 'string') {
                return "Extends must be a string";
            }

            if (classDef._imports_ && !this._isStringArray(classDef._imports_)) {
                return "Invalid imports array";
            }

            if (classDef._traits_ && !this._isStringArray(classDef._traits_)) {
                return "Invalid traits array";
            }

            return false;
        },

        _isValidClassName:function (name) {
            // package name validation
            var fullClassName = name.split(".");
            var l = fullClassName.length - 1;

            for (var i = 0; i < l; i++) {
                if (fullClassName[i].length === 0) {
                    return false;
                }

                if (!fullClassName[i].test(/^[a-z][a-z0-9_]*$/)) {
                    return false;
                }
            }

            // class name validation
            if (!fullClassName[l].test(/^[A-Z][A-Za-z0-9_]*$/)) {
                return false;
            }

            return true;
        },

        _isStringArray:function (array) {
            if (typeOf(array) != 'array') {
                return false;
            }

            return array.every(function (item) {
                return (typeOf(item) == 'string');
            });
        }
    });

    return ClassParser;
});