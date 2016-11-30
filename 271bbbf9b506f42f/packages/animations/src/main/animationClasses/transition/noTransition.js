define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Empty transition.
     * @param {Array<HTMLElement>|HTMLElement} sourceElements DOM element to animate
     * @param {Array<HTMLElement>|HTMLElement} destElements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters.
     * @returns {TimelineMax}
     */
    function noTransition(sourceElements, destElements, duration, delay, params) {
        var sequence = factory.sequence(params);
        sequence.add([
            factory.animate('BaseNone', sourceElements, duration, delay),
            factory.animate('BaseNone', destElements, duration, delay)
        ]);

        return sequence.get();
    }

    noTransition.properties = {
        defaultDuration: 0
    };

    factory.registerTransition('NoTransition', noTransition);
});