define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * FadeOut to opacity 0 animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
     * @returns {TimelineMax}
     */
    function fadeOut(elements, duration, delay, params) {
        var sequence = factory.sequence(params);

        sequence.add(factory.animate('BaseFade', elements, duration, delay, {to: {opacity: 0}, ease: 'Cubic.easeIn'}));
        return sequence.get();

    }

    fadeOut.properties = {
        hideOnStart: false
    };

    factory.registerAnimation('FadeOut', fadeOut);
});