define(['lodash', 'coreUtils', 'animations/localTweenEngine/localTweenEngine'], function(_, utils, tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    function getPositionParams(elementViewPortDim, params) {
        var transformX = utils.style.unitize(params.from.left - elementViewPortDim.left, 'px');
        var transformY = utils.style.unitize(params.from.top - elementViewPortDim.top, 'px');

        return {
            x: transformX,
            y: transformY
        };
    }

    function getDimensionParams(params) {
        return {
            width: utils.style.unitize(params.from.width),
            height: utils.style.unitize(params.from.height)
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
            var dimensionParams = getDimensionParams(params);

            sequence.add(factory.animate('BasePosition', element, duration, delay, {from: positionParams, ease: 'Cubic.easeInOut'}), 0);
            sequence.add(factory.animate('BaseDimensions', element, duration, delay, {from: dimensionParams, ease: 'Cubic.easeInOut'}), 0);
            sequence.add(factory.animate('BaseRotate', element, duration, delay, {from: {rotation: params.from.rotation}, ease: 'Cubic.easeInOut'}), 0);
        });

        return sequence.get();

    }

    factory.registerAnimation('ModesMotionNoScale', animate);
});
