define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function (_, tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Object enumeration base animation object
     * @param {Array<object>|object}
     * @param {Number} [duration=1.0]
     * @param {Number} [delay=0]
     * @param {Object} params

     * @returns {TweenMax}
     */
    function animation(elements, duration, delay, params) {

        params.duration = duration || 0;
        params.delay = delay || 0;

        return engine.tween(elements, params, ['attr']);
    }

    factory.registerAnimation('BaseAttribute', animation);
});
