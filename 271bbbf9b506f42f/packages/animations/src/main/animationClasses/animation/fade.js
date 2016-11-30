define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function(_, tweenEngine) {
    'use strict';

    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Fade animation object
     * Defaults to fade in to opacity 1 with Sine.easeIn
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters.
     * @returns {TimelineMax}
     */
    function animation(elements, duration, delay, params) {
        var sequence = factory.sequence(params);

        var animationParams = _.defaultsDeep({
            ease: 'Sine.easeIn',
            to: {opacity: 1}
        }, params);

        sequence.add(factory.animate('BaseFade', elements, duration, delay, animationParams));
        return sequence.get();

    }

    factory.registerAnimation('Fade', animation);
});
