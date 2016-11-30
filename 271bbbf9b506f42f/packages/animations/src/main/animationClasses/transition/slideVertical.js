define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Slide an element out and another in from top to bottom.
     * @param {Array<HTMLElement>|HTMLElement} sourceElements DOM element to animate
     * @param {Array<HTMLElement>|HTMLElement} destElements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Optional Timeline parameters.
     * @param {boolean} [params.reverse=false] reverse direction to be from right to left
     * @param {Number} [params.height] optional height value, if not passed will use the height of the first element in sourceElements
     * @param {Object} [params.ease='Strong.easeInOut'] the ease function of the animation
     * @returns {TimelineMax}
     */
    function slideVertical(sourceElements, destElements, duration, delay, params) {
        params = params || {};

        var reverse = params.reverse ? -1 : 1;
        var height = params.height || (sourceElements.length ? sourceElements[0].offsetHeight : sourceElements.offsetHeight);
        var ease = params.ease || 'Strong.easeInOut';
        delete params.ease;
        delete params.height;
        delete params.reverse;

        var sequence = factory.sequence(params);

        sequence.add([
            factory.animate('BaseFade', destElements, 0, delay, {to: {opacity: 1}, immediateRender: false}),
            factory.animate('BasePosition', sourceElements, duration, delay, {from: {y: 0}, to: {y: -height * reverse}, ease: ease}),
            factory.animate('BasePosition', destElements, duration, delay, {from: {y: height * reverse}, to: {y: 0}, ease: ease})
        ]);

        return sequence.get();
    }

    slideVertical.properties = {
        defaultDuration: 0.6
    };

    factory.registerTransition('SlideVertical', slideVertical);
});