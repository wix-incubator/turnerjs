define.experiment.newAnimation('ArcIn.AnimationNewBehaviors', function() {
    return {
        init: function(animations) {
            this._animations = animations;
        },
        /**
         * ArcIn from opacity 0 animation object
         * @param {HTMLElement} element DOM element to animate
         * @param {Number} [duration]
         * @param {Number} [delay]
         * @param {Object} [params]
         * @param {String} [params.direction=left] right, left
         * @returns {Tween}
         */
        animate: function(element, duration, delay, params) {
            params = params ? _.cloneDeep(params) : {};

            params.data = params.data || {};
            params.data.elementClearParams = {
                elements: element,
                types: [this._animations.ClearTypes.CSS_STYLE]
            };

            // parse params
            params.direction = params.direction || this._defaults.direction;
            var elemAngleInDeg = element.$logic ? element.$logic.getAngle() : 0;
            //var elemAngleInRad = elemAngleInDeg * Math.PI / 180;
            var direction = params.direction;

            var fromBezierParams = this._getBezierTweenParams(element, this._paramsMap[direction].dx);
            var fromRotateParams = this._getRotateTweenParams(this._paramsMap[direction].angleY, elemAngleInDeg);

            // delete handled params (don't pass on)
            delete params.direction;

            // the tween
            return this._animations.sequence([
                this._animations.applyTween('BaseFade', element, duration, delay, {from: {opacity: 0}, ease: 'Linear.easeNone'}),
                this._animations.applyTween('BaseScale', element, duration, delay, {from: {scale: 0}, ease: 'Linear.easeNone'}),
                this._animations.applyTween('BasePosition', element, duration, delay, {from: fromBezierParams, ease: 'Linear.easeNone'}),
                this._animations.applyTween('BaseRotate3D', element, duration, delay, {from: fromRotateParams, ease: 'Linear.easeNone', perspective: 800, fallbackFor3D: false})
            ], params);
        },

        _paramsMap: {
            'right': {dx: 1, angleY: 180},
            'left': {dx: -1, angleY: -180}
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

        _getRotateTweenParams: function(tweenAngle, elemAngle) {
            return {rotationY: elemAngle === 0 ? tweenAngle : 0};
        },

        _getBezierTweenParams: function(element, dx) {
            var width = element.getSize().x; // mootools
            var height = element.getSize().y; // mootools

            var bezierPath = [
                {x: dx * ((3/4) * width), y: -1 * (0.15 * height)},
                {x: dx * ((3/4) * width), y: -1 * (0.25 * height)},
                {x: 0, y: -1 * (0.25 * height)},
                {x: 0, y: -1 * (0.15 * height)}
            ];

            return {bezier:{curviness:1.5, values: bezierPath}};
        }
    };
});