/** @class wysiwyg.viewer.managers.actions.PageInAction */
define.Class('wysiwyg.viewer.managers.actions.PageInAction', function(classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('wysiwyg.viewer.managers.actions.base.BaseAction');

    def.resources(['W.Viewer', 'W.Commands', 'W.Config', 'W.Utils']);

    def.binds(['_onTickEvent', '_onPageTransitionStart', '_onPageTransitionComplete']);

    def.fields({
        /** Global list of data about animations to play for all target components */
        _siteTargetsPlayData: [],
        /** List of ids of target components with animations to be played on current page and masterpage */
        _pageTargetsToPlay: [],
        /** Default value for running animations on PageTransitionStart or PageTransitionComplete */
        _defaultWaitForPageTransition: true,
        /** Default value for hiding an element before animating it */
        _defaultHideOnStart: false,
        /** Default value for tick event listener flag */
        _animateOnTickEvent: false
    });

    def.methods({
        initialize: function(animations) {
            this.parent();
            this._animations = animations;
            this.resources.W.Commands.registerCommandListenerByName('WViewerCommands.PageTransitionComplete', this, this._onPageTransitionComplete);
            this.resources.W.Commands.registerCommandListenerByName('WViewerCommands.PageTransitionStart', this, this._onPageTransitionStart);
            this.resources.W.Commands.registerCommandListenerByName('WPreviewCommands.ViewerStateChanged', this, this._onViewerStateChanged);
            this.resources.W.Commands.registerCommandListenerByName('WPreviewCommands.WEditModeChanged', this, this._onEditModeChanged);
            this.resources.W.Commands.registerCommandListenerByName('WPreviewCommands.FeedbackQuickTourEnded', this, this._onFeedbackQuickTourEnded);
            this.resources.W.Commands.registerCommandListenerByName('WViewerCommands.PageChangeRequested', this, this._onPageChange);
        },

        /**
         * @override
         * Hide animated elements if needed
         * @param behaviors
         */
        addBehaviors: function(behaviors) {
            this.parent(behaviors);
            if (this._isPublic) {
                _.forEach(behaviors, function(behavior) {
                    this._hideSingleElement(behavior.targetId, behavior.name);
                }, this);
            }
        },

        /**
         * Adds 3 event listeners
         * 1. Window Scroll listener
         * 2. Window Resize listener
         * 3. Animation Ticker
         * @private
         */
        _addListeners: function() {
            this._animations.addTickerEvent(this._onTickEvent);
        },

        /**
         * Removes the event listeners
         * 1. Window Scroll listener
         * 2. Window Resize listener
         * 3. Animation Ticker
         * @private
         */
        _removeListeners: function() {
            this._animations.removeTickerEvent(this._onTickEvent);
        },

        /**
         * Operations to run when changing a page
         * Hide next page when moving between pages
         * If fromPageId is undefined this means we are on page load, so in editor skip hiding.
         * @param {String} params.pageId
         * @param {String} params.fromPageId
         * @private
         */
        _onPageChange: function(params) {
            if (!params.fromPageId && this.resources.W.Config.env.$isEditorViewerFrame) {
                return;
            }

            if (params.fromPageId) {
                this._clearAnimations(params.fromPageId);
            }

            if (params.pageId) {
                this._hideElements(params.pageId);
                this._hideElements('master');
            }

        },

        /**
         * Handler of pageTransitionStart
         * - Resets all animations on page
         * - Populates all animation information for this page
         * - Starts the listeners for running animations on scroll etc.
         * @param {String} params.pageId
         * @param {String} [params.fromPageId]
         * @private
         */
        _onPageTransitionStart: function(params) {
            if (this._getCurrentPageId() !== params.pageId || !this._animations.isReady()) {
                return;
            }

            //Do nothing in Editor
            if (this.resources.W.Config.env.$editorMode !== 'PREVIEW') {
                return;
            }

            // reset page targets to animate
            this._resetPageTargetsToPlay();

            // populate site targets  array
            var curPageTargetsIds = this.getCurrentPageTargetsIds();
            this._populateSiteTargetsPlayData(curPageTargetsIds);

            // populate page targets to animate
            this._populatePageTargetsToPlay(curPageTargetsIds, {
                isPageTransitionEnd: false
            });

            this._startAnimationEvents();
        },

        /**
         * Handler of pageTransitionComplete
         * - Resets all animations on page
         * - Populates all animation information for this page
         * - Starts the listeners for running animations on scroll etc.
         * @param {String} params.pageId
         * @param {String} [params.fromPageId]
         * @private
         */
        _onPageTransitionComplete: function(params) {
            if (this._getCurrentPageId() !== params.pageId || !this._animations.isReady()) {
                return;
            }

            //Do nothing in Editor
            if (this.resources.W.Config.env.$editorMode !== 'PREVIEW') {

                return;
            }

            // populate site targets  array
            var curPageTargetsIds = this.getCurrentPageTargetsIds();
            this._populateSiteTargetsPlayData(curPageTargetsIds);

            // populate page targets to animate
            this._populatePageTargetsToPlay(curPageTargetsIds, {
                isPageTransitionEnd: true
            });

            this._startAnimationEvents();
        },

        /**
         * Populate the global animation data list from behaviors on targets with passed ids
         * @param {Array<String>} targetsIds
         * @private
         */
        _populateSiteTargetsPlayData: function(targetsIds) {
            // populate site targets animation play info

            _.forEach(targetsIds, function(targetId) {
                var isPlayOnce;
                if (!this._siteTargetsPlayData[targetId]) {
                    isPlayOnce = this._getIsPlayOnceByTargetId(targetId);
                    this._siteTargetsPlayData[targetId] = {
                        isPlayed: false,
                        isPlayOnce: isPlayOnce
                    };
                }
            }, this);

        },

        /**
         * Populate the list of ids of target components to be played on current page
         * @param {Array<String>} targetsIds
         * @param {boolean} params.isPageTransitionEnd
         * @private
         */
        _populatePageTargetsToPlay: function(targetsIds, params) {
            // populate page targets to animate
            var i, targetsLen, targetId, isAnimateOnPageTransitionEnd;

            for (i = 0, targetsLen = targetsIds.length; i < targetsLen; i++) {
                // check if to add new
                targetId = targetsIds[i];
                isAnimateOnPageTransitionEnd = this._isAnimateOnPageTransitionEnd(targetId);

                if (isAnimateOnPageTransitionEnd === params.isPageTransitionEnd) {
                    if (this._siteTargetsPlayData[targetId].isPlayOnce) {
                        // animation should be played only once - add only if not already played
                        if (!this._siteTargetsPlayData[targetId].isPlayed) {
                            this._pageTargetsToPlay.push(targetId);
                        }
                    }
                    else {
                        // animation should be re-played on each page - always add
                        this._pageTargetsToPlay.push(targetId);
                    }
                }
            }
        },

        /**
         * Initiate the listeners
         * @private
         */
        _startAnimationEvents: function() {
            this._animateOnTickEvent = true;

            if (this._isTargetsToAnimate()) {
                this._addListeners();
            }
        },

        /**
         * Get the "playOnce" state of a target component
         * If at least one of the behaviors is defined as play once, return true
         * NOTE: If the component is in masterpage, always return true (force play only once)
         * @param {String} targetId
         * @returns {boolean}
         * @private
         */
        _getIsPlayOnceByTargetId: function(targetId) {
            var isPlayOnce;
            if (this.getPageIdByTargetId(targetId) === 'master') {
                isPlayOnce = true;
            }
            else {
                isPlayOnce = _.some(this.getBehaviorsByTargetId(targetId), 'playOnce');
            }
            return isPlayOnce;
        },

        /**
         * Returns whether target component with passed id should start animating on pageTransitionStart or pageTransitionComplete
         * @param {String} targetId
         * @returns {boolean}
         * @private
         */
        _isAnimateOnPageTransitionEnd: function(targetId) {
            var animations = this._getAnimationsByTargetId(targetId);
            var isAnimateOnTransitionEnd = this._defaultWaitForPageTransition;

            _.forEach(animations, function(animation) {
                if (animation.options) {
                    if (typeof animation.options.waitForPageTransition !== 'undefined') {
                        isAnimateOnTransitionEnd = animation.options.waitForPageTransition;
                    }
                }
                return isAnimateOnTransitionEnd;
            });

            return isAnimateOnTransitionEnd;
        },

        /**
         * Handle the tick event
         * - Animate!
         * @private
         */
        _onTickEvent: function() {
            if (!this._animateOnTickEvent) {
                return;
            }

            // do not animate until next tick event
            this._animateOnTickEvent = false;

            // animate targets
            this._animateTargets();

            // check if more targets should animate
            if (!this._isTargetsToAnimate()) {
                this._removeListeners();
            }
        },

        /**
         * Build and run the the animations
         * Empty the _pageTargetsToPlay while animating, and stop when it is empty.
         * @private
         */
        _animateTargets: function() {
            if (!this._isTargetsToAnimate()) {
                return;
            }

            // iteriate targets
            var i = this._pageTargetsToPlay.length;
            while (i--) {
                var targetId = this._pageTargetsToPlay[i];

                // check if target is within view port and is not already animating
                if (!this._isTweening(targetId)) {
                    // fetch all animations on target and play
                    _.forEach(this.getBehaviorsByTargetId(targetId),
                        function(behavior) {
                            // play animation
                            var params = behavior.params || {};
                            var domElement = this._getDomElementByTargetId(targetId);

                            this._animations.applyTween(
                                behavior.name,
                                domElement,
                                behavior.duration,
                                behavior.delay,
                                _.extend(params, { autoClear: true })
                            );
                        }, this);

                    // set target is played
                    this._siteTargetsPlayData[targetId].isPlayed = true;

                    // delete played target
                    this._pageTargetsToPlay.splice(i, 1);
                }
            }
        },

        _isPlayed: function(targetId) {
            return this._siteTargetsPlayData[targetId] && this._siteTargetsPlayData[targetId].isPlayed;
        },

        _isPlayOnce: function(targetId) {
            return this._siteTargetsPlayData[targetId] && this._siteTargetsPlayData[targetId].isPlayOnce;
        },

        /**
         * Check for playOnce status, and hide element if needed
         * @param {String} targetId
         * @param {String} behaviorName
         * @override
         * @private
         */
        _hideSingleElement: function(targetId, behaviorName) {
            var isPlayed = this._isPlayed(targetId);
            var isPlayOnce = this._isPlayOnce(targetId);

            // check if to hide
            if (isPlayed && isPlayOnce) {
                return;
            }

            var element = this._getDomElementByTargetId(targetId);
            this._animations.hideSingleElement(element, behaviorName);
        },

        _unHideSingleElement: function(targetId) {
            var element = this._getDomElementByTargetId(targetId);
            this._animations.unHideSingleElement(element);
        },

        /**
         * ViewerStateChange event handler
         * @private
         */
        _onViewerStateChanged: function(params) {
            var mode = this.resources.W.Config.env.$editorMode;
            this._resetSiteAnimationDataAndListeners();

            if (mode === 'PREVIEW') {
                if (params.viewerMode === Constants.ViewerTypesParams.TYPES.DESKTOP) {
                    this._simulatePageChange();
                }
            }
        },

        /**
         * EditModeChange event handler
         * @private
         */
        _onEditModeChanged: function(mode) {
            this._resetSiteAnimationDataAndListeners();

            if (mode === 'PREVIEW') {
                this._simulatePageChange();
            }
        },

        /**
         * EditModeChange event handler
         * @private
         */
        _onFeedbackQuickTourEnded: function() {
            this._resetSiteAnimationDataAndListeners();
            this._simulatePageChange();
        },

        /**
         * Reset all animation related information
         * @param {String} pageId
         * @private
         */
        _resetSiteAnimationDataAndListeners: function() {
            this._removeListeners();
            this._resetSiteTargetsPlayData();
            this.clearAllAnimationTargets();
        },

        /**
         * Simulate site load and start animation listeners.
         * @param {String} pageId
         * @private
         */
        _simulatePageChange: function() {
            var pageId = this._getCurrentPageId();
            this.hideCurrentPageAnimationTargets();

            /*
             *  We are using "defer" in order to simulate the "real world" scenario of async start/complete events.
             *  It also solves 2 problems:
             *  1. Fixed components become fixed on edit mode change, in a synchronous world this might happen after we run our events
             *  2. When changing between editor and preview the editor scrolls to 0,0. same problem as #1
             */

            _.defer(this._onPageTransitionStart, { pageId: pageId });
            _.defer(this._onPageTransitionComplete, { pageId: pageId });
        },

        /**
         * Helper function to get current page id
         * @returns {String}
         * @private
         */
        _getCurrentPageId: function() {
            return this.resources.W.Viewer.getCurrentPageId();
        },

        /**
         * Helper function to get DOM Element by target id
         * @param {String} targetId
         * @returns {HTMLElement}
         * @private
         */
        _getDomElementByTargetId: function(targetId) {
            return this.resources.W.Viewer.getCompByID(targetId);
        },

        /**
         * Clear the list of targets to animate in current page
         * @private
         */
        _resetPageTargetsToPlay: function() {
            this._pageTargetsToPlay = [];
        },

        /**
         * Clear the global animation data list
         * @private
         */
        _resetSiteTargetsPlayData: function() {
            this._siteTargetsPlayData = [];
        },

        /**
         * Return whether we have more targets to animate
         * @returns {boolean}
         * @private
         */
        _isTargetsToAnimate: function() {
            return this._pageTargetsToPlay.length > 0;
        },

        /**
         * Get animation definitions by behaviors registered for a target component
         * @param {String} targetId
         * @returns {Array}
         */
        _getAnimationsByTargetId: function(targetId) {
            var behaviors = this.getBehaviorsByTargetId(targetId),
                animations = [];

            _.forEach(behaviors, function(behavior) {
                animations.push(this._animations.getAnimationDefinition(behavior.name));
            }, this);

            return animations;
        },

        _isTweening: function(targetId) {
            var domElement = this._getDomElementByTargetId(targetId);
            return this._animations.isTweening(domElement);
        },

        /**
         * Hide all targets on a page (or masterpage) based on their behavior definitions
         * @param {String} pageId
         * @private
         */
        _hideElements: function(pageId) {
            var behaviors = this.getBehaviorsByPageId(pageId);

            _.forEach(behaviors, function(behavior) {
                this._hideSingleElement(behavior.targetId, behavior.name);
            }, this);
        },
        /**
         * Clear animation from all elements on page and masterpage that are assigned a behavior
         * @param {String} pageId
         * @private
         */
        _clearAnimations: function(pageId) {
            var behaviors = this.getBehaviorsByPageId(pageId);

            _.forEach(behaviors, function(behavior) {
                var element = this._getDomElementByTargetId(behavior.targetId);
                this._animations.clear(element);
            }, this);
        },

        /**
         * unhide elements when removing  behaviors of this action type for a component
         * @param {String} sourceId
         */
        removeComponentBehaviors: function(sourceId) {

            var behaviors = this.getBehaviorsBySourceId(sourceId);

            _.forEach(behaviors, function(behavior) {
                this._unHideSingleElement(behavior.targetId);
            }, this);

            this.parent(sourceId);
        }

    });
});