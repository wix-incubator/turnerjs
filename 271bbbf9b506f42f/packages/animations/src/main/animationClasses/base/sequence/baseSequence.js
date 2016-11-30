define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;
    /**
     * Sequence base animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM elements
     * @param {Number} [duration=1.0]
     * @param {Number} [delay=0]
     * @param {Object} params
     * @returns {TimelineMax}
     */
    function BaseSequence(params) {
        return engine.timeline(params, []);
    }

    factory.registerAnimation('BaseSequence', BaseSequence);
});