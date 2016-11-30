define.experiment.newAnimation('FoldIn.AnimationNewBehaviors', function() {
    return {
        init: function(animations) {
            this._animations = animations;
        },
        /**
         * FoldIn animation object
         * @param {HTMLElement} element DOM element to animate
         * @param {Number} [duration]
         * @param {Number} [delay]
         * @param {Object} [params]
         * @param {String} [params.origin=top] top, right, bottom, left
         * @returns {Tween}
         */
        animate: function(element, duration, delay, params) {
            params = params ? _.cloneDeep(params) : {};

            //TODO: We need to fix or css cleaning technique. passing 'parent' currently solves a problem where
            //TODO: elementClearParams is only read one level down and if 'parent' was only declared in baseRotate3D they were never cleared
            //var parent = element.parentNode;

            params.data = params.data || {};
            params.data.elementClearParams = {
                elements: [element],//, parent],
                types: [this._animations.ClearTypes.CSS_STYLE]
            };

            // parse params
            params.direction = params.direction || this._defaults.direction;
            var elemAngleInDeg = element.$logic ? element.$logic.getAngle() : 0;
            var elemAngleInRad = elemAngleInDeg * Math.PI / 180;
            var adjDirection = this._getAdjustedDirection(this._paramsMap[params.direction].idx, elemAngleInDeg);

            var transformXYParams = this._getElementTransformedPosition(this._paramsMap[adjDirection].origin, element.getContentRect(), elemAngleInRad);
            var originParams = this._getTransformOriginTweenParams(element, this._paramsMap[adjDirection].origin);
            var fromParams = {rotationX: this._paramsMap[adjDirection].angleX, rotationY: this._paramsMap[adjDirection].angleY};

            // delete handled params (don't pass on)
            delete params.direction;

            // the tween
            return this._animations.sequence([
               this._animations.applyTween('BaseFade', element, duration, delay, {from: {opacity: 0}, ease: 'Cubic.easeInOut'}),
               this._animations.applyTween('BasePosition', element, 0, delay, {to: {transformOrigin: originParams, x: transformXYParams.x, y: transformXYParams.y}}),
               this._animations.applyTween('BaseRotate3D', element, duration, delay, {from: fromParams, perspective: 800, fallbackFor3D: true, ease: 'Cubic.easeInOut'})
            ], params);
        },

        group: ['entrance', '3d'],

        options: {
            hideOnStart: true,
            screenInThreshold: '15%',
            waitForPageTransition: true
        },

        _defaults: {
            direction: 'left'
        },

        _paramsMap: {
            top: {angleX: '-90', angleY: '0', origin: {x: '50%', y: '0'}, idx: 0},
            right: {angleX: '0', angleY: '-90', origin: {x: '100%', y: '50%'}, idx: 1},
            bottom: {angleX: '90', angleY: '0', origin: {x: '50%', y: '100%'}, idx: 2},
            left: {angleX: '0', angleY: '90', origin: {x: '0', y: '50%'}, idx: 3}
        },

        _getElementTransformedPosition: function(origin, rect, angleInRad) {
            var transformedPosition = {x: 0, y: 0};
            var centerX = rect.width / 2;
            var centerY = rect.height / 2;

            var originX = rect.width * parseInt(origin.x) / 100;
            var originY = rect.height * parseInt(origin.y) / 100;

            var toX = centerX - centerX * Math.cos(angleInRad) + centerY * Math.sin(angleInRad);
            var toY = centerY - centerX * Math.sin(angleInRad) - centerY * Math.cos(angleInRad);

            var fromX = originX - originX * Math.cos(angleInRad) + originY * Math.sin(angleInRad);
            var fromY = originY - originX * Math.sin(angleInRad) - originY * Math.cos(angleInRad);

            transformedPosition.x = toX - fromX;
            transformedPosition.y = toY - fromY;

            return transformedPosition;
        },

        _getAdjustedDirection: function(idx, angle) {
            var direction = ['top', 'right', 'bottom', 'left'];
            var shiftBy = Math.round(angle / 90);

            idx = (idx + (direction.length - 1) * shiftBy) % direction.length;

            return direction[idx];
        },

        _getTransformOriginTweenParams: function(element, origin) {
            var adjOrigin = {x: 0, y: 0};
            var compRect = element.getCoordinates(); // mootools
            var contentRect = element.getContentRect();

            adjOrigin.x = (contentRect.left + contentRect.width * (parseInt(origin.x) / 100)) - compRect.left;
            adjOrigin.y = (contentRect.top + contentRect.height * (parseInt(origin.y) / 100)) - compRect.top;

            return (adjOrigin.x + 'px' + ' ' + adjOrigin.y + 'px');
        }
    };
});