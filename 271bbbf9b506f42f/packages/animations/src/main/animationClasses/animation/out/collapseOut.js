define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Collapse Out
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
     * @returns {TimelineMax}
     */
    function animation(elements, duration, delay, params) {
        var sequence = factory.sequence(params);

        sequence.add([
            factory.animate('BaseFade', elements, duration, delay, {from: {opacity: 1}, to: {opacity: 0}, ease: 'Cubic.easeOut'}),
            factory.animate('BaseScale', elements, duration, delay, {to: {scale: 0}, ease: 'Sine.easeOut'})
        ]);
        return sequence.get();

    }

    animation.properties = {
        hideOnStart: false
    };

    factory.registerAnimation('CollapseOut', animation);
});
