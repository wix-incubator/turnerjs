define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function(_, tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    var paramsMap = {
        top: {dx: '0', dy: '-1', distance: '60'},
        right: {dx: '1', dy: '0', distance: '120'},
        bottom: {dx: '0', dy: '1', distance: '60'},
        left: {dx: '-1', dy: '0', distance: '120'}
    };

    /**
     * FloatIn animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params]
     * @param {String} [params.direction=right] 'top' or 'right' or 'bottom' or 'left'
     * @returns {TimelineMax}
     */
    function floatIn(elements, duration, delay, params) {

        elements = (elements instanceof window.HTMLElement) ? [elements] : elements;

        var direction = params.direction || 'right';
        delete params.direction;

        var fromParams = paramsMap[direction];
        var browserViewPortDim = {width: window.innerWidth, height: window.innerHeight};

        var sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration, delay, {from: {opacity: 0}, to: {opacity: 1}, ease: 'Cubic.easeIn'}));

        _.forEach(elements, function(element){
            var elementViewPortDim = engine.getBoundingRect(element);
            var transformX;
            var transformY = fromParams.dy * fromParams.distance;

            if (fromParams.dx > 0) {
                transformX = fromParams.dx * Math.max(0, Math.min(browserViewPortDim.width - elementViewPortDim.right, fromParams.distance));
            } else {
                transformX = fromParams.dx * Math.max(0, Math.min(elementViewPortDim.left, fromParams.distance));
            }

            sequence.add(factory.animate('BasePosition', element, duration, delay, {from: {x: transformX, y: transformY}, ease: 'Sine.easeOut'}), 0);

        });

        return sequence.get();

    }

    floatIn.properties = {
        hideOnStart: true
    };

    factory.registerAnimation('FloatIn', floatIn);
});