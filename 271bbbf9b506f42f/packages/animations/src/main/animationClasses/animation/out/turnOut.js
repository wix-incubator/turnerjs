define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function(_, tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    var paramsMap = {
        left: {dx: '-1', angle: '90'},
        right: {dx: '1', angle: '90'}
    };

    /**
     * TurnIn animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params]
     * @param {String} [params.direction=left] 'left' or 'right'
     * @returns {TimelineMax}
     */
    function animation(elements, duration, delay, params) {
        var direction = (params.direction || 'right');
        delete params.direction;

        var origin = paramsMap[direction];

        var browserViewPortDim = {width: window.innerWidth, height: window.innerHeight};

        var sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration, delay, {from: {opacity: 1}, to: {opacity: 0}, ease: 'Linear.easeIn'}));

        _.forEach(elements, function(element) {
            var elementViewPortDim = engine.getBoundingRect(element);
            var transformX = (origin.dx > 0) ? (browserViewPortDim.width - elementViewPortDim.right) : (origin.dx * (elementViewPortDim.left));
            var transformY = Math.min(-1.5 * elementViewPortDim.height, Math.max(-300, -5.5 * elementViewPortDim.height));
            var transformRotate = ((origin.dx > 0) ? '+=' : '-=') + origin.angle;
            var bezierPath = [
                {x: transformX, y: transformY},
                {x: origin.dx * elementViewPortDim.width, y: transformY}
            ];

            sequence.add([
                factory.animate('BasePosition', element, duration, delay, {to: {bezier: {values: bezierPath, type: 'soft'}}, ease: 'Sine.easeIn'}),
                factory.animate('BaseRotate', element, duration, delay, {to: {rotation: transformRotate}, ease: 'Sine.easeIn'})
            ], 0);

        });

        return sequence.get();
    }

    animation.properties = {
        hideOnStart: false
    };

    factory.registerAnimation('TurnOut', animation);
});
