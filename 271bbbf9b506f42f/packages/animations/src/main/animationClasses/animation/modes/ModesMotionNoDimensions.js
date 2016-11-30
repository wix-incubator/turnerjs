define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function(_, tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    function getPositionParams(elementViewPortDim, params) {
        return {
            x: params.from.left - elementViewPortDim.left,
            y: params.from.top - elementViewPortDim.top
        };
    }

    /**
     * Shift animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params]
     * @param {String} [params.direction=right] 'top' or 'bottom' and/or 'left' or 'right'
     * @returns {TimelineMax}
     */
    function animate(elements, duration, delay, params) {
        elements = (elements instanceof window.HTMLElement) ? [elements] : elements;
        var sequence = factory.sequence(params);

        _.forEach(elements, function(element) {
            var elementViewPortDim = engine.getBoundingRect(element);
            var positionParams = getPositionParams(elementViewPortDim, params);
            sequence.add(factory.animate('BasePosition', element, duration, delay, {from: positionParams, ease: 'Cubic.easeInOut'}), 0);
            sequence.add(factory.animate('BaseRotate', element, duration, delay, {from: {rotation: params.from.rotation}, ease: 'Cubic.easeInOut'}), 0);
        });

        return sequence.get();
    }

    factory.registerAnimation('ModesMotionNoDimensions', animate);
});
