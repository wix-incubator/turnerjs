define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Fade out an element and after it disappears fade in the next element.
     * @param {Array<HTMLElement>|HTMLElement} sourceElements DOM element to animate
     * @param {Array<HTMLElement>|HTMLElement} destElements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
     * @param {Object} [params.sourceEase='Strong.easeOut'] the ease function of the animation
     * @param {Object} [params.destEase='Strong.easeIn'] the ease function of the animation
     * @returns {TimelineMax}
     */
    function outIn(sourceElements, destElements, duration, delay, params) {
        var stagger = params.stagger || 0;
        var sourceEase = params.sourceEase || 'Strong.easeOut';
        var destEase = params.destEase || 'Strong.easeIn';
        delete params.sourceEase;
        delete params.destEase;
        delete params.stagger;

        var sequence = factory.sequence(params);

        sequence.add([
            factory.animate('BaseFade', sourceElements, duration, delay, {from: {opacity: 1}, to: {opacity: 0}, ease: sourceEase, stagger: stagger}),
            factory.animate('BaseFade', destElements, duration, delay, {from: {opacity: 0}, to: {opacity: 1}, ease: destEase, stagger: stagger})
        ]);
        return sequence.get();
    }

    outIn.properties = {
        defaultDuration: 0.7
    };

    factory.registerTransition('OutIn', outIn);
});