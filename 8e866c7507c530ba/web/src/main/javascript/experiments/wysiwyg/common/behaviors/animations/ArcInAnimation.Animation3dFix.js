define.experiment.animation('ArcIn.Animation3dFix', function() {
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
            var elementAngleInDeg = element.$logic ? element.$logic.getAngle() : 0;
            var adjDirection = this._getAdjustedDirection(this._paramsMap[params.direction].idx, elementAngleInDeg);

            var rotate3DParams = this._getRotate3DParams(adjDirection);
            var transformOriginParams = this._getTransformOriginParams(element);

            // delete handled params (don't pass on)
            delete params.direction;

            // the tween
            return this._animations.sequence([
                this._animations.set(element, {transformOrigin: transformOriginParams}),
                this._animations.applyTween('BaseFade', element, duration, delay,{from: {opacity: 0}, ease: 'Sine.easeInOut'}),
                this._animations.applyTween('BaseRotate3D', element, duration, delay, {from: rotate3DParams, perspective:200, fallbackFor3D: false, ease: 'Sine.easeInOut'})
            ], params);
        },

        _paramsMap: {
            pseudoRight:    {angleX: '180', angleY: '0',  idx: 0},
            right:          {angleX: '0', angleY: '180',  idx: 1},
            pseudoLeft:     {angleX: '-180', angleY: '0', idx: 2},
            left:           {angleX: '0', angleY: '-180', idx: 3}
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

        _getAdjustedDirection: function(idx, angle) {
            var direction = ['pseudoRight', 'right', 'pseudoLeft', 'left'];
            var shiftBy = Math.round(angle/90);

            idx = (idx + (direction.length - 1) * shiftBy) % direction.length;
            return direction[idx];
        },

        _getRotate3DParams: function(direction) {
            return {rotationX: this._paramsMap[direction].angleX, rotationY: this._paramsMap[direction].angleY};
        },

        _getTransformOriginParams: function(element) {
            return  '50% ' + '50% ' + -1.50 * (element.getSize().x);
        }
    };
});