define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function(_, tweenEngine) {
    'use strict';

    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Scale animation object
     * Defaults to Sine.easeIn
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
     * @returns {TimelineMax}
     */
    function animation(elements, duration, delay, params) {
        var sequence = factory.sequence(params);

        var animationParams = _.defaultsDeep({
            ease: 'Sine.easeIn'
        }, params);

        sequence.add(factory.animate('BaseScale', elements, duration, delay, animationParams));
        return sequence.get();

    }

    factory.registerAnimation('Scale', animation);
});
