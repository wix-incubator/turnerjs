define([
    'lodash',
    'zepto',
    'utils',
    'animations',
    'core/components/actionsAspectActions/triggerTypesConsts',
    'reactDOM'
], function (_, $, utils, animations, triggerTypes, ReactDOM) {
    "use strict";

    var Animations = {
        ENTER: utils.siteConstants.Animations.Modes.AnimationType.ENTER,
        LEAVE: utils.siteConstants.Animations.Modes.AnimationType.LEAVE,
        TRANSITION: utils.siteConstants.Animations.Modes.AnimationType.TRANSITION
    };

    var AnimationReverse = {};
    AnimationReverse[Animations.ENTER] = Animations.LEAVE;
    AnimationReverse[Animations.LEAVE] = Animations.ENTER;

    var AnimationTypeToAction = {};
    AnimationTypeToAction[Animations.ENTER] = 'modeIn';
    AnimationTypeToAction[Animations.LEAVE] = 'modeOut';
    AnimationTypeToAction[Animations.TRANSITION] = 'modeChange';

    var ComponentToTransitionType = {
        'wysiwyg.viewer.components.SiteButton': utils.siteConstants.Animations.TransitionType.NO_SCALE,
        'wysiwyg.viewer.components.WRichText': utils.siteConstants.Animations.TransitionType.NO_DIMESIONS
    };

    function shouldBehaviorBePlayed (compIdToAnimationType, modeChanges, behavior) {
        var behaviorModeIds = _.get(behavior, 'params.modeIds');
        switch (behavior.action) {
            case 'modeIn':
                return compIdToAnimationType[behavior.targetId] === 'enter' && _.every(behaviorModeIds, function(modeId){
                        return modeChanges[modeId] === true;
                    });
            case 'modeOut':
                return compIdToAnimationType[behavior.targetId] === 'leave' && _.every(behaviorModeIds, function(modeId){
                        return modeChanges[modeId] === false;
                    });
            case 'modeChange':
                return compIdToAnimationType[behavior.targetId] === 'transition' && _.every(behaviorModeIds, function(modeId) {
                        return !_.isUndefined(modeChanges[modeId]);
                    });
            default:
                return false;

        }
    }

    function filterAndFormatBehaviorsToPlay (behaviors, compIdToAnimationType, modeChanges) {
        return _(behaviors)
            .filter(_.partial(shouldBehaviorBePlayed, compIdToAnimationType, modeChanges))
            .map(function(behavior) {
                return _.assign({animationType: compIdToAnimationType[behavior.targetId]}, behavior);
            })
            .indexBy('targetId')
            .value();
    }

    /**
     * Constructor for ScreenIn action, starts disabled.
     * @param aspectSiteAPI
     * @constructor
     */
    function ModeChangeAction(aspectSiteAPI) {
        this._aspectSiteAPI = aspectSiteAPI;
        this._siteData = aspectSiteAPI.getSiteData();
        this._behaviors = [];
        this._isEnabled = false;
        this._animateOnNextTick = false;
        this._behaviorsById = {};
        this.playingSequences = {};
        this.componentAnimationsInfo = {};
    }

    ModeChangeAction.prototype = _.create(Object.prototype, {
        constructor: ModeChangeAction,
        ACTION_TRIGGERS: [triggerTypes.MODE_CHANGED_INIT, triggerTypes.MODE_CHANGED_EXECUTE],
        ACTION_NAME: ['modeChange', 'modeIn', 'modeOut'],

        /**
         * If this returns false, we shouldn't enable this action.
         * @returns {boolean}
         */
        shouldEnable: function () {
            var isBrowser = typeof window !== 'undefined';
            var isTablet = this._siteData.isTabletDevice();
            var isMobile = this._siteData.isMobileDevice();

            return isBrowser && !isTablet && !isMobile;
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
        //
        /**
         * Disable modeChange Action
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
            this.revertHideElementsByAnimationType(this._behaviorsById);

            this._behaviorsById = {};
            this._isEnabled = false;
        },

        isEnabled: function() {
            return this._isEnabled;
        },

        needToRunPreConditions: function (/* action */) {
            return false;
        },

        /**
         * Execute the action only if it is scheduled to run on next tick
         * @private
         */
        _executeActionOnTick: function () {
            if (!this._animateOnNextTick) {
                return;
            }

            this._executeAction();
            this._animateOnNextTick = false;
        },

        /**
         * Stop and clear all sequences previously created by this action
         */
        stopAndClearAnimations: function () {
            this._behaviorsById = {};
            _.forEach(this.playingSequences, function (entry, compId) {
                var parent = this.getComponentPage(entry.parentId);
                parent.stopSequence(entry.sequence.getId(), 1);
                this.handleSequenceEnded(compId, entry.parentId, entry.type);
            }, this);

            _.forEach(this.componentAnimationsInfo, function(info, compId) {
                info.hasPendingAnimation = false;
                this.handleSequenceEnded(compId, info.pageId, info.type);
            }, this);
        },

        /**
         * Execute the action
         */
        _executeAction: function () {
            if (_.isEmpty(this._behaviorsById)) {
                return;
            }
            _.assign(this.playingSequences, this.playJsAnimations());
        },

        /**
         * external API to allow triggering of a mode change event
         */
        executeAction: function () {
            this.handleTrigger.apply(this, arguments);
        },

        clearPlayedBehaviors: function (playedTargets) {
            this._behaviorsById = _.omit(this._behaviorsById, function (behavior, sourceId) {
                return playedTargets[sourceId];
            });
        },

        convertBehaviorTimingFunctionToCSS: function (timingFunction) {
            return utils.siteConstants.Animations.TimingFunctions[timingFunction];
        },

        clearCssTransitionFromNode: function($compNode) {
            $compNode.css({
                'transition-property': '',
                'transition-duration': '',
                'transition-delay': '',
                'transition-timing-function': '',
                '-webkit-transition-timing-function': '',
                '-moz-transition-timing-function': '',
                '-o-transition-timing-function': ''
            });
        },

        addCssTransitionToNode: function(behavior, $compNode) {
            var timingFunctionCss = this.convertBehaviorTimingFunctionToCSS(behavior.params.timingFunction);
            $compNode.css({
                'transition-property': 'background-color, color !important',
                'transition-duration': behavior.duration + 's !important',
                'transition-delay': behavior.delay + 's !important',
                'transition-timing-function': timingFunctionCss + ' !important',
                '-webkit-transition-timing-function': timingFunctionCss + ' !important',
                '-moz-transition-timing-function': timingFunctionCss + ' !important',
                '-o-transition-timing-function': timingFunctionCss + ' !important'
            });
        },

        initCssTransitions: function() {
            var transitionBehaviors = _.filter(this._behaviorsById, {animationType: 'transition'});

            if (!transitionBehaviors.length) {
                return;
            }

            _.forEach(transitionBehaviors, function (behavior) {
                var compId = behavior.targetId;
                var $compNode = $(this.getComponentNode(behavior.pageId, compId));

                if (!this.componentAnimationsInfo[compId].didCssTransitionStartExecuting) {
                    this.componentAnimationsInfo[compId].didCssTransitionStartExecuting = true;
                    this.addCssTransitionToNode(behavior, $compNode);
                }
            }, this);
        },

        handleSequenceEnded: function (compId, pageId, animationType) {
            if (animationType === Animations.TRANSITION) {
                this.clearCssTransitionFromNode($(this.getComponentNode(pageId, compId)));
            }
            delete this.playingSequences[compId];
            this.notifyAnimationEnded(compId);
        },

        playJsAnimations: function() {
            var playedTargets = {};
            var sequences = {};

            _.forEach(this._behaviorsById, function (behavior) {
                var parent = this.getComponentPage(behavior.pageId);
                var targetId = behavior.targetId;
                var playingSequence = this.playingSequences[targetId];
                var isSeqReverseOfCurrentlyPlaying = playingSequence && AnimationReverse[playingSequence.type] === behavior.animationType;
                var isSameAnimationType = playingSequence && playingSequence.type === behavior.animationType;
                playedTargets[targetId] = true;

                if (isSameAnimationType) {
                    return;
                }

                if (isSeqReverseOfCurrentlyPlaying) {
                    this.reverseAnimation(behavior);
                    return;
                }

                if (playingSequence) {
                    parent.stopSequence(playingSequence.sequence.id);
                }

                sequences[targetId] = {
                    sequence: parent.sequence(),
                    parentId: behavior.pageId,
                    type: behavior.animationType
                };
                this.addAnimationToSequence(behavior, this.componentAnimationsInfo[behavior.targetId], sequences[behavior.targetId].sequence);
            }, this);

            _.forEach(sequences, this.executeSequenceIfNeeded, this);

            this.clearPlayedBehaviors(playedTargets);

            return sequences;
        },

        reverseAnimation: function(behavior){
            var targetId = behavior.targetId;
            var parent = this.getComponentPage(behavior.pageId);
            var playingSequence = this.playingSequences[targetId];
            playingSequence.type = behavior.animationType;
            this.componentAnimationsInfo[targetId].hasPendingAnimation = false;
            parent.reverseSequence(playingSequence.sequence.getId());
        },

        executeSequenceIfNeeded: function(sequenceObj, compId) {
            var sequence = sequenceObj.sequence;
            if (sequence.hasAnimations()) {
                var progress = this.componentAnimationsInfo[compId].progress;
                var handleSequenceEndedBound = this.handleSequenceEnded.bind(this, compId, sequenceObj.parentId, sequenceObj.type);

                this.componentAnimationsInfo[compId].hasPendingAnimation = false;
                sequence.onCompleteAll(handleSequenceEndedBound);
                sequence.onReverseAll(handleSequenceEndedBound);
                if (progress) {
                    sequence.onInit(function(liveSequence) {
                        liveSequence.progress(1 - progress);
                    });
                }

                sequence.execute();
            }
        },

        /**
         *
         * @param {SiteAspectsSiteAPI} siteAPI
         * @param {String} parentId
         * @returns {ReactCompositeComponent}
         */
        getComponentPage: function (parentId) {
            return this._aspectSiteAPI.getPageById(parentId);
        },

        getComponentNode: function(pageId, compId) {
            var parent = this.getComponentPage(pageId);
            var compRef = parent.refs[compId];

            if (compRef) {
                return ReactDOM.findDOMNode(compRef);
            }

            return null;
        },

        /**
         * Add an animation to the passed sequence if the element to animate position is inside the calculated bounds of the screen
         * @param {ParsedBehavior} behavior
         * @param {object} compAnimationInfo
         * @param {Sequence} sequence
         * @returns {String}
         */
        addAnimationToSequence: function (behavior, compAnimationInfo, sequence) {
            var parent = this.getComponentPage(behavior.pageId);
            var compId = behavior.targetId;

            if (!parent.refs[compId]) {
                return null;
            }

            var structure = parent.refs[compId].props.structure;

            var duration = behavior.duration;
            var delay = behavior.delay;

            if (behavior.animationType === Animations.TRANSITION) {
                var fromLayout = compAnimationInfo.prevLayout;
                var animationName = behavior.name + (ComponentToTransitionType[structure.componentType] || utils.siteConstants.Animations.TransitionType.SCALE);
                sequence.add(compId, animationName, duration, delay, {from: fromLayout});
            } else {
                sequence.add(compId, behavior.name, duration, delay, behavior.params, 0);
            }
            sequence.add(compId, 'BaseClear', 0, 0, {props: 'clip,opacity,transform', immediateRender: false});

            return compId;
        },

        /**
         * Hide all elements with animations that has the hideOnStart flag enabled
         * @param {SiteAspectsSiteAPI} siteAPI
         * @param {object} pageBehaviorsByTargets
         */
        hideElementsByAnimationType: function (pageBehaviorsByTargets) {
            _.forEach(pageBehaviorsByTargets, function (behavior, targetId) {
                if (animations.getProperties(behavior.name).hideOnStart) {
                    var element = this.getComponentNode(behavior.pageId, targetId);
                    element.style.visibility = 'hidden';
                }
            }, this);
        },

        /**
         * Un-hide all elements with animations that has the hideOnStart flag enabled
         * @param {SiteAspectsSiteAPI} siteAPI
         * @param {object} allPagesBehaviorsByTargets
         */
        revertHideElementsByAnimationType: function (allPagesBehaviorsByTargets) {
            _.forEach(allPagesBehaviorsByTargets, function(pageBehaviors) {
                _.forEach(pageBehaviors, function (behavior, targetId) {
                    if (animations.getProperties(behavior.name).hideOnStart) {
                        var element = this.getComponentNode(behavior.pageId, targetId);
                        element.style.visibility = '';
                    }
                }, this);
            }, this);
        },

        initiateBehaviors: function (pageId, behaviorsToPlayByTargetId, compIdToAnimationsType, transitioningComponentsPrevLayout, onComplete) {
            this._behaviorsById = _.assign(this._behaviorsById, behaviorsToPlayByTargetId);
            _.forEach(compIdToAnimationsType, function(animationType, compId) {
                var compAnimationInfo = this.componentAnimationsInfo[compId] = this.componentAnimationsInfo[compId] || {};
                compAnimationInfo.pageId = pageId;
                compAnimationInfo.type = animationType;
                compAnimationInfo.hasPendingAnimation = true;
                compAnimationInfo.onComplete = onComplete;
                if (animationType === Animations.TRANSITION) {
                    compAnimationInfo.prevLayout = transitioningComponentsPrevLayout[compId];
                }
            }, this);
        },

        handleBehaviorsUpdate: function(behaviors) {
            this._behaviors = behaviors;
        },

        runJsAnimationsOnNextTick: function() {
            this._animateOnNextTick = true;
        },

        runJsAnimationsImmediately: function() {
            this._executeAction();
        },

        notifyAnimationEnded: function(compId) {
            if (!this.componentAnimationsInfo[compId] || this.componentAnimationsInfo[compId].hasPendingAnimation) {
                return;
            }

            var compToAnimationType = {};
            compToAnimationType[compId] = this.componentAnimationsInfo[compId].type;
            var callback = this.componentAnimationsInfo[compId].onComplete;
            delete this.componentAnimationsInfo[compId];
            callback(compToAnimationType);
        },

        handleDidLayout: function() {
            this._aspectSiteAPI.unRegisterFromDidLayout();
            var browser = this._siteData.getBrowser();
            if (browser && (browser.ie || browser.edge || browser.safari)) { // Ugly hack to avoid extra-animation-frame flicker
                this.runJsAnimationsImmediately();
            } else {
                this.runJsAnimationsOnNextTick();
            }
        },

        handleReverseTransitionAnimations: function(componentAnimations) {
            var willTransitionCompIds = _.transform(componentAnimations, function(result, animationType, compId) {
                if (animationType === Animations.TRANSITION) {
                    result.push(compId);
                }
            }, []);
            var duringTransitionCompIds = _.transform(this.playingSequences, function(result, sequenceInfo, compId) {
                if (sequenceInfo.type === Animations.TRANSITION) {
                    result.push(compId);
                }
            }, []);
            var compIdsToReverse = _.intersection(willTransitionCompIds, duringTransitionCompIds);

            _.forEach(compIdsToReverse, function(compId) {
                var compAnimationInfo = this.componentAnimationsInfo[compId];
                var parent = this.getComponentPage(compAnimationInfo.pageId);
                var sequenceId = this.playingSequences[compId].sequence.getId();
                var sequence = parent.getSequence(sequenceId);
                var compNode = this.getComponentNode(compAnimationInfo.pageId, compId);

                compAnimationInfo.progress = sequence.progress();
                sequence.set(compNode, {clearProps: 'clip,opacity'});
                parent.stopSequence(sequenceId, 1);
                delete this.playingSequences[compId];
            }, this);
        },

        handleTrigger: function(triggerType, triggerArgs) {
            if (!this._isEnabled) {
                if (triggerArgs && triggerArgs.onComplete) {
                    triggerArgs.onComplete(triggerArgs.componentAnimations);
                }

                return;
            }

            switch (triggerType) {
                case triggerTypes.MODE_CHANGED_INIT:
                    var behaviorsToPlayByTargetId = filterAndFormatBehaviorsToPlay(this._behaviors, triggerArgs.componentAnimations, triggerArgs.modeChanges);
                    var registeredComponentAnimations = _.pick(triggerArgs.componentAnimations, _.keys(behaviorsToPlayByTargetId));
                    var unregisteredComponentAnimations = _.omit(triggerArgs.componentAnimations, _.keys(behaviorsToPlayByTargetId));

                    this.initiateBehaviors(triggerArgs.pageId, behaviorsToPlayByTargetId, registeredComponentAnimations, triggerArgs.transitioningComponentsPrevLayout, triggerArgs.onComplete);
                    this.handleReverseTransitionAnimations(triggerArgs.componentAnimations);
                    this.initCssTransitions();
                    triggerArgs.onComplete(unregisteredComponentAnimations);
                    break;
                case triggerTypes.MODE_CHANGED_EXECUTE:
                    this.hideElementsByAnimationType(this._behaviorsById);
                    this._aspectSiteAPI.registerToDidLayout(this.handleDidLayout.bind(this));
                    break;
            }
        }
    });

    /**
     * @exports ModeChangeAction
     */
    return ModeChangeAction;
});
