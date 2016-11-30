define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Shrinc (clip) transition
     * @param {Array<HTMLElement>|HTMLElement} sourceElements DOM element to animate
     * @param {Array<HTMLElement>|HTMLElement} destElements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Timeline optional parameters (Tween values cannot be changed here, use BaseFade).
     * @param {Object} [params.sourceEase='Sine.easeInOut'] the ease function of the animation
     * @returns {TimelineMax}
     */
    function shrink(sourceElements, destElements, duration, delay, params) {
        var height = params.height;
        var width = params.width;
        var clip = 'rect(' + [height / 2, width / 2, height / 2, width / 2].join('px,') + 'px)';
        var stagger = params.stagger || 0;
        var sourceEase = params.sourceEase || 'Sine.easeInOut';
        delete params.sourceEase;
        delete params.stagger;
        delete params.width;
        delete params.height;

        var sequence = factory.sequence(params);

        sequence
            .add(factory.animate('BaseFade', destElements, 0, delay, {to: {opacity: 1}, clearProps: 'clip'}))
            .add(factory.animate('BaseClip', sourceElements, duration, delay, {to: {clip: clip}, ease: sourceEase, stagger: stagger}));
        return sequence.get();
    }

    shrink.properties = {
    };

    factory.registerTransition('Shrink', shrink);
});