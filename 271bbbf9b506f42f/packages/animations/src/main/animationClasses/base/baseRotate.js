define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Rotate animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM elements
     * @param {Number} [duration=1.0]
     * @param {Number} [delay=0]
     * @param {Object} params
     * @param {Number|String} [params.from.rotation]
     * @param {Number|String} [params.to.rotation]
     * @returns {TweenMax}
     */
    function baseRotate(elements, duration, delay, params) {

        params.duration = duration || 0;
        params.delay = delay || 0;

        return engine.tween(elements, params, ['rotation']);
    }

    factory.registerAnimation('BaseRotate', baseRotate);
});