define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Scale base animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM elements
     * @param {Number} [duration=1.0]
     * @param {Number} [delay=0]
     * @param {Object} params
     * @param {Number} [params.from.scale]
     * @param {Number} [params.to.scale]
     * @returns {TweenMax}
     */
    function baseScale(elements, duration, delay, params) {

        params.duration = duration || 0;
        params.delay = delay || 0;

        return engine.tween(elements, params, ['scale', 'scaleX', 'scaleY']);
    }

    factory.registerAnimation('BaseScale', baseScale);
});