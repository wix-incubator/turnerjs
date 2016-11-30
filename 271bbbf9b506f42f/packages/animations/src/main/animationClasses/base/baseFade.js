define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Fade base animation object (defaults to always use 'autoAlpha' which treats visibility:hidden as opacity:0)
     * @param {Array<HTMLElement>|HTMLElement} elements DOM elements
     * @param {Number} [duration=1.0]
     * @param {Number} [delay=0]
     * @param {Object} params
     * @param {Number} [params.from.opacity]
     * @param {Number} [params.from.autoAlpha]
     * @param {Number} [params.to.opacity]
     * @param {Number} [params.to.autoAlpha]
     * @param {boolean} [params.lazy=false] GSAP 1.12.0 introduced 'lazy' rendering. we need the default to be false for opacity.
     * @returns {TweenMax}
     */
    function baseFade(elements, duration, delay, params) {

        params.duration = duration || 0;
        params.delay = delay || 0;
        params.lazy = !!params.lazy;

        if (params.to){
            params.to.autoAlpha = params.to.autoAlpha || params.to.opacity || 0;
            delete params.to.opacity;
        }
        if (params.from){
            params.from.autoAlpha = params.from.autoAlpha || params.from.opacity || 0;
            delete params.from.opacity;
        }

        return engine.tween(elements, params, ['opacity', 'autoAlpha']);
    }

    factory.registerAnimation('BaseFade', baseFade);
});