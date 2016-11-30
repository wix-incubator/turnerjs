/** @class wysiwyg.viewer.managers.actions.ScreenInAction */
define.experiment.Class('wysiwyg.viewer.managers.actions.ScreenInAction.AnimationNewBehaviors', function(classDefinition, experimentStrategy) {

    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.fields({
        _pageSequences: [],
        _masterPageSequences: []
    });
    def.methods({
        /**
         * Build and run the the animations
         * Empty the _pageTargetsToPlay while animating, and stop when it is empty.
         * @private
         */
        _animateTargets: function() {
            var element, params, isTargetInViewport, targetId, currentTargetBehaviors, index, behavior, pageSequence, masterPageSequence;
            var pageTweens = [],
                masterPageTweens = [];

            if (!this._isTargetsToAnimate()) {
                return;
            }

            // iteriate targets
            var targetsToPlayCounter = this._pageTargetsToPlay.length;
            while (targetsToPlayCounter--) {
                targetId = this._pageTargetsToPlay[targetsToPlayCounter];
                isTargetInViewport = this._isTargetInViewport(targetId);

                // check if target is within view port and is not already animating
                if (!isTargetInViewport || this._isTweening(targetId)) {
                    continue;
                }

                currentTargetBehaviors = this.getBehaviorsByTargetId(targetId);

                // fetch all animations on target and play
                for (index = 0; index < currentTargetBehaviors.length; index++) {
                    behavior = currentTargetBehaviors[index];

                    if (!this._animations.getAnimationDefinition(behavior.name)){
                        continue;
                    }

                    // play animation
                    params = (behavior.params) ? _.cloneDeep(behavior.params) : {};
                    element = this._getDomElementByTargetId(targetId);

                    if (this.getPageIdByTargetId(targetId) === 'master') {
                        masterPageTweens.push(this._animations.applyTween(behavior.name, element, behavior.duration, behavior.delay, params));
                    } else {
                        pageTweens.push(this._animations.applyTween(behavior.name, element, behavior.duration, behavior.delay, params));
                    }
                }

                if (masterPageTweens.length) {
                    masterPageSequence = this._animations.sequence(masterPageTweens, {autoClear: true, paused: true});
                    this._masterPageSequences.push(masterPageSequence);
                }

                if (pageTweens.length) {
                    pageSequence = this._animations.sequence(pageTweens, {autoClear: true, paused: true});
                    this._pageSequences.push(pageSequence);
                }

                // set target is played
                this._siteTargetsPlayData[targetId].isPlayed = true;

                // delete played target
                this._pageTargetsToPlay.splice(targetsToPlayCounter, 1);

                masterPageSequence && masterPageSequence.play();
                pageSequence && pageSequence.play();


            }
        },
        /**
         * Clear animation from all elements on page and masterpage that are assigned a behavior
         * @param {String} pageId
         * @private
         */
        _clearAnimations: function(pageId) {
            if (pageId === 'master') {
                this._animations.clear(this._masterPageSequences);
                this._masterPageSequences = [];
            }
            else {
                this._animations.clear(this._pageSequences);
                this._pageSequences = [];
            }

        }

//        _onPageTransitionStart: strategy.before(function(params) {
//            this._masterPageSequences = [];
//            this._pageSequences = [];
//        })

    });
});