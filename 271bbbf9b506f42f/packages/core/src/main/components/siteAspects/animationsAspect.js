define([
    'lodash',
    'reactDOM',
    'animations'
], function (_, ReactDOM, animationsPackage) {
    "use strict";

    /**
     * AnimationsAspect constructor
     * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
     * @constructor
     */
    function AnimationsAspect(aspectSiteAPI) {
        // Aspect lifetime shared vars
        /** @type {core.SiteAspectsSiteAPI} */
        this._aspectSiteAPI = aspectSiteAPI;
        this._siteData = aspectSiteAPI.getSiteData();
        this._liveSequenceIdsByGroup = {};
    }

    function getPageId(animation) {
        var targetId = animation.targetId || animation.sourceId;
        while (_.isArray(targetId)) {
            targetId = targetId[0];
        }
        return this._aspectSiteAPI.getRootOfComponentId(targetId) || animation.pageId;
    }

    // function getRefsByPath(parent, path){
    //     if (_.isArray(path)){
    //         return _.reduce(path, function(comp, ref){
    //             return comp.refs[ref];
    //         }, parent);
    //     }
    //     return parent.refs[path];
    // }

    /**
     * Preview an Animation on a component (for DocumentServices)
     * @param {string} compId
     * @param {string} pageId
     * @param {{name:string, duration:number, delay:number, params:object}} animationDef
     * @param {function} [onComplete]
     */
    AnimationsAspect.prototype.previewAnimation = function (compId, pageId, animationDef, onComplete) {
        var page, sequence, params;

        page = this._aspectSiteAPI.getPageById(pageId);

        if (page) {
            sequence = page.sequence();
            params = {
                props: "clip,opacity,transform,transform-origin",
                immediateRender: false
            };

            sequence.add(compId, animationDef.name, animationDef.duration, animationDef.delay, animationDef.params);
            sequence.add(compId, 'BaseClear', 0, 0, params);

            if (onComplete) {
                sequence.onCompleteAll(onComplete);
            }

            return sequence.execute();
        }
    };

    AnimationsAspect.prototype.addAnimationToSequence = function (animation, sequences, clear) {
        var propsToClear;//, rotation, structure, parent;
        var pageId = getPageId.call(this, animation);
        var sequence = sequences[pageId];

        sequence.add(animation.targetId, animation.name, animation.params.duration, animation.params.delay, animation.params, 0);
        if (clear) {
            //parent = this._aspectSiteAPI.getPageById(pageId);
            // structure = _.get(getRefsByPath(parent, animation.targetId), ['props','structure']);
            // rotation = _.get(structure, 'layout.rotationInDegrees');
            propsToClear = 'clip,opacity,transform';
            sequence.add(animation.targetId, 'BaseClear', 0, 0, {props: propsToClear, immediateRender: false});
        }

        return animation.targetId;
    };

    /**
     * Play animations.
     */
    AnimationsAspect.prototype.playAnimations = function (animationGroup, animations, clear, callback) {
        var playedTargets = {};
        var sequences = {};
        var sequenceIds = [];

        // For every behavior entry, create an animation if behavior should run and
        // add to this page's sequence
        _.forEach(animations, function (animation) {
            var pageId = getPageId.call(this, animation);
            var parent = this._aspectSiteAPI.getPageById(pageId);
            var targetId = animation.targetId || animation.sourceId;

            if (_.isString(targetId) && !_.get(parent, ['refs', targetId])) {
                return;
            }
            // If no sequence for this page, create one
            if (!sequences[pageId]) {
                sequences[pageId] = parent.sequence();
                playedTargets[pageId] = [];
            }
            this.addAnimationToSequence(animation, sequences, clear);
            playedTargets[pageId].push(targetId);
        }, this);

        var activeSequences = 1;

        var countAndRelease = function (seqId) {
            activeSequences--;
            this._liveSequenceIdsByGroup[animationGroup] = _.reject(this._liveSequenceIdsByGroup[animationGroup], {sequenceId: seqId});
            if (activeSequences === 0) {
                callback();
            }
        }.bind(this);

        // For every set of sequences created for each page
        //
        _.forEach(sequences, function (sequence, pageId) {
            if (sequence.hasAnimations()) {
                activeSequences++;
                sequence.onCompleteAll(countAndRelease.bind(this, sequence.getId()));
                playedTargets[pageId] = _.compact(playedTargets[pageId]);
                sequenceIds.push({parentId: pageId, sequenceId: sequence.getId()});
                sequence.execute();
            }
        }, this);
        countAndRelease(); // if no sequences actually started call callback now
        this._liveSequenceIdsByGroup[animationGroup] = this._liveSequenceIdsByGroup[animationGroup].concat(sequenceIds);
        return playedTargets;
    };

    function setElementsVisibilityByAnimationType(animations, visibility) {
        _.forEach(animations, function (animation) {
            var animationProperties = animationsPackage.getProperties(animation.name);
            if (animationProperties && animationProperties.hideOnStart) {
                var pageId = getPageId.call(this, animation);
                var parent = this._aspectSiteAPI.getPageById(pageId);
                if (parent) {
                    var element = ReactDOM.findDOMNode(parent.refs[animation.targetId || animation.sourceId]);
                    if (element) {
                        element.style.visibility = visibility;
                    }
                }
            }
        }, this);
    }

    /**
     * Hide all elements with animations that has the hideOnStart flag enabled
     * @param {object} animations
     */
    AnimationsAspect.prototype.hideElementsByAnimationType = function (animations) {
        setElementsVisibilityByAnimationType.call(this, animations, 'hidden');
    };

    /**
     * Un-hide all elements with animations that has the hideOnStart flag enabled
     * @param {object} animations
     */
    AnimationsAspect.prototype.revertHideElementsByAnimations = function (animations) {
        setElementsVisibilityByAnimationType.call(this, animations, '');
    };

    /**
     * Preview a transition on 2 components (for DocumentServices)
     * @param {Array} srcCompIds array of ids
     * @param {Array} targetCompIds array of ids
     * @param {string} pageId
     * @param {{name:string, duration:number, delay:number, params:object}} transitionDef
     * @param {function} [onComplete]
     */
    AnimationsAspect.prototype.previewTransition = function (srcCompIds, targetCompIds, pageId, transitionDef, onComplete) {
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

    AnimationsAspect.prototype.stopPreviewAnimation = function (sequenceId) {
        var pages = this._aspectSiteAPI.getAllRenderedRoots();
        _.forEach(pages, function (page) {
            page.stopSequence(sequenceId, 1);
        });
    };

    AnimationsAspect.prototype.stopAndClearAllAnimations = function () {
        _(this._liveSequenceIdsByGroup)
            .keys()
            .forEach(this.stopAndClearAnimations, this)
            .commit();
    };

    /**
     * Stop and clear all sequences previously created by this animationGroup
     * @param {string} animationGroup
     * @param {number} [seek] a number between 0 and 1 to set the progress of the animation to stop at. defaults to 1
     */
    AnimationsAspect.prototype.stopAndClearAnimations = function (animationGroup, seek) {
        _.forEach(this._liveSequenceIdsByGroup[animationGroup], function (entry) {
            var parent = this._aspectSiteAPI.getPageById(entry.parentId);
            if (parent) {
                parent.stopSequence(entry.sequenceId, seek);
            }
        }, this);
        this._liveSequenceIdsByGroup[animationGroup] = [];
    };

    return AnimationsAspect;
});
