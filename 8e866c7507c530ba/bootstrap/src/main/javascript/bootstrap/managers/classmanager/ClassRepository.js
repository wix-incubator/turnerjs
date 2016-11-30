/**
 * @class bootstrap.managers.classes.ClassRepository
 */
define.bootstrapClass('bootstrap.managers.classmanager.ClassRepository', function (define) {
    /** @constructor */
    function ClassRepository() {
        this.loadMissingClasses = this.loadMissingClasses.bind(this);
    }

    /** @lends bootstrap.managers.classes.ClassRepository */
    ClassRepository.extendPrototype({
        /**
         * Setup method for ClassRepository
         * @param definedClasses
         * @param scriptLoader
         * @return {bootstrap.managers.classes.ClassRepository} self
         */
        init:function (scriptLoader, loadMissingClasses) {
            //console.oldLog('class manager',definedClasses )
            this._readyClasses = {};
            this._waitingForDependencies = {};
            this._waitingForClassReady = {};
            this._scriptLoadingQueue = [];
            this._scriptLoader = scriptLoader;
            this._loadingMissingClassesStarted = !!loadMissingClasses;
            this._loadingMissingClassesTimer = null;
            this.classNamespacesHooks = [];
            this.classReadyHandlers = [];
            return this;
        },

        getClass:function (className) {
            return this._readyClasses[className] || null;
        },

        getClassWhenReady:function (className, callback) {
            if (this.isClassReady(className)) {
                if (callback) {
                    callback(this.getClass(className));
                }

                return this.getClass(className);
            }

            if (!this.isClassLoaded(className)) {
                this.addClassesToScriptLoadingQueue([className]);
            }

            if (!this._waitingForClassReady[className]) {
                this._waitingForClassReady[className] = [];
            }

            if (callback) {
                this._waitingForClassReady[className].push(callback);
            }
        },

        addToWaitingForReady:function (className, callback) {
            if (!this._waitingForClassReady[className]) {
                this._waitingForClassReady[className] = [];
            }

            if (callback) {
                this._waitingForClassReady[className].push(callback);
            }
        },

        getClassStatus:function (className) {
            if (this.isClassReady(className)) {
                return 'ready';
            }

            if (this.isClassWaitingForDependencies(className)) {
                return 'pending';
            }

            if (this.isClassLoaded(className)) {
                return 'loaded';
            }

            return 'missing';

        },
        getClassStatusDetails:function (className, level) {
            if (!level) {
                level = 1;
            }

            var classStatus = this.getClassStatus(className);

            if (classStatus === 'ready') {
                return 'ready';
            }

            if (classStatus === 'missing') {
                return 'missing';
            }

            var res = 'pending:\n';
            var dependencies = this._waitingForDependencies[className].dependenciesArray;
            for (var i = 0; i < dependencies.length; i++) {
                var depRes = this.getClassStatusDetails(dependencies[i], level + 1);
                if (depRes != 'ready') {
                    res += this._addTabs(level) + 'class :' + dependencies[i] + ':' + depRes;
                }
            }

            return res;
        },
        _addTabs:function (level) {

            var res = '';
            for (var i = 0; i < level; i++) {
                res += '\t';
            }
            return res;
        },

        registerClass:function (wclass) {
            var className = wclass.prototype.$className;
            this._readyClasses[className] = wclass;
            var i;
//            for (i = 0; i < this.classReadyHandlers.length; ++i) {
            for (i = this.classReadyHandlers.length-1; i >= 0 ; --i) {
                this.classReadyHandlers[i](className, wclass);
            }

            if (this._waitingForClassReady[className]) {
                for (i = 0; i < this._waitingForClassReady[className].length; i++) {
                    this._waitingForClassReady[className][i](wclass);
                }

                delete this._waitingForClassReady[className];
            }

            for (var eachClass in this._waitingForDependencies) {
                var pendingClassObj = this._waitingForDependencies[eachClass];

                if (this.areClassesReady(pendingClassObj.dependenciesArray)) {
                    delete this._waitingForDependencies[eachClass];
                    pendingClassObj.callback(eachClass, pendingClassObj.classData);
                }
            }
        },

        isClassReady:function (className) {
            return typeof this._readyClasses[className] !== 'undefined';
        },

        deleteClass:function (className) {
            delete this._readyClasses[className];
        },

        areClassesReady:function (classList) {
            var i, l;
            var isReady = true;

            for (i = 0, l = classList.length; i < l; i++) {
                if (!this.isClassReady(classList[i])) {
                    isReady = false;
                    break;
                }
            }

            return isReady;
        },

        /**
         *
         * @param dependenciesArray
         * @param callback
         * @param classData
         * @param className
         * @returns {boolean} - true if all dependencies are ready
         */
        registerDependentClass:function (dependenciesArray, callback, classData, className) {
            if (this.areClassesReady(dependenciesArray)) {
                callback(className, classData);
                return true;
            }

            this._waitingForDependencies[className] = {
                dependenciesArray:dependenciesArray,
                callback:callback,
                classData:classData
            };

            this.addClassesToScriptLoadingQueue(dependenciesArray);
            return false;
        },

        loadMissingClasses:function () {
            clearTimeout(this._loadingMissingClassesTimer);
            delete this._loadingMissingClassesTimer;
            this._loadingMissingClassesStarted = true;

            for (var i = 0; i < this._scriptLoadingQueue.length; ++i) {
                if(this.getClassStatus(this._scriptLoadingQueue[i]) !== 'missing'){
                    continue;
                }
                var resource = {
                    'url':this._scriptLoadingQueue[i]
                };
                this._scriptLoader.loadResource(resource);
            }

            this._scriptLoadingQueue = [];
        },

        isClassLoaded:function (className) {
            var loadedClasses = this.define.getDefinition('Class');
            return nsUtil.getNameSpace(loadedClasses, className);
        },

        isClassWaitingForDependencies:function (className) {
            return this._waitingForDependencies[className];
        },

        getClassWaitingDependencies:function(className){
            if(this.isClassWaitingForDependencies(className)){
                return this._waitingForDependencies[className].dependenciesArray;
            }else{
                return null;
            }
        },

        isClassWaitingForReady:function (className) {
            return this._waitingForClassReady[className];
        },

        isReady:function () {
            var _each;

            for (_each in this._waitingForDependencies) {
                return false;
            }

            this._scriptLoadingQueue = this._filterLoadedClassesFromList(this._scriptLoadingQueue);
            if (this._scriptLoadingQueue.length) {
                return false;
            }

            for (_each in this._waitingForClassReady) {
                return false;
            }

            if (window.deployStatus && !window.deployStatus.classRepoIsReadyTime) {
                window.deployStatus.classRepoIsReadyTime = LOG && LOG.getSessionTime();
            }
            return true;
        },

        clone:function (newDefine) {
            return newDefine.createBootstrapClassInstance('bootstrap.managers.classmanager.ClassRepository', [this._scriptLoader, this._loadingMissingClassesStarted]);
        },

        addClassesToScriptLoadingQueue:function (classList) {
            // Filter loaded classes
            var filteredList = this._filterLoadedClassesFromList(classList);
            // Try fetching classes from other namespaces that might have them
            this._loadClassesFromOtherNameSpaces(filteredList);
            // Filter classes again to remove classes that were loaded by other namespaces
            filteredList = this._filterLoadedClassesFromList(filteredList);
            this._scriptLoadingQueue.combine(filteredList);

            if (this._loadingMissingClassesStarted && !this._loadingMissingClassesTimer) {
                this._loadingMissingClassesTimer = setTimeout(this.loadMissingClasses, 10);
            }
        },

        _loadClassesFromOtherNameSpaces:function (classList) {
            var i, j, classStatus;
            var filteredList = [];

            for (i = 0; i < classList.length; i++) {
                for (j = 0; j < this.classNamespacesHooks.length; j++) {
                    if (this.getClassStatus(classList[i]) === 'missing') {
                        this.classNamespacesHooks[j](classList[i]);
                    }
                }
            }
        },

        _filterLoadedClassesFromList:function (classList) {
            var self = this;
            return classList.filter(function (item) {
                return  self.getClassStatus(item) === 'missing';
            });
        },

        override:function (originalClassName, overrideClass) {
            if (!originalClassName) {
                throw new Error("Invalid class name for override");
            }
            this._readyClasses[originalClassName] = overrideClass;
        }
    });

    return ClassRepository;
});
