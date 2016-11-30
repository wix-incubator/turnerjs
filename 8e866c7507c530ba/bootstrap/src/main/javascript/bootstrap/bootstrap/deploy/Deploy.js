/**
 * @class bootstrap.bootstrap.deploy.Deploy
 */



define.bootstrapClass('bootstrap.bootstrap.deploy.Deploy', function () {

    /** @constructor */
    function Deploy() {
        this._log = [];
        this._onDeploymentCompleteCallbacks = [];
    }

    /** @lends bootstrap.bootstrap.deploy.Deploy */
    Deploy.extendPrototype({
        /**
         * A root object for definitions
         * @field
         * @private
         */
        _deployed:undefined,

        /**
         * deploys all the defined deployments
         * @see define.deployment
         *
         * @param {Object} deployedInstancesScope
         * @return {bootstrap.bootstrap.deploy.Deploy} self
         */
        init:function (deployedInstancesScope) {
            console.groupCollapsed && console.groupCollapsed('Deployment log');
            this.log('Deployment started. Instances will be deployed on:', deployedInstancesScope);
            this._deployed = deployedInstancesScope;
            this._deploymentsDef = this._getDeploymentsDefinition();
            this._phases = this._deploymentsDef._phases_;
            this._deployingPhase = PHASES.BOOTSTRAP;
            //If MooTools hasn't yet been loaded, initialize this global to prevent malware from taking over it and break mootools. (Mootools expect $ to be null in order to assign itself to it)
            if (!window.MooTools) {
                window.$ = null;
            }

            this._deployPhase(this._deployingPhase);
            return this;
        },

        /**
         *
         * @param {bootstrap.bootstrap.deploy.DeploymentPhaseExecutor} deploymentPhaseExecutor
         * @private
         */
        _deployNextPhase: function (deploymentPhaseExecutor) {
            if (deploymentPhaseExecutor === undefined || deploymentPhaseExecutor.isPhaseReady()) {
                if (deploymentPhaseExecutor) {
                    console.log('Done deploying phase: ' + PHASES.getPhaseFormIndex(this._deployingPhase));
                } else {
                    console.log('Phase: ' + PHASES.getPhaseFormIndex(this._deployingPhase) + ' had no content');
                }
                if (++this._deployingPhase <= PHASES.lastPhaseIndex()) {
                    console.log('Deploying phase: '+ PHASES.getPhaseFormIndex(this._deployingPhase));
                    this._deployPhase(this._deployingPhase);
                } else {
                    console.log('Deployment complete');
                    console.groupEnd && console.groupEnd();
                    _.forEach(this._onDeploymentCompleteCallbacks, function(callback) {
                        callback();
                    });
                }
            } else {
                setTimeout(this._deployNextPhase.bind(this, deploymentPhaseExecutor), 30);
            }
        },

        _loadAllManifestsForPhase:function (phaseNumber, callback) {
            this.resource.getResources(['scriptLoader', 'loadAtPhase'], function (resources) {
                var phase = PHASES.getPhaseFormIndex(phaseNumber);
                var manifestsToLoad = resources.loadAtPhase[phase];
                if(manifestsToLoad && manifestsToLoad.length){
                    console.log('Loading scripts for phase ' + PHASES.getPhaseFormIndex(phaseNumber), resources.loadAtPhase[phase]);
                    resources.scriptLoader.loadManifest('', manifestsToLoad, function(){
                        callback();
                    });
                } else {
                    callback();
                }
            });
        },

        /**
         *
         * @param {Number} phaseNumber
         * @private
         */
        _deployPhase:             function (phaseNumber) {
            var self = this;
            this._loadAllManifestsForPhase(phaseNumber, function () {
                var deployExec;
                if (self._phases[phaseNumber] && self._phases[phaseNumber].length > 0) {
                    self.log("Deploying phase " + PHASES.getPhaseFormIndex(phaseNumber));

                    /** @type {bootstrap.bootstrap.deploy.DeploymentPhaseExecutor} */
                    deployExec = self.define.createBootstrapClassInstance('bootstrap.bootstrap.deploy.DeploymentPhaseExecutor').init(phaseNumber, self._deployed, self.log.bind(self));
                    self._phases[phaseNumber].forEach(function (deployFunc) {
                        deployFunc(deployExec);
                    });

                }
                window.deployStatus('phases', {
                    phaseExecuter:deployExec,
                    phase:self._phases[phaseNumber],
                    deploy:self,
                    time: LOG && LOG.getSessionTime() || 0
                });
                //this is a work-around. instead of sending one generic event (DEPLOY_PHASE_COMPLETE), because BI have a problem with that, we've split the events to individual ones, with different event IDs each
                var phaseEvents = [wixEvents.DEPLOY_PHASE_COMPLETE_BOOTSTRAP,wixEvents.DEPLOY_PHASE_COMPLETE_LIBS,wixEvents.DEPLOY_PHASE_COMPLETE_CLASSMANAGER,wixEvents.DEPLOY_PHASE_COMPLETE_UTILS,wixEvents.DEPLOY_PHASE_COMPLETE_MANAGERS,wixEvents.DEPLOY_PHASE_COMPLETE_INIT,wixEvents.DEPLOY_PHASE_COMPLETE_POST_DEPLOY,wixEvents.DEPLOY_PHASE_COMPLETE_TEST];
                var eventToSend = phaseEvents[phaseNumber];
                LOG.reportEvent(eventToSend, {i1: phaseNumber, c1: PHASES.getPhaseFormIndex(phaseNumber)});
                self._deployNextPhase(deployExec);
            });
        },

        /**
         *
         * @param def
         * @param deployments
         * @private
         */
        _runDeployments:          function (def, deployments) {
            nsUtil.forEachLeaf(deployments, function (deployment) {
                if (deployment instanceof Function) {
                    deployment(def);
                }
            });
        },
        /**
         * creates an instance of DeploymentDefinition and populates it with all the migration definitions
         * @return {bootstrap.bootstrap.deploy.DeploymentDefinition}
         * @private
         */
        _getDeploymentsDefinition:function () {
            var def = this.define.createBootstrapClassInstance('bootstrap.bootstrap.deploy.DeploymentDefinition');
            this._runDeployments(def, this.define.getDefinition('deployment'));
            return def;
        },

        /**
         * logs a migration operation.
         *
         */
        log:function () {
            var args = Array.prototype.splice.call(arguments, 0);
            args.forEach(this._log.push.bind(this._log));
        },

        addOnDeploymentComplete: function(func) {
            this._onDeploymentCompleteCallbacks.push(func);
        }
    });

    return Deploy;
});