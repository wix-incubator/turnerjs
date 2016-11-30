define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Position base animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM elements
     * @param {Number} [duration=1.0]
     * @param {Number} [delay=0]
     * @param {Object} params
     * @param {Number|String} [params.from.x]
     * @param {Number|String} [params.from.y]
     * @param {Number|String} [params.from.z]
     * @param {Object} [params.from.bezier]
     * @param {Number|String} [params.to.x]
     * @param {Number|String} [params.to.y]
     * @param {Number|String} [params.to.z]
     * @param {Object} [params.to.bezier]
     * @returns {TweenMax}
     */
    function basePosition(elements, duration, delay, params) {

        params.duration = duration || 0;
        params.delay = delay || 0;

        return engine.tween(elements, params, ['left', 'top', 'x', 'y', 'z', 'bezier']);
    }

    factory.registerAnimation('BasePosition', basePosition);
});