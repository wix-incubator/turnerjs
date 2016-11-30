define([
    'lodash',
    'core/core/siteAspectsRegistry',
    'core/components/actionsAspectActions/bgScrubAction',
    'core/components/actionsAspectActions/loadAction',
    'core/components/actionsAspectActions/screenInAction',
    'core/components/actionsAspectActions/modeChangeAction',
    'core/components/actionsAspectActions/pageTransitionAction',
    'core/components/actionsAspectActions/exitAction',
    'core/components/actionsAspectActions/triggerTypesConsts',
    'experiment'
], function (_, /** core.siteAspectsRegistry */ siteAspectsRegistry, BgScrubAction, LoadAction, ScreenInAction, ModeChangeAction, PageTransitionAction, ExitAction, triggerTypes, experiment) {
    "use strict";

    /**
     * ActionsAspect constructor
     * - Register actions
     * - Enable them
     * - register triggers
     * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
     * @constructor
     */
    function ActionsAspect(aspectSiteAPI) {
        // Aspect lifetime shared vars
        /** @type {core.SiteAspectsSiteAPI} */
        this._aspectSiteAPI = aspectSiteAPI;
        this._siteData = aspectSiteAPI.getSiteData();
        this._behaviors = [];
        this._pageTransitionComplete = [];
        this._isDuringPageTransition = false;
        this._navigationComplete = [];
        this._actions = {};
        this._previouslyRegisteredPages = [];
        this._didFirstLayout = false;
        this._didPageChange = false;

        this.registerAction(BgScrubAction);
        this.registerAction(LoadAction);
        this.registerAction(ScreenInAction);
        this.registerAction(PageTransitionAction);
        this.registerAction(ExitAction);
        if (experiment.isOpen('sv_hoverBox')) {
            this.registerAction(ModeChangeAction);
        }
        this.enableAction('pageTransition');
        if (_.get(this._siteData, ['renderFlags', 'componentViewMode'], 'preview') === 'preview' ) {
            this.enableAction('bgScrub');
            this.enableAction('screenIn');
            this.enableAction('exit');
            this.enableAction('load');
            if (experiment.isOpen('sv_hoverBox')) {
                this.enableAction('modeChange');
            }
        }



        this._registerTriggers();

        aspectSiteAPI.registerToAddedRenderedRootsDidLayout(onAddedRootDidLayout.bind(this));
    }

    /**
     * Preview an Animation on a component (for DocumentServices)
     * @param {string} compId
     * @param {string} pageId
     * @param {{name:string, duration:number, delay:number, params:object}} animationDef
     * @param {object} transformationsToRestore
     * @param {function} [onComplete]
     */
    ActionsAspect.prototype.previewAnimation = function (compId, pageId, animationDef, onComplete) {
        var page = this._aspectSiteAPI.getPageById(pageId);
        var sequence = page.sequence();
        var params = {
            props: "clip,opacity,transform,transform-origin",
            immediateRender: false
        };

        sequence.add(compId, animationDef.name, animationDef.duration, animationDef.delay, animationDef.params);
        sequence.add(compId, 'BaseClear', 0, 0, params);

        if (onComplete) {
            sequence.onCompleteAll(onComplete);
        }

        return sequence.execute();
    };

    /**
     * Preview a transition on 2 components (for DocumentServices)
     * @param {Array} srcCompIds array of ids
     * @param {Array} targetCompIds array of ids
     * @param {string} pageId
     * @param {{name:string, duration:number, delay:number, params:object}} transitionDef
     * @param {function} [onComplete]
     */
    ActionsAspect.prototype.previewTransition = function (srcCompIds, targetCompIds, pageId, transitionDef, onComplete) {
        var page;
        if (pageId === 'masterPage') {
            page = this._aspectSiteAPI.getMasterPage();
        } else {
            page = this._aspectSiteAPI.getCurrentPage();
        }
        if (page) {
            var sequence = page.sequence();
            var params = {
                props: "clip,opacity,transform,transform-origin",
                immediateRender: false
            };

            sequence.add({
                sourceRefs: srcCompIds,
                destRefs: targetCompIds
            }, transitionDef.name, transitionDef.duration, transitionDef.delay, transitionDef.params);
            sequence.add(srcCompIds.concat(targetCompIds), 'BaseClear', 0, 0, params);

            if (onComplete) {
                sequence.onCompleteAll(onComplete);
            }

            return sequence.execute();
        }
    };

    ActionsAspect.prototype.stopPreviewAnimation = function (sequenceId) {
        var masterPage = this._aspectSiteAPI.getMasterPage();
        var page = this._aspectSiteAPI.getCurrentPopup() || this._aspectSiteAPI.getCurrentPage();

        page.stopSequence(sequenceId, 1);
        masterPage.stopSequence(sequenceId, 1);
    };

    /**
     * Enable an action, first test the action's 'shouldEnable' status to see if it should be enabled in current environment
     * @param {string} actionName
     */
    ActionsAspect.prototype.enableAction = function (actionName) {
        if (this._actions[actionName] && this._actions[actionName].shouldEnable()) {
            this._actions[actionName].enableAction();
        }
    };

    ActionsAspect.prototype.isActionDisabled = function (actionName) {
        return this._actions[actionName] && !this._actions[actionName].isEnabled();
    };

    ActionsAspect.prototype.needToRunPreConditions = function(action) {
        var actionName = action.name;
        return !this._actions[actionName] || !this._actions[actionName].needToRunPreConditions ||
            this._actions[actionName].needToRunPreConditions(action);
    };

    /**
     * Disable an action
     * @param {string} actionName
     */
    ActionsAspect.prototype.disableAction = function (actionName) {
        if (this._actions[actionName]) {
            this._actions[actionName].disableAction();
        }
    };

    /**
     * Execute an action (as if it was triggered)
     * @param {string} actionName
     * @param {string} [triggerType]
     */
    ActionsAspect.prototype.executeAction = function (actionName, triggerType) {
        var triggerArgs = _.drop(arguments, 2);
        if (this._actions[actionName]) {
            var action = this._actions[actionName];
            action.executeAction.apply(action, [triggerType].concat(triggerArgs));
        }
    };

    if (!experiment.isOpen('sv_hoverBox')) {
        /**
         * Is page in registered pages list
         * @param {string} pageId
         * @returns {boolean}
         */
        ActionsAspect.prototype.isPageRegistered = function (pageId) {
            return _.includes(this._previouslyRegisteredPages, pageId);
        };

        /**
         * Register a page in list
         * @param {string} pageId
         */
        ActionsAspect.prototype.setPageAsRegistered = function (pageId) {
            if (!this.isPageRegistered(pageId)) {
                this._previouslyRegisteredPages.push(pageId);
            }
        };
    }

    /**
     * Register behaviors of a component to behaviors list, overriding previously registered behaviors of this type for this component
     * @param {string} compId
     * @param {string} pageId
     * @param {string|Array<object>} behaviors
     */
    ActionsAspect.prototype.registerBehaviors = function (compId, pageId, behaviors) {
        behaviors = _.isString(behaviors) ? JSON.parse(behaviors) : behaviors;

        behaviors = _.map(behaviors, function (behavior) {
            //TargetId is optional, if it is empty, default to current component Id
            return _.assign({}, behavior, {
                pageId: pageId,
                sourceId: compId,
                targetId: behavior && behavior.targetId || compId
            });
        });
        this.unRegisterBehaviors(compId, behaviors, false);
        //this._behaviors = _.reject(this._behaviors, {sourceId: compId});
        this._behaviors = this._behaviors.concat(behaviors);
        this._propagateBehaviorsUpdate(this._behaviors);

    };

    /**
     * Remove registered behaviors per action
     * @param {string} compId
     * @param {string|Array<object>} behaviorsByAction
     * @param {boolean} [updateActions] FOR INTERNAL USE: set to false to suppress updating registered actions by this change
     */
    ActionsAspect.prototype.unRegisterBehaviors = function (compId, behaviorsByAction, updateActions) {
        updateActions = updateActions !== false;
        _.forEach(behaviorsByAction, function (behavior) {
            this._behaviors = _.reject(this._behaviors, {
                sourceId: compId,
                action: behavior && behavior.action,
                name: behavior && behavior.name
            });
        }, this);
        if (updateActions) {
            this._propagateBehaviorsUpdate(this._behaviors);
        }
    };

    /**
     * Reset all registered behaviors
     */
    ActionsAspect.prototype.resetBehaviorsRegistration = function () {
        this._previouslyRegisteredPages = [];
        this._behaviors = [];
        this._propagateBehaviorsUpdate(this._behaviors);
    };

    /**
     * TODO: this is temporary until pageTransition will become a real action
     * Register the next page transition. used by pageGroup when changing pages
     * @param {ReactCompositeComponent} pageGroup
     * @param {string} previousPage
     * @param {string} currentPage
     * @param {string} transitionName
     * @param {number} duration
     * @param {number} delay
     * @param {object|function} [params]
     * @param {object} [callbacks]
     */
    ActionsAspect.prototype.registerNextPageTransition = function (pageGroup, previousPage, currentPage, transitionName, duration, delay, params, callbacks) {
        this._isDuringPageTransition = true;
        this._actions.pageTransition.registerNextPageTransition(pageGroup, previousPage, currentPage, transitionName, duration, delay, params, callbacks);
        this._actions.screenIn.registerPageTransitionDuration(duration);
    };

    ActionsAspect.prototype.registerPageTransitionComplete = function (callback) {
        if (_.isFunction(callback)) {
            this._pageTransitionComplete.push(callback);
        }
    };

    ActionsAspect.prototype.handlePageTransitionComplete = function (prevPageId, currentPageId) {
        this._aspectSiteAPI.endingPageTransition();
        this._isDuringPageTransition = false;
        _.forEach(this._pageTransitionComplete, function (callback) {
            callback(prevPageId, currentPageId);
        });
        this._pageTransitionComplete = [];
        this.handleNavigationComplete();
    };

    function onAddedRootDidLayout(rootIds){
        if (_.some(rootIds, this._siteData.isPopupPage, this._siteData)){
            this.handleNavigationComplete();
        }
    }

    ActionsAspect.prototype.registerNavigationComplete = function (callback) {
        if (_.isFunction(callback)) {
            this._navigationComplete.push(callback);
        }
    };

    ActionsAspect.prototype.handleNavigationComplete = function(){
        if (this._isDuringPageTransition){
            return;
        }

        this._aspectSiteAPI.endingPageTransition();
        _.forEach(this._navigationComplete, function (callback) {
            callback();
        });
        this._navigationComplete = [];
    };


    /**
     * TODO: this is temporary until pageTransition will become a real action
     * Register the next page background transition. used by siteBackground when changing pages.
     * transitionName, duration, delay and params are taken from the page transition
     * @param {ReactCompositeComponent} siteBackground
     * @param {string} previousPageBgRef
     * @param {string} currentPageBgRef
     * @param {object} [callbacks]
     */
    ActionsAspect.prototype.registerNextBGPageTransition = function (siteBackground, previousPageBgRef, currentPageBgRef, callbacks) {
        this._actions.pageTransition.registerNextBGPageTransition(siteBackground, previousPageBgRef, currentPageBgRef, callbacks);
    };

    /**
     * TODO: this is temporary until pageTransition will become a real action
     * Set a page initial scroll data. Used in page transition.
     * @param {string} pageScrollData
     */
    ActionsAspect.prototype.registerNextAnchorScroll = function (pageScrollData) {
        this._actions.pageTransition.registerNextAnchorScroll(pageScrollData);
    };


    ActionsAspect.prototype.registerComponentsExit = function (leavingCompIds, callback) {
        this._actions.exit.registerComponentsExit(leavingCompIds, callback);
    };
    /**
     * Create an save an instance for an action
     * @param {function} ActionConstructor
     * @private
     */
    ActionsAspect.prototype.registerAction = function (ActionConstructor) {
        var action = new ActionConstructor(this._aspectSiteAPI);
        var actionNames = [].concat(action.ACTION_NAME);

        _.forEach(actionNames, function (actionName) {
            if (this._actions[actionName]) {
                throw new Error('Action ' + actionName + ' already registered');
            }

            if (!actionName) {
                throw new Error('Action missing it\'s ACTION_NAME parameter, cannot register it');
            }

            this._actions[actionName] = action;
        }, this);
    };

    /**
     * Inform all registered actions that a trigger popped
     * @param triggerType
     * @private
     */
    ActionsAspect.prototype._propagateTrigger = function (triggerType) {
        var triggerArgs = arguments;
        _.forEach(this._actions, function (action) {
            if (_.includes(action.ACTION_TRIGGERS, triggerType)) {
                action.handleTrigger.apply(action, triggerArgs);
            }
        });
    };


    /**
     * Inform all registered actions about a page change
     * @param triggerType
     * @private
     */
    ActionsAspect.prototype._propagatePageChangeTriggerAfterLayout = function () {
        if (this._didPageChange || !this._didFirstLayout) {
            var siteData = this._aspectSiteAPI.getSiteData();
            var primaryPageInfo = siteData.getExistingRootNavigationInfo(siteData.getPrimaryPageId());
            var isPageAllowed = this._aspectSiteAPI.getSiteAspect('siteMembers').isPageAllowed(primaryPageInfo);

            if (isPageAllowed) {
                this._propagateTrigger(triggerTypes.PAGE_CHANGED);
            }
        }
        this._didPageChange = false;
        this._propagateTrigger(triggerTypes.DID_LAYOUT);

    };

    ActionsAspect.prototype._enablePageChangeTransitionsAfterLayout = function () {
        if (!this._didFirstLayout){
            this._didFirstLayout = true;
        } else {
            this._didPageChange = true;
        }
    };

    ActionsAspect.prototype.reloadPageAnimations = function () {
        this._propagateTrigger(triggerTypes.PAGE_RELOADED);
    };

    /**
     * Update behaviors list in registered actions
     * @param behaviors
     * @private
     */
    ActionsAspect.prototype._propagateBehaviorsUpdate = function (behaviors) {
        _.forEach(this._actions, function (action) {
            action.handleBehaviorsUpdate(_.cloneDeep(behaviors));
        });
    };

    /**
     * Register triggers for all registered actions
     * @private
     */
    ActionsAspect.prototype._registerTriggers = function () {
        this._aspectSiteAPI.registerToSiteReady(this._propagateTrigger.bind(this, triggerTypes.SITE_READY));
        this.registerPageTransitionComplete(this._propagateTrigger.bind(this, triggerTypes.TRANSITION_ENDED));
        this._aspectSiteAPI.registerToUrlPageChange(this._enablePageChangeTransitionsAfterLayout.bind(this));

        this._aspectSiteAPI.registerToSiteReady(this._enablePageChangeTransitionsAfterLayout.bind(this));
        this._aspectSiteAPI.registerToDidLayout(this._propagatePageChangeTriggerAfterLayout.bind(this));
        this._aspectSiteAPI.registerToScroll(this._propagateTrigger.bind(this, triggerTypes.SCROLL));
        this._aspectSiteAPI.registerToResize(this._propagateTrigger.bind(this, triggerTypes.RESIZE));
        if (experiment.isOpen('sv_hoverBox')) {
            this._aspectSiteAPI.registerToModeChange(this._propagateTrigger.bind(this, triggerTypes.MODE_CHANGED_INIT));
            this._aspectSiteAPI.registerToModeChange(this._propagateTrigger.bind(this, triggerTypes.MODE_CHANGED_EXECUTE));
        }
    };

    ActionsAspect.prototype.actionsRemoved = function(actionsRemoved) {
        this._propagateTrigger(triggerTypes.ACTIONS_REMOVED, actionsRemoved);
    };

    ActionsAspect.prototype.actionsAddedLayouted = function (addedActions) {
        this._propagateTrigger(triggerTypes.ACTIONS_ADDED_LAYOUTED, addedActions);

    };

    siteAspectsRegistry.registerSiteAspect('actionsAspect', ActionsAspect);

    /**
     * Behaviors are saved as a collection of objects
     * for each target id an array of the following:
     * @typedef  {{}} SavedBehavior
     * @property {string}  action   - Name of the action to play (@example 'screenIn')
     * @property {string}  targetId - Id of the component the action is applied on
     * @property {string}  name     - Name of the behavior (@example 'FadeIn')
     * @property {boolean} playOnce - Should this behavior play only once in this session (site lifecycle)
     * @property {number}  duration - The duration of the action in seconds (For animations mostly)
     * @property {number}  delay    - The time to wait before applying this behavior (For animations mostly)
     * @property {object}  params   - Extra params for this behavior
     */

    /**
     * Parsed behaviors are identical to saved behaviors just with pageId and sourceId.
     * @typedef  {object} ParsedBehavior
     * @property {string}  action   - Name of the action to play (@example 'screenIn')
     * @property {string}  pageId   - Id of the page the component is in
     * @property {string}  sourceId - Id of the component applying the action
     * @property {string}  targetId - Id of the component the action is applied on
     * @property {string}  name     - Name of the behavior (@example 'FadeIn')
     * @property {boolean} playOnce - Should this behavior play only once in this session (site lifecycle)
     * @property {number}  duration - The duration of the action in seconds (For animations mostly)
     * @property {number}  delay    - The time to wait before applying this behavior (For animations mostly)
     * @property {object}  params   - Extra params for this behavior
     */

});
