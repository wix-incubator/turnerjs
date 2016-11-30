define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Drop in from
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
     * @returns {TimelineMax}
     */
    function dropIn(elements, duration, delay, params) {
        var sequence = factory.sequence(params);

        sequence.add([
            factory.animate('BaseFade', elements, duration * 0.25, delay, {from: {opacity: 0}, to: {opacity: 1}, ease: 'Sine.easeIn'}),
            factory.animate('BaseScale', elements, duration, delay, {from: {scale: 6}, ease: 'Sine.easeIn'})
        ]);
        return sequence.get();

    }

    dropIn.properties = {
        hideOnStart: true
    };

    factory.registerAnimation('DropIn', dropIn);
});