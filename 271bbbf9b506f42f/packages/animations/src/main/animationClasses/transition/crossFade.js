define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * CrossFade between two elements, animation the source from 1 to 0 opacity while animating the destination from 0 to 1.
     * @param {Array<HTMLElement>|HTMLElement} sourceElements DOM element to animate
     * @param {Array<HTMLElement>|HTMLElement} destElements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
     * @param {Object} [params.stagger] stagger the animation
     * @param {Object} [params.sourceEase='Sine.easeInOut'] the ease function of the animation
     * @param {Object} [params.destEase='Sine.easeInOut'] the ease function of the animation
     * @returns {TimelineMax}
     */
    function crossFade(sourceElements, destElements, duration, delay, params) {
        var stagger = params.stagger || 0;
        var sourceEase = params.sourceEase || 'Sine.easeInOut';
        var destEase = params.destEase || 'Sine.easeInOut';
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

    crossFade.properties = {
        defaultDuration: 0.6
    };

    factory.registerTransition('CrossFade', crossFade);
});