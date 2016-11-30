define.experiment.animation('FloatIn.AnimationNewBehaviors', function() {
    return {
        init: function(animations) {
            this._animations = animations;
        },
        /**
         * FloatIn animation object
         * @param {HTMLElement} element DOM element to animate
         * @param {Number} [duration]
         * @param {Number} [delay]
         * @param {Object} [params]
         * @param {String} [params.direction=right] 'top' or 'right' or 'bottom' or 'left'
         * @returns {Timeline}
         */
        animate: function(element, duration, delay, params) {
            params = params ? _.cloneDeep(params) : {};

            params.data = params.data || {};
            params.data.elementClearParams = {
                elements: element,
                types: [this._animations.ClearTypes.CSS_STYLE]
            };

            // parse params
            var direction = params.direction || this._defaults.direction;
            var fromParams = this._paramsMap[direction];

            // calc element transform in respect to browser's view-port
            // browser's view-port width/height is the actual width/height excluding scrollBars
            var browserViewPortDim = {width: window.getSize().x, height: window.getSize().y};
            var elementViewPortDim = element.getBoundingClientRect();

            var transformY = fromParams.dy * fromParams.distance;
            var transformX;
            if (fromParams.dx > 0) {
                transformX = fromParams.dx * Math.max(0, Math.min(browserViewPortDim.width - elementViewPortDim.right, fromParams.distance));
            }
            else {
                transformX = fromParams.dx * Math.max(0, Math.min(elementViewPortDim.left, fromParams.distance));
            }
            // delete handled params (don't pass on)
            delete params.direction;

            // the tween
            return this._animations.sequence([
                this._animations.applyTween('BaseFade', element, duration, delay, {from: {opacity: 0}, ease: 'Cubic.easeIn'}),
                this._animations.applyTween('BasePosition', element, duration, delay, {from: {x: transformX, y: transformY}, ease: 'Sine.easeOut'})
            ], params);
        },

        group: ['entrance'],

        options: {
            hideOnStart: true,
            screenInThreshold: '15%',
            waitForPageTransition: true
        },

        _defaults: {
            direction: 'right'
        },

        _paramsMap: {
            top: {dx: '0', dy: '-1', distance: '60'},
            right: {dx: '1', dy: '0', distance: '120'},
            bottom: {dx: '0', dy: '1', distance: '60'},
            left: {dx: '-1', dy: '0', distance: '120'}
        }
    };
});
