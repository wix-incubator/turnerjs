define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function(_, tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    var paramsMap = {
        top: {angleX: '-90', angleY: '0', origin: {x: '50%', y: '0'}, idx: 0},
        right: {angleX: '0', angleY: '-90', origin: {x: '100%', y: '50%'}, idx: 1},
        bottom: {angleX: '90', angleY: '0', origin: {x: '50%', y: '100%'}, idx: 2},
        left: {angleX: '0', angleY: '90', origin: {x: '0', y: '50%'}, idx: 3}
    };

    function getElementTransformedPosition(origin, rect, angleInRad) {
        var transformedPosition = {x: 0, y: 0};

        var centerX = rect.width / 2;
        var centerY = rect.height / 2;

        var originX = rect.width * parseInt(origin.x, 10) / 100;
        var originY = rect.height * parseInt(origin.y, 10) / 100;

        var toX = centerX - centerX * Math.cos(angleInRad) + centerY * Math.sin(angleInRad);
        var toY = centerY - centerX * Math.sin(angleInRad) - centerY * Math.cos(angleInRad);

        var fromX = originX - originX * Math.cos(angleInRad) + originY * Math.sin(angleInRad);
        var fromY = originY - originX * Math.sin(angleInRad) - originY * Math.cos(angleInRad);

        transformedPosition.x = toX - fromX;
        transformedPosition.y = toY - fromY;

        return transformedPosition;
    }

    function getAdjustedDirection(idx, angle) {
        var direction = ['top', 'right', 'bottom', 'left'];
        var shiftBy = Math.round(angle / 90);

        idx = (idx + (direction.length - 1) * shiftBy) % direction.length;

        return direction[idx];
    }

    function getTransformOriginTweenParams(compRect, contentRect, origin) {
        var adjOrigin = {x: 0, y: 0};

        adjOrigin.x = (contentRect.left + contentRect.width * (parseInt(origin.x, 10) / 100)) - compRect.left;
        adjOrigin.y = (contentRect.top + contentRect.height * (parseInt(origin.y, 10) / 100)) - compRect.top;

        return (adjOrigin.x + 'px' + ' ' + adjOrigin.y + 'px');
    }

    /**
     * FoldIn animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params]
     * @param {String} [params.origin=top] top, right, bottom, left
     * @returns {TimelineMax}
     */
    function foldIn(elements, duration, delay, params) {

        elements = (elements instanceof window.HTMLElement) ? [elements] : elements;

        var direction = params.direction || 'left';
        delete params.direction;

        var sequence = factory.sequence(params);
        sequence.add(factory.animate('BaseFade', elements, duration * 0.25, delay, {from: {opacity: 0}, to: {opacity: 1}, ease: 'Cubic.easeInOut'}));


        _.forEach(elements, function(element) {

            var elementAngleInDeg = element.getAttribute('data-angle') || 0;

            var elementAngleInRad = elementAngleInDeg * Math.PI / 180;
            var adjDirection = getAdjustedDirection(paramsMap[direction].idx, elementAngleInDeg);

            var compRect = engine.getBoundingRect(element);
            var contentRect = engine.getBoundingContentRect(element);

            var transformXYParams = getElementTransformedPosition(paramsMap[adjDirection].origin, contentRect, elementAngleInRad);
            var originParams = getTransformOriginTweenParams(compRect, contentRect, paramsMap[adjDirection].origin);
            var fromParams = {rotationX: paramsMap[adjDirection].angleX, rotationY: paramsMap[adjDirection].angleY};
            // the tween
            sequence.add([
                factory.animate('BasePosition', element, 0, delay, {to: {transformOrigin: originParams, x: transformXYParams.x, y: transformXYParams.y}}),
                factory.animate('BaseRotate3D', element, duration, delay, {from: fromParams, perspective: 800, fallbackFor3D: true, ease: 'Cubic.easeInOut'})
            ], 0);
        });

        return sequence.get();

    }

    foldIn.properties = {
        hideOnStart: true
    };

    factory.registerAnimation('FoldIn', foldIn);
});