/**
 * @class bootstrap.bootstrap.deploy.DeploymentPhaseExecutor
 */
define.bootstrapClass('bootstrap.bootstrap.deploy.DeploymentPhaseExecutor', function () {
    function DeploymentPhaseExecutor() {
    }

    /**
     * @lends bootstrap.bootstrap.deploy.DeploymentPhaseExecutor
     */
    DeploymentPhaseExecutor.extendPrototype({
        /**
         * Setup method (required before any other operation)
         * @param phaseNumber
         * @param {Object} deploymentScope
         * @param {Function} logFunc
         * @param {Number} timeToTimeout
         */
        init:function (phaseNumber, deploymentScope, logFunc, timeToTimeout) {
            this.id = ((+new Date() ) % 10000).toString(36);
            this.timeToTimeout = timeToTimeout || 3000;
            this.phase = PHASES.getPhaseFormIndex(phaseNumber);
            this._async = [];
            this._deployed = deploymentScope;
            this._deployedInstances = [];
            this.log = logFunc;
            return this;
        },

        /**
         * runs a function and stores the result
         * @param {Function} func
         * @param {Object} scope
         * @param {Array} args
         */
        run:function (func, scope, args) {
            this.log(this.phase + '[' + this.id + '] run: ' + func);
            func.apply(scope, args);
        },

        /**
         * runs a function defined as a bootstrapClass, and passes the definitions as an argument
         * @param targetName
         * @param bootstrapClassDefName
         */
        publishBootstrapClass:function (targetName, bootstrapClassDefName) {
            this.log(this.phase + '[' + this.id + '] publish: ' + targetName + '.' + bootstrapClassDefName);

            var result = this._getDefinitionValue('bootstrapClass', bootstrapClassDefName);
            nsUtil.setNameSpace(this._deployed, targetName, result);
        },

        /**
         * creates an instance of a bootstrap class (i.e. runs the class def function, and creates an instance of the returned type)
         * @param {String} instancePath Name of deployed instance (within define.resource namespace)
         * @param {String} bootstrapClassDefName
         * @param {Array?} initParams Parameters array for init method. If undefined, the init method will not run.
         */
        createBootstrapClassInstance:function (instancePath, bootstrapClassDefName, initParams) {
            this.log(this.phase + '[' + this.id + '] createBootstrapClassInstance: ' + instancePath + '.' + bootstrapClassDefName);

            var instance = this.define.createBootstrapClassInstance(bootstrapClassDefName);
            if (initParams) {
                instance.init.apply(instance, initParams);
            }
            this._deployedInstances.push(instance);
            nsUtil.setNameSpace(this._deployed, instancePath, instance);
            this.define.resource(instancePath, instance);
            return instance;
        },

        /**
         * Creates an instance of a defined class using classmanager manager
         * <p><b>Note:</b> classmanager (an instance of ClassManager) must be deployed before this method is used</p>
         * @param target
         * @param className
         */
        createClassInstance:function (target, className) {
            this.log(this.phase + '[' + this.id + '] createClassInstance: ' + target + ' : ' + className);

            var classManager = this.getClassManagerInstance();

            if (classManager) {
                var pendingInstance = this._setPendingStatus(target, className);
                classManager.getClass(className, function (Class) {
                    var instance = new Class();
                    var index = this._deployedInstances.indexOf(pendingInstance);
                    this._deployedInstances[index] = instance;

                    nsUtil.setNameSpace(this._deployed, target, instance);
                    this.define.resource(target, instance);
                }.bind(this));
            } else {
                throw new Error('Class manager not deployed');
            }
        },

        /**
         * @return {bootstrap.managers.classmanager.ClassManager}
         */
        getClassManagerInstance:function () {
            return nsUtil.getNameSpace(this._deployed, 'W.Classes');
        },

        /**
         * sets target (on deployed instances namespace) as definitionNamespace[.definitionName]
         * @param {String} target name within the deployed namespace
         * @param {String} definitionNamespace example: Class, component, const etc
         * @param {String?} definitionName a path within definitionNamespace
         */
        copyNamespace:function (target, definitionNamespace, definitionName) {
            this.log(this.phase + '[' + this.id + '] copyNamespace: ' + target + ' : ' + definitionNamespace);

            var definitionValue = this._getDefinitionValue(definitionNamespace, definitionName);
            nsUtil.setNameSpace(this._deployed, target, definitionValue);
        },

        /**
         * Loads a URL using the resource 'scriptLoader'
         * The result is a loading context instance, that has a isReady method which returns true is the script is successfully loaded
         * @param {Object|String} resourceObj url or {id:resourceId, url:resourceUrl}
         */
        loadResource:function (resourceObj) {
            if (typeof resourceObj == "string") {
                resourceObj = {
                    url:resourceObj,
                    id: 'Loaded_at_phase_' + this.phase + (Math.random() * 0xffffffff).toString(2)
                };
            }

            var context = {};
            context.isReady = function () {
                return false;
            };
            context.onLoad = function (content, src, event) {
                context.isReady = function () {
                    return true;
                };
            };
            context.onFailed = function (content, src, event) {
                context.isReady = function () {
                    throw new Error('Error loading: ' + src, event);
                };
            };

            this._deployedInstances.push(context);

            this.resource.getResourceValue('scriptLoader', function (scriptLoader) {
                scriptLoader.loadResource(resourceObj, context);
            });
        },

        /**
         * loads a manifest json
         * @param {String|JSON} manifest Manifest JSON or resource name of a defined manifest resource
         * @param {Boolean?} dontWaitForLoading
         * @param {Boolean?} ignoreFailure
         * @param {Function=} filter function. gets the resource object and returns true for resources that should be loaded
         */
        loadManifest:function (manifest, dontWaitForLoading, ignoreFailure, filter) {
            function nope() {
                return dontWaitForLoading;
            }

            function onLoad() {
                manifestStatus.isReady = function () {
                    return true;
                };
            }

            function onFailed() {
                manifestStatus.isReady = function () {
                    if (ignoreFailure) {
                        throw new Error('Some manifest resources failed to load', manifestStatus);
                    }
                    return false;
                };
            }

            var manifestStatus = {
                isReady:nope,
                context:"Loading not started"
            };

            this._deployedInstances.push(manifestStatus);

            if (typeof manifest === "string") {
                this.resource.getResources([manifest, 'scriptLoader'], function (resources) {
                    var manifestArray = nsUtil.getNameSpace(resources, manifest);
                    manifestStatus.context = resources.scriptLoader.loadManifest(manifestArray, onLoad, onFailed, filter);
                });
            } else {
                this.resource.getResourceValue('scriptLoader', function (scriptLoader) {
                    manifestStatus.context = scriptLoader.loadManifest(manifest, onLoad, onFailed);
                });
            }
            setTimeout(this.phaseTimeout.bind(this), this.timeToTimeout);
        },

        phaseTimeout:function () {
            if (!this.isPhaseReady()) {
                window.deployStatus('timeout', {executer:this});
                throw new Error('Deployment Phase is taking too long at ' + this.phase + ' phase');
            }
        },

        /**
         * Makes the phase asynchronous
         * Example<pre><code>
         *     var done = deploy.async();
         *     this.resourse.getResourceValue('some.resource', function(){
         *          // ...
         *          done(); // the phase will not end until done is called
         *     });
         * </code></pre>
         * @param {Number=} timeout async timeout, in millisec
         * @params {String='Async phase ... timed out after ...mSec'} message
         * @return {Function} a done callback for phase
         */
        async:function (timeout, message) {
            var asyncCalled = this._async;
            var index = asyncCalled.length;
            this._async.push({
                timeout:new Date().getTime() + timeout,
                message:message || 'Async phase ' + this.phase + ' timed out after ' + timeout + 'mSec'
            });
            return function () {
                asyncCalled[index] = true;
            };
        },

        /**
         *
         * @return {Boolean} true if all the instances created in this phase are ready (i.e. have a isReady method that returns true)
         * and all async callbacks were called (if async was used).
         */
        isPhaseReady:function () {
            var ready = true;

            this._deployedInstances.forEach(function (instance) {
                if (!instance.isReady()) {
                    ready = false;
                }
            });

            return ready && this._async.every(function (item) {
                if (item.timeout && item.timeout < new Date().getTime()) {
                    throw new Error(item.message);
                }
                return item === true;
            });
        },

        _setPendingStatus:function (target, className) {
            var pendingInstance = new Pending(target, className);
            this._deployedInstances.push(pendingInstance);
            return pendingInstance;
        },

        _getDefinitionValue:function (definitionNamespace, definitionName) {
            var def = this.define.getDefinition(definitionNamespace, definitionName);
            if (!def) {
                throw new Error('Missing definition or namespace: ' + definitionNamespace + "." + definitionName);
            }

            return def;
        }
    });

    function Pending(target, className) {
        this.className = className;
        this.target = target;
        this.isReady = function () {
            return false;
        };
    }

    return DeploymentPhaseExecutor;
});
