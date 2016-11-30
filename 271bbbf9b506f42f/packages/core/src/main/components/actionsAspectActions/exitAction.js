/**
 * Created by avim on 12/8/15.
 */
define([
    'lodash',
    'animations',
    'core/components/actionsAspectActions/triggerTypesConsts'
], function (_, animations, triggerTypes) {
    "use strict";

    /**
     * Constructor for Exit action, starts disabled.
     * @param aspectSiteAPI
     * @constructor
     */
    function ExitAction(aspectSiteAPI) {
        this._aspectSiteAPI = aspectSiteAPI;
        this._siteData = aspectSiteAPI.getSiteData();
        this._behaviors = [];
        this._isEnabled = false;
        this._liveSequenceIds = [];
        this._animateOnNextTick = false;
        this._pendingComponentExits = [];
    }

    ExitAction.prototype = _.create(Object.prototype, {
        constructor: ExitAction,
        ACTION_TRIGGERS: [triggerTypes.PAGE_CHANGED, triggerTypes.PAGE_RELOADED],
        ACTION_NAME: 'exit',

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

            this._tickerCallback = this._executeActionOnTick.bind(this);
            animations.addTickerEvent(this._tickerCallback);

            this._isEnabled = true;
        },

        /**
         * Disable exit Action
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

            var callbacks = _.map(this._pendingComponentExits, 'callback');
            this._pendingComponentExits = [];
            this._isEnabled = false;

            _.forEach(callbacks, function(cb){
                cb();
            });
        },

        isEnabled: function() {
            return this._isEnabled;
        },

        /**
         * Execute the action
         */
        executeAction: function () {
            if (_.isEmpty(this._pendingComponentExits)) {
                return;
            }
            var pendingExits = this._pendingComponentExits;
            this._pendingComponentExits = [];
            _.forEach(pendingExits, function (pendingExit) {
                this._liveSequenceIds = this._liveSequenceIds.concat(
                    this.playPageAnimations(pendingExit.leavingCompIds, pendingExit.callback)
                );
            }, this);
        },

        /**
         * Play animations.
         */
        playPageAnimations: function (leavingCompIds, callback) {
            var playedTargets = {};
            var sequences = {};
            var sequenceIds = [];

            var behaviours = _(this._behaviors)
                .filter(function (behavior) {
                    return (behavior.action === this.ACTION_NAME && _.includes(leavingCompIds, behavior.sourceId));
                }, this)
                .indexBy('sourceId').value();

            // For every behavior entry, create an animation if behavior should run and
            // add to this page's sequence
            _.forEach(behaviours, function (behavior) {
                var parent = this.getComponentParent(behavior.pageId);
                if (!parent.refs[behavior.sourceId]) {
                    return;
                }
                // If no sequence for this page, create one
                if (!sequences[behavior.pageId]) {
                    sequences[behavior.pageId] = parent.sequence();
                    playedTargets[behavior.pageId] = [];
                }
                playedTargets[behavior.pageId].push(this.addAnimationToSequence(behavior, sequences));

            }, this);


            var activeSequences = 1;

            function countAndRelease() {
                activeSequences--;
                if (activeSequences === 0) {
                    callback();
                }
            }

            // For every set of sequences created for each page
            //
            _.forEach(sequences, function (sequence, pageId) {
                if (sequence.hasAnimations()) {
                    activeSequences++;
                    sequence.onCompleteAll(countAndRelease);
                    sequence.onInterruptAll(countAndRelease);
                    playedTargets[pageId] = _.compact(playedTargets[pageId]);
                    sequenceIds.push({parentId: pageId, sequenceId: sequence.getId()});
                    sequence.execute();
                }
            }, this);
            countAndRelease(); // if no sequences actually started call callback now
            return sequenceIds;

        },


        /**
         *
         * @param {SiteAspectsSiteAPI} siteAPI
         * @param {String} pageId
         * @returns {ReactCompositeComponent}
         */
        getComponentParent: function (pageId) {
            return this._aspectSiteAPI.getPageById(pageId);
        },

        /**
         * Add an animation to the passed sequence if the element to animate position is inside the calculated bounds of the screen
         * @param {ParsedBehavior} behavior
         * @param {Object<Sequence>} sequences
         * @returns {String}
         */
        addAnimationToSequence: function (behavior, sequences) {
            var sequence = sequences[behavior.pageId];

            sequence.add(behavior.targetId, behavior.name, behavior.duration, behavior.delay, behavior.params, 0);
            sequence.add(behavior.targetId, 'BaseClear', 0, 0, {props: 'clip,opacity,transform', immediateRender: false});

            return behavior.targetId;
        },

        registerComponentsExit: function (leavingCompIds, callback) {
            if (this._isEnabled){
                this._pendingComponentExits.push({leavingCompIds: leavingCompIds, callback: callback});
                this._animateOnNextTick = true;
            } else {
                callback();
            }
        },

        /**
         * Handle triggers passed from actionsAspect
         */
        handleTrigger: function(){},

        /**
         * Handle updates of behaviors list by actionsAspect
         * @param {Array<ParsedBehavior>} behaviors
         */
        handleBehaviorsUpdate: function (behaviors) {
            this._behaviors = behaviors;
        },

        /**
         * Execute the action only if it is scheduled to run on next tick
         * @private
         */
        _executeActionOnTick: function () {
            if (!this._animateOnNextTick) {
                return;
            }

            this.executeAction();
            this._animateOnNextTick = false;
        },
        /**
         * Stop and clear all sequences previously created by this action
         */
        stopAndClearAnimations: function () {
            _.forEach(this._liveSequenceIds, function (entry) {
                var parent = this.getComponentParent(entry.parentId);

                if (parent){
                    parent.stopSequence(entry.sequenceId, 1);
                }
            }, this);
            this._liveSequenceIds = [];
        }

    });

    /**
     * @exports ExitAction
     */
    return ExitAction;
});
