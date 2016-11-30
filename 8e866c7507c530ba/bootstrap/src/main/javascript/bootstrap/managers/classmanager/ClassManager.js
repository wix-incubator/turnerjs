/**
 * @class bootstrap.managers.classes.ClassManager
 */
define.bootstrapClass('bootstrap.managers.classmanager.ClassManager', function () {
    /** @constructor */
    function ClassManager() {
    }

    /** @lends bootstrap.managers.classes.ClassManager */
    ClassManager.extendPrototype({
        /**
         * Setup method for ClassManager
         * @return {bootstrap.managers.classes.ClassManager} self
         */
        init:function () {
            var self = this;

            resource.getResources(['scriptLoader', 'W.Experiments'], function (resourceMap) {
                var scriptLoader = resourceMap.scriptLoader;
                self._experimentManager = resourceMap.W.Experiments;
                var ClassDefinition = self.define.getBootstrapClass('bootstrap.managers.classmanager.ClassDefinition');

                self._classRepo = self.define.createBootstrapClassInstance('bootstrap.managers.classmanager.ClassRepository').init(scriptLoader, self);
                self._classParser = self.define.createBootstrapClassInstance('bootstrap.managers.classmanager.ClassParser').init(self._classRepo, ClassDefinition, self._experimentManager);
                self.define.Class.definitionModifier = self._onClassDefineCallBack.bind(self);
            });
            return this;
        },

        addClassNamespaceHook:function (hookFunc) {
            this._classRepo.classNamespacesHooks.push(hookFunc);
        },

        addClassReadyHandler:function (handlerFunc) {
            this._classRepo.classReadyHandlers.push(handlerFunc);
        },

        loadMissingClasses: function() {
            this._classRepo.loadMissingClasses();
        },

        getClass:function (className, callback) {
            var classStatus = this._classRepo.getClassStatus(className);

            if (classStatus == 'ready') {
                var Class = this._classRepo.getClass(className);
                callback && callback(Class);
                return Class;
            } else {
                this._getNotReadyClass(className, classStatus, callback);
            }
        },

        _getNotReadyClass:function (className, classStatus, callback) {
            this._classRepo.addToWaitingForReady(className, callback);
            switch (classStatus) {
                case 'loaded':
                    var loadedClasses = this.define.getDefinition('Class');
                    var ClassDefFunc = nsUtil.getNameSpace(loadedClasses, className);
                    var dependencies = this._classParser.registerNewClass(className, ClassDefFunc);
                    //if the class has dependencies that are nor ready, they must be registered in order for the class to register successfully
                    if (dependencies && dependencies.length > 0) {
                        this._getClassDependencies(dependencies);
                    }
                    break;
                case 'missing':
                    this._classRepo.addClassesToScriptLoadingQueue([className]);
                    break;
            }
        },

        _getClassDependencies:function (dependencies) {
            for (var i = 0; i < dependencies.length; i++) {
                var dependencyStatus = this._classRepo.getClassStatus(dependencies[i]);
                if (dependencyStatus != 'ready') {
                    this.getClass(dependencies[i]);
                }
            }
        },

        registerClassDefinition:function (className, ClassDef) {
            var dependencies = this._classParser.registerClassDefinition(className, ClassDef);
            //if the class has dependencies that are nor ready, they must be registered in order for the class to register successfully
            if (dependencies && dependencies.length > 0) {
                this._getClassDependencies(dependencies);
            }
        },

        /**
         * @deprecated
         * @param className
         * @param cb
         * @return {*}
         */
        get:function (className, cb) {
            return this.getClass(className, cb);
        },

        _onClassDefineCallBack:function (className, def) {
            if (this._classRepo.isClassWaitingForReady(className)) {
                this._classParser.registerNewClass(className, def);
            }
            return def;
        },

        override:function (originalClassName, overrideClass) {
            this._classRepo.override(originalClassName, overrideClass);
        },

        overrideDependency:function (originalClassName, newClassName) {
            return this._classParser.override(originalClassName, newClassName);
        },

        getClassStatus:function (className) {
            return this._classRepo.getClassStatus(className);
        },

        getClassStatusDetails:function (className) {
            return this._classRepo.getClassStatusDetails(className);
        },

        /**
         * @deprecated USE define.Class to add class
         * @param classData
         * @return {*} Class constructor if all of the dependencies are ready
         */
        newClass:function (classData) {
            if (this._classRepo.getClass(classData.name)) {
                LOG.reportError(wixErrors.CLASS_ALREADY_EXIST, this.className, "newClass", classData.name);
                return;
            }
            var classDependencies = this._classParser.registerClass(Object.clone(classData));

            return this.getClass(classData.name);
        },

        _getClassDataErrorCode:function (item) {
            this._classParser._getClassDataErrorCode(item);
        },

        removeClass:function (className) {
            this._classRepo.deleteClass(className);
        },

        /**
         *  Function: isReady
         *      returns the manager's current status
         *
         *  Returns:
         *      true
         */
        isReady:function () {
            return this._classRepo && this._classRepo.isReady();
        },

        /**
         *  Function: clone
         *      clones this instance and its data.
         *
         *   Returns:
         *      a new instance of ClassManager.
         */
        clone:function (newDefine) {
            var newInstance = newDefine.createBootstrapClassInstance('bootstrap.managers.classmanager.ClassManager', []);
            var ClassDefinition = newDefine.getBootstrapClass('bootstrap.managers.classmanager.ClassDefinition');
            newInstance._classRepo = this._classRepo.clone(newDefine);
            newDefine.getResourceFetcher().getResourceValue('W.Experiments', function(experiments){
                newInstance._experimentManager = experiments;
                newInstance._classParser = newDefine.createBootstrapClassInstance('bootstrap.managers.classmanager.ClassParser', [newInstance._classRepo, ClassDefinition, newInstance._experimentManager]);
            });
            return newInstance;
        }
    });

    return ClassManager;
});