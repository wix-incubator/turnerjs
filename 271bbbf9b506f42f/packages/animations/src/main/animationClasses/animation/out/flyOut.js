define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function(_, tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    var paramsMap = {
        top: {dy: '-1'},
        right: {dx: '1'},
        bottom: {dy: '1'},
        left: {dx: '-1'}
    };

    function parseParams(direction) {
        var fromParams = {dx: 0, dy: 0};
        _.forEach(direction, function(value) {
            if (paramsMap[value]) {
                _.assign(fromParams, paramsMap[value]);
            }
        }, this);

        return fromParams;
    }

    /**
     * FlyIn animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params]
     * @param {String} [params.direction=right] 'top' or 'bottom' and/or 'left' or 'right'
     * @returns {TimelineMax}
     */
    function animation(elements, duration, delay, params) {
        elements = (elements instanceof window.HTMLElement) ? [elements] : elements;

        var direction = params.direction || 'right';
        delete params.direction;

        var fromParams = parseParams(direction.split(' '));
        var browserViewPortDim = {width: window.innerWidth, height: window.innerHeight};

        var sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration, delay, {from: {opacity: 1}, to: {opacity: 0}, ease: 'Linear.easeIn'}));

        _.forEach(elements, function(element) {
            var elementViewPortDim = engine.getBoundingRect(element);
            var transformX = (fromParams.dx > 0) ? (browserViewPortDim.width - elementViewPortDim.right) : fromParams.dx * (elementViewPortDim.left);
            var transformY = (fromParams.dy > 0) ? (browserViewPortDim.height - elementViewPortDim.top) : fromParams.dy * (elementViewPortDim.bottom);

            sequence.add(factory.animate('BasePosition', element, duration, delay, {to: {x: transformX, y: transformY}, ease: 'Sine.easeIn'}), 0);

        });

        return sequence.get();

    }

    animation.properties = {
        hideOnStart: false
    };

    factory.registerAnimation('FlyOut', animation);
});
