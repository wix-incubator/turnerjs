define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function(_, tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    function calculateScaleDeviation(elementViewPortDim, params) {
        var to = {
            width: elementViewPortDim.width,
            height: elementViewPortDim.height
        };
        var from = {
            width: params.from.width,
            height: params.from.height
        };

        return {
            x: (from.width - to.width) / 2,
            y: (from.height - to.height) / 2
        };
    }

    function getPositionParams(elementViewPortDim, params) {
        var transformX = params.from.left - elementViewPortDim.left;
        var transformY = params.from.top - elementViewPortDim.top;
        var scaleDeviation = calculateScaleDeviation(elementViewPortDim, params);

        return {
            x: transformX + scaleDeviation.x,
            y: transformY + scaleDeviation.y
        };
    }

    function getScaleParams(elementViewPortDim, params) {
        var scaleX = params.from.width / elementViewPortDim.width;
        var scaleY = params.from.height / elementViewPortDim.height;

        return {
            scaleX: scaleX,
            scaleY: scaleY
        };
    }

    /**
     * animation object
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
            var scaleParams = getScaleParams(elementViewPortDim, params);

            sequence.add(factory.animate('BasePosition', element, duration, delay, {from: positionParams, ease: 'Cubic.easeInOut'}), 0);
            sequence.add(factory.animate('BaseScale', element, duration, delay, {from: scaleParams, ease: 'Cubic.easeInOut'}), 0);
            sequence.add(factory.animate('BaseRotate', element, duration, delay, {from: {rotation: params.from.rotation}, ease: 'Cubic.easeInOut'}), 0);
        });

        return sequence.get();

    }

    factory.registerAnimation('ModesMotionScale', animate);
});
