define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function(_, tweenEngine) {
    'use strict';

    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Rotate animation object
     * Defaults to rotate 360 deg with Cubic.easeIn
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
     * @returns {TimelineMax}
     */
    function animation(elements, duration, delay, params) {
        var sequence = factory.sequence(params);

        var animationParams = _.defaultsDeep({
            ease: 'Sine.easeIn',
            to: {rotation: '360deg'}
        }, params);

        sequence.add(factory.animate('BaseRotate', elements, duration, delay, animationParams));
        return sequence.get();

    }

    factory.registerAnimation('Rotate', animation);
});
