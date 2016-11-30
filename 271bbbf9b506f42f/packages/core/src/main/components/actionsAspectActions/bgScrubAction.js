define([
    'lodash',
    'animations',
    'utils',
    'core/components/actionsAspectActions/triggerTypesConsts',
    'experiment'
], function (_, animations, utils, triggerTypes, experiment) {
    "use strict";

    var balataConsts = utils.balataConsts;

    var elementPathsByBehavior = {
        BackgroundParallax: [balataConsts.BALATA, balataConsts.MEDIA],
        BackgroundReveal: [balataConsts.BALATA, balataConsts.MEDIA],
        BackgroundZoom: [balataConsts.BALATA, balataConsts.MEDIA],
        BackgroundFadeIn: [balataConsts.BALATA],
        BackgroundBlurIn: [balataConsts.BALATA, balataConsts.MEDIA],
        SiteBackgroundParallax: []

    };

    /**
     * Constructor for action, starts disabled.
     * @param aspectSiteAPI
     * @constructor
     */
    function BgScrubAction(aspectSiteAPI) {
        this._aspectSiteAPI = aspectSiteAPI;
        this._siteData = aspectSiteAPI.getSiteData();
        this._behaviors = [];
        this._isEnabled = false;
        this._animateOnNextTick = false;
        /** @type {Array<{compId: string, parentId:string, sequenceId:string}>} */
        this._liveSequenceIds = [];
        this._currentPageBehaviors = [];
        this._behaviorsUpdated = false;
        this._viewportHeightUpdated = false;
    }

    BgScrubAction.prototype = _.create(Object.prototype, {
        constructor: BgScrubAction,
        ACTION_TRIGGERS: [
            triggerTypes.PAGE_CHANGED,
            triggerTypes.PAGE_RELOADED,
            triggerTypes.TRANSITION_ENDED,
            triggerTypes.SCROLL,
            triggerTypes.RESIZE
        ],
        ACTION_NAME: 'bgScrub',
        _currentScroll: {x: 0, y: 0},
        _currentPopupScroll: {x:0, y:0},

        /**
         * If this returns false, we shouldn't enable this action.
         * @returns {boolean}
         */
        shouldEnable: function () {
            var isBrowser = typeof window !== 'undefined';
            var isTablet = this._siteData.isTabletDevice();
            var isMobile = this._siteData.isMobileDevice();
            var isMobileView = this._siteData.isMobileView();

            return isBrowser && !isTablet && !isMobile && !isMobileView;
        },

        /**
         * Enable ScreenIn Action
         * - Register current page behaviors
         * - hide all elements with 'hideOnStart' on their animation
         * - Start querying if animation should run on each tick
         */
        enableAction: function () {
            if (this._isEnabled) {
                return;
            }

            this.initiateBehaviors();

            this._tickerCallback = this._executeActionOnTick.bind(this);
            animations.addTickerEvent(this._tickerCallback);

            this._isEnabled = true;
        },

        /**
         * Disable ScreenIn Action
         * - Stop the ticker listener
         * - Stop and clear all running sequences
         * - un-hide all hidden elements  with 'hideOnStart' on their animation
         * - reset playedOnce list and lastVisitedPage state
         */
        disableAction: function () {
            if (!this._isEnabled) {
                return;
            }

            this._animateOnNextTick = false;

            animations.removeTickerEvent(this._tickerCallback);
            this._tickerCallback = null;

            this.stopAndClearAnimations();
            this._currentPageBehaviors = [];
            this._isEnabled = false;
        },

        isEnabled: function () {
            return this._isEnabled;
        },

        /**
         * Execute the action
         */
        executeAction: function () {
            if (_.isEmpty(this._currentPageBehaviors)) {
                return;
            }
            this.setAnimationsProgress();
        },

        setSequenceProgress: function (entry, scrollPercentage, parent) {
            var sequence = parent.getSequence(entry.sequenceId);
            if (sequence) {
                sequence.progress(scrollPercentage);
            } else {
                utils.log.error('sequence id %s returned no sequence', entry.sequenceId);
            }
        },

        /**
         * This is the main function of this action:
         * Runs through all existing animations and changes their progress
         */
        setAnimationsProgress: function () {
            var currentScroll = Math.max(this._currentScroll.y, 0);

            _.forEach(this._liveSequenceIds, function (entry) {
                if (this.isComponentInViewport(entry.compId, entry.parentId)) {
                    var currentTravelPosition = this._viewportHeight + currentScroll - entry.componentTop;
                    var progress = currentTravelPosition / entry.maxTravel;

                    this.setSequenceProgress(entry, progress, this.getComponentParent(entry.parentId));
                }
            }, this);
        },

        /**
         *
         * @param compId
         * @returns {{componentHeight: *, componentTop: *, offsetPosition: number}}
         */
        getComponentMeasure: function (compId){
            var measureMap = this._siteData.measureMap || {};
            var componentHeight = _.get(measureMap, ['height', compId], 0);
            var componentTop = _.get(measureMap, ['absoluteTop', compId], 0);
            return {
                height: componentHeight,
                top: componentTop
            };
        },

        /**
         * stores the siteHeight and the viewport height
         */
        setSiteMeasure: function (){
            //var measureMap = this._siteData.measureMap || {};
            this._viewportHeight = this._siteData.getScreenHeight(); //_.get(measureMap, ['height', 'screen'], 0);
            this._siteHeight = this.getSiteHeight();
        },


        /**
         * Collect all behaviors for this action and initiate hiding components that their animations demands hiding
         */
        initiateBehaviors: function () {
            this._currentPageBehaviors = this.getCurrentPageBehaviors(this._behaviors, this._siteData.getPrimaryPageId());
        },

        /**
         * @override
         * Handle siteBackground as a page
         *
         * @param {String} parentId
         * @returns {ReactCompositeComponent}
         */
        getComponentParent: function (parentId) {
            var parent;
            if (parentId === 'masterPage') {
                parent = this._aspectSiteAPI.getMasterPage();
            } else if (parentId === 'siteBackground') {
                parent = this._aspectSiteAPI.getComponentById('SITE_BACKGROUND');
            } else {
                parent = this._aspectSiteAPI.getCurrentPage();
            }
            return parent;
        },


        /**
         * Test if a component is in the viewport
         * "In viewport" mans that either the top position of the component is in screen bounds,
         * or bottom of component is in screen bounds
         * or bottom is under the screen and top is above the screen, meaning the component "wraps" the viewport
         * @param {string} compId
         * @returns {boolean}
         */
        isComponentInViewport: function (compId, parentId) {
            if (utils.viewportUtils.isAlwaysInViewport(this._aspectSiteAPI, parentId)) {
                return true;
            }
            var currScroll = this._currentScroll;

            var popupId = this._aspectSiteAPI.getCurrentPopupId();
            if (popupId && popupId === this._aspectSiteAPI.getRootOfComponentId(compId)) {
                currScroll = this._currentPopupScroll;
            }

            return utils.viewportUtils.isInViewport(this._aspectSiteAPI, currScroll, compId);
        },

        /**
         * Return some parameters that are specific to this action:
         * suppressReactRendering = false: Don't tell react to stop updaing the component while animation is running
         * forgetSequenceOnComplete = false: Don't remove the animation from the running animations queue when it reaches its end.
         * paused = true: Start the animations paused so they can be scrubbed
         * @returns {{suppressReactRendering: boolean, forgetSequenceOnComplete: boolean, paused: boolean}}
         */
        getSequenceParams: function () {
            return {
                suppressReactRendering: false,
                forgetSequenceOnComplete: false,
                paused: true
            };
        },

        /**
         * @override
         * This override will also looks for children of siteBackground
         *
         * Return a filtered list of actions of this page and masterPage only, indexed by targetId
         * @param {Array<ParsedBehavior>} behaviors
         * @param {string} pageId
         * @returns {object}
         */
        getCurrentPageBehaviors: function (behaviors, pageId) {
            return _.filter(behaviors, function (behavior) {
                return (behavior.action === this.ACTION_NAME &&
                (behavior.pageId === pageId || behavior.pageId === 'masterPage' || behavior.pageId === 'siteBackground'));
            }, this);
        },

        /**
         * Create the parallax sequences
         */
        createSequences: function () {
            var shouldDisableSmoothScrolling = false;
            this._liveSequenceIds = _.map(this._currentPageBehaviors, function (behavior) {
                var mediaPath;
                var isSiteBackground = (behavior.pageId === 'siteBackground');
                var parent = this.getComponentParent(behavior.pageId);
                var sequence = parent.sequence();

                var componentMeasure = this.getComponentMeasure(behavior.targetId);

                var properties = animations.getProperties(behavior.name);
                var getMaxTravel = properties.getMaxTravel || _.noop;
                var maxTravel = getMaxTravel(componentMeasure, this._viewportHeight, this._siteHeight) || this._viewportHeight;

                var params = behavior.params || {};
                params.browserFlags = this._siteData.browserFlags();
                params.componentTop = componentMeasure.top;
                params.componentHeight = componentMeasure.height;
                params.viewPortHeight = this._viewportHeight;

                mediaPath = [[behavior.targetId].concat(elementPathsByBehavior[behavior.name])];
                sequence.add(mediaPath, behavior.name, behavior.duration, behavior.delay, params);

                shouldDisableSmoothScrolling = properties.shouldDisableSmoothScrolling || shouldDisableSmoothScrolling;

                var sequenceId = sequence.execute(this.getSequenceParams());

                return {
                    path: mediaPath,
                    compId: behavior.targetId,
                    parentId: behavior.pageId,
                    behaviorName: behavior.name,
                    componentTop: (isSiteBackground) ? this._viewportHeight : componentMeasure.top,
                    componentHeight: componentMeasure.height,
                    maxTravel: maxTravel,
                    sequenceId: sequenceId
                };
            }, this);
            if (experiment.isOpen('DisableSmoothScrolling')) {
                 if (shouldDisableSmoothScrolling && this._siteData.browserFlags().shouldDisableSmoothScrolling) {
                     var mouseWheelAspect = this._aspectSiteAPI.getSiteAspect('mouseWheelOverride');
                     mouseWheelAspect.overrideMouseWheel();
                }
            }
        },
        /**
         * @override
         * Added the ability to refresh the animations list if the behaviors list was changed
         * Also passing 0 to clear animations so it will seek to beginning of animation and not end
         *
         * Handle triggers passed from actionsAspect
         * @param {ActionsTriggerTypes} triggerType
         */
        handleTrigger: function (triggerType) {
            if (!this._isEnabled) {
                return;
            }

            this._currentScroll = this._aspectSiteAPI.getSiteScroll();
            this._currentPopupScroll = this._aspectSiteAPI.getCurrentPopupScroll();

            switch (triggerType) {
                case triggerTypes.PAGE_CHANGED:
                case triggerTypes.TRANSITION_ENDED:
                    this.clearAllAndReload(0);
                    this._animateOnNextTick = true;
                    this._behaviorsUpdated = false;
                    break;
                case triggerTypes.PAGE_RELOADED:
                case triggerTypes.SCROLL:
                case triggerTypes.RESIZE:
                    if (this._behaviorsUpdated || this._viewportHeightUpdated) {
                        this.clearAllAndReload(0);
                        this._behaviorsUpdated = false;
                        this._viewportHeightUpdated = false;
                    }
                    this._animateOnNextTick = true;
                    break;
            }
        },

        /**
         * poll if a window size has changed and force a synthetic resize event if it had
         * @private
         */
        _shouldForceResizeEvent: function () {
            if (this._siteData.getScreenHeight() !== this._viewportHeight) {
                this._viewportHeight = this._siteData.getScreenHeight();
                this._viewportHeightUpdated = true;
                this.handleTrigger(triggerTypes.RESIZE);
            }
        },

        /**
         * Execute the action only if it is scheduled to run on next tick
         * @private
         */
        _executeActionOnTick: function () {
            this._shouldForceResizeEvent();
            if (!this._animateOnNextTick) {
                return;
            }

            this.executeAction();
            this._animateOnNextTick = false;
        },

        /**
         * A shorthand to refresh the entire action state
         * @param {number} [seek]
         */
        clearAllAndReload: function (seek) {
            this.stopAndClearAnimations(seek);
            this.initiateBehaviors();
            this.setSiteMeasure();
            this.createSequences();
        },

        /**
         * Stop and clear all sequences previously created by this action
         * @param {number} [seek]
         */
        stopAndClearAnimations: function (seek) {
            var mouseWheelAspect = this._aspectSiteAPI.getSiteAspect('mouseWheelOverride');
            if (mouseWheelAspect && mouseWheelAspect.releaseMouseWheel) {
                mouseWheelAspect.releaseMouseWheel();
            }
            seek = _.isNumber(seek) ? seek : 1;
            _.forEach(this._liveSequenceIds, function (entry) {
                var parent = this.getComponentParent(entry.parentId);
                if (parent.getSequence(entry.sequenceId)) {
                    parent.stopSequence(entry.sequenceId, seek);
                    //parent.animate(entry.path, 'BaseClear', 0, 0, {props: 'perspective, transform, WebkitFilter, filter'});
                }
            }, this);
            this._liveSequenceIds = [];
        },

        /**
         * @override
         * Update animations on every behavior update,
         * so the action could also work while in editor mode.
         *
         * Handle updates of behaviors list by actionsAspect
         * @param {Array<ParsedBehavior>} behaviors
         */
        handleBehaviorsUpdate: function (behaviors) {
            this._behaviors = behaviors;
            this._behaviorsUpdated = true;
        },

        getSiteHeight: function () {
            var siteAPI = this._aspectSiteAPI;
            var measureMap = siteAPI.getSiteData().measureMap || {};
            var renderFlags = this._siteData.renderFlags; //For editor.
            var siteHeight = _.get(measureMap, 'height.masterPage', 0) + (measureMap.siteMarginBottom || 0) + (renderFlags.extraSiteHeight || 0);
            return siteHeight;
        }
    });

    return BgScrubAction;
});
