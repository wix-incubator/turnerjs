define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Slide an element out and another in from left tot right.
     * @param {Array<HTMLElement>|HTMLElement} sourceElements DOM element to animate
     * @param {Array<HTMLElement>|HTMLElement} destElements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params] Optional Timeline parameters.
     * @param {boolean} [params.reverse=false] reverse direction to be from right to left
     * @param {Number} [params.width] optional width value, if not passed will use the width of the first element in sourceElements
     * @param {Object} [params.ease='Strong.easeInOut'] the ease function of the animation
     * @returns {TimelineMax}
     */
    function slideHorizontal(sourceElements, destElements, duration, delay, params) {
        params = params || {};

        var reverse = params.reverse ? -1 : 1;
        var width = params.width || (sourceElements.length ? sourceElements[0].offsetWidth : sourceElements.offsetWidth);
        var ease = params.ease || 'Strong.easeInOut';

        delete params.ease;
        delete params.width;
        delete params.reverse;

        var sequence = factory.sequence(params);

        sequence.add([
            factory.animate('BaseFade', destElements, 0, delay, {to: {opacity: 1}, immediateRender: false}),
            factory.animate('BasePosition', sourceElements, duration, delay, {from: {x: 0}, to: {x: -width * reverse}, ease: ease}),
            factory.animate('BasePosition', destElements, duration, delay, {from: {x: width * reverse}, to: {x: 0}, ease: ease})
        ]);

        return sequence.get();
    }

    slideHorizontal.properties = {
        defaultDuration: 0.6
    };

    factory.registerTransition('SlideHorizontal', slideHorizontal);
});