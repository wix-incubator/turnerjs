define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Empty animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM elements
     * @param {Number} [duration=0]
     * @param {Number} [delay=0]
     * @param {Object} params
     * @returns {TweenMax}
     */
    function baseNone(elements, duration, delay, params) {

        params.duration = duration || 0;
        params.delay = delay || 0;
        params.to = {};

        return engine.tween(elements, params, []);
    }

    factory.registerAnimation('BaseNone', baseNone);
});