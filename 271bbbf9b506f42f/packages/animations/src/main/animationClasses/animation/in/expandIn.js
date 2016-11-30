define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Expand in from
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
     * @returns {TimelineMax}
     */
    function expandIn(elements, duration, delay, params) {
        var sequence = factory.sequence(params);

        sequence.add([
            factory.animate('BaseFade', elements, duration, delay, {from: {opacity: 0}, to: {opacity: 1}, ease: 'Cubic.easeIn'}),
            factory.animate('BaseScale', elements, duration, delay, {from: {scale: 0}, ease: 'Sine.easeIn'})
        ]);
        return sequence.get();

    }

    expandIn.properties = {
        hideOnStart: true
    };

    factory.registerAnimation('ExpandIn', expandIn);
});