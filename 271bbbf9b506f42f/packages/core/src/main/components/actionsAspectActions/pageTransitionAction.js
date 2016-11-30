define([
    'lodash',
    'animations',
    'utils',
    'core/components/actionsAspectActions/triggerTypesConsts'
], function (_, animations, utils, triggerTypes) {
    "use strict";

    /**
     * Page Transition Action Constructor
     * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
     * @param {Array<ParsedBehavior>} behaviors
     * @constructor
     */
    function PageTransitionAction(aspectSiteAPI, behaviors) {
        /** @type {core.SiteAspectsSiteAPI} */
        this._aspectSiteAPI = aspectSiteAPI;
        this._siteData = aspectSiteAPI.getSiteData();
        this._behaviors = behaviors;
        // TODO: https://jira.wixpress.com/browse/SE-13884, we need to add a way for aspects to be loaded async, sometimes we get here and this._anchorAspect is null.

        this._isEnabled = false;

        this._nextPageTransition = {};
        this._nextPageBGTransition = {};
        this._nextPageInitialScrollData = null;
    }

    _.assign(PageTransitionAction.prototype, {
        ACTION_TRIGGERS: [triggerTypes.PAGE_CHANGED],
        ACTION_NAME: 'pageTransition',

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
         * Enable this action
         */
        enableAction: function () {
            this._isEnabled = true;
        },

        /**
         * Disable this action
         */
        disableAction: function () {
            this._isEnabled = false;
        },

        isEnabled: function() {
            return this._isEnabled;
        },

        /**
         * Execute this action
         */
        executeAction: function () {

            this.executeTransitions(this._nextPageTransition, this._nextPageBGTransition, this._nextPageInitialScrollData);

            this._nextPageTransition = {};
            this._nextPageBGTransition = {};
            this._nextPageInitialScrollData = null;

        },

        /**
         * Handle triggers sent from actionsAspect
         * @param {string} triggerType
         */
        handleTrigger: function (triggerType) {
            if (!this._isEnabled && !_.isEmpty(this._nextPageTransition)) {
                this._nextPageTransition.duration = 0;
                this._nextPageTransition.transitionName = 'NoTransition';
            }

            if (triggerType === triggerTypes.PAGE_CHANGED) {
                this.executeAction();
            }
        },

        /**
         * Handle updates to the behaviors list by actionsAspect
         * @param {array<ParsedBehavior>} behaviors
         */
        handleBehaviorsUpdate: function (behaviors) {
            //Stub, we don't really use behaviors now.
            this._behaviors = behaviors;
        },

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
        registerNextPageTransition: function (pageGroup, previousPage, currentPage, transitionName, duration, delay, params, callbacks) {
            this._nextPageTransition = {
                comp: pageGroup, previousRef: previousPage, currentRef: currentPage, transitionName: transitionName,
                duration: duration, delay: delay, params: params, callbacks: callbacks
            };
        },

        /**
         * TODO: this is temporary until pageTransition will become a real action
         * Register the next page background transition. used by siteBackground when changing pages.
         * transitionName, duration, delay and params are taken from the page transition
         * @param {ReactCompositeComponent} siteBackground
         * @param {string} previousPageBgRef
         * @param {string} currentPageBgRef
         * @param {object} [callbacks]
         */
        registerNextBGPageTransition: function (siteBackground, previousPageBgRef, currentPageBgRef, callbacks) {
            this._nextPageBGTransition = {
                comp: siteBackground,
                previousRef: previousPageBgRef,
                currentRef: currentPageBgRef,
                callbacks: callbacks
            };
        },

        /**
         * TODO: this is temporary until pageTransition will become a real action
         * Set a page initial scroll data. Used in page transition.
         * @param {string} pageScrollData
         */
        registerNextAnchorScroll: function (pageScrollData) {
            this._nextPageInitialScrollData = pageScrollData;
        },


        /**
         * Adjust duration for animations that use width or height to be relative to the animation path.
         * NOTE: Maximum duration is set to 1.2 seconds inside this function.
         * @param {number} duration
         * @param {object} params
         * @returns {number}
         */
        getNormalizedTransitionDuration: function (duration, params) {
            params = params || {};

            var maxDuration = 1.2;
            var normalizedDuration = duration;

            if (params.width) {
                normalizedDuration = duration * params.width / params.siteWidth;
            } else if (params.height) {
                normalizedDuration = duration * (Math.max(params.height, params.screenHeight) / params.screenHeight);
            }

            return Math.min(normalizedDuration, maxDuration);
        },

        /**
         * Do the actual transition of page, bg and scroll to anchor
         * @param {core.SiteAspectsSiteAPI} siteAPI
         * @param {object} pageTransition
         * @param {object} bgTransition
         * @param {object} pageScrollData
         */
        executeTransitions: function (pageTransition, bgTransition, pageScrollData) {
            var siteAPI = this._aspectSiteAPI;
            var params = typeof pageTransition.params === 'function' ? pageTransition.params() : pageTransition.params;
            var duration = this.getNormalizedTransitionDuration(pageTransition.duration || 0, params);
            var pageSequence, pageCallbacks;

            if (!_.isEmpty(pageTransition)) {
                pageSequence = pageTransition.comp.sequence();
                pageCallbacks = pageTransition.callbacks || {};

                if (pageCallbacks.onStart) {
                    pageSequence.onStartAll(pageCallbacks.onStart);
                }
                if (pageCallbacks.onInterrupt) {
                    pageSequence.onInterruptAll(pageCallbacks.onInterrupt);
                }
                if (pageCallbacks.onComplete) {
                    pageSequence.onCompleteAll(pageCallbacks.onComplete);
                }

                var pages = {sourceRefs: pageTransition.previousRef, destRefs: pageTransition.currentRef};
                pageSequence
                    .add(pages, pageTransition.transitionName, duration, pageTransition.delay, params)
                    .add([pageTransition.previousRef, pageTransition.currentRef], 'BaseClear', 0, 0, {
                        props: 'opacity,x,y',
                        immediateRender: false
                    })
                    .execute();
            }

            if (!_.isEmpty(bgTransition)) {
                bgTransition.comp.transition(bgTransition.previousRef, bgTransition.currentRef,
                    pageTransition.transitionName, duration, pageTransition.delay, params,
                    bgTransition.callbacks);
            }

//TODO: this is a solution to the horizontal scrollbar, should i use it?
//        if (!_.isEmpty(bgTransition) || !_.isEmpty(pageTransition)) {
//            var rootNode = siteAPI.getSiteRoot().getDOMNode();
//            rootNode.style.overflowX = 'hidden';
//            animations.animate('BaseClear', rootNode, 0, duration, {props: 'overflow-x', immediateRender: false});
//        }
            var siteData = siteAPI.getSiteData();
            var anchorPosition = utils.scrollAnchors.calcAnchorScrollToPosition(pageScrollData, siteAPI);
            pageScrollData = anchorPosition.anchorQuery;

            animations.animate('BaseScroll', siteAPI.getSiteContainer(), duration, pageTransition.delay,
                {x: anchorPosition.x || 0, y: anchorPosition.y || 0, callbacks: {
                    onComplete: function(){
                        //this fixes https://jira.wixpress.com/browse/SE-13884, but should be done better.
                        var anchorAspect = this._aspectSiteAPI.getSiteAspect('anchorChangeEvent');
                        if (anchorAspect) {
                            anchorAspect.setSelectedAnchorAsync(siteData, pageScrollData, siteData.getPrimaryPageId(), utils.constants.ACTIVE_ANCHOR.DELAY_TO_END_SCROLL);
                        }
                    }.bind(this)
                }});
        }

    });

    /**
     * @class PageTransitionAction
     */
    return PageTransitionAction;
});
