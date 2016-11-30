define.experiment.animation('TurnIn.AnimationNewBehaviors', function() {
    return {
        init: function(animations) {
            this._animations = animations;
        },
        /**
         * TurnIn animation object
         * @param {HTMLElement} element DOM element to animate
         * @param {Number} [duration]
         * @param {Number} [delay]
         * @param {Object} [params]
         * @param {String} [params.direction=left] 'left' or 'right'
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
            var direction = (params.direction || this._defaults.direction).trim().toLowerCase();
            var origin = this._paramsMap[direction];

            // calc element from transform in respect to browser's view-port
            // browser's view-port width/height is the actual width/height excluding scrollBars
            var browserViewPortDim = {width: window.getSize().x, height: window.getSize().y};
            var elementViewPortDim = element.getBoundingClientRect();

            var transformX = (origin.dx > 0) ? (browserViewPortDim.width - elementViewPortDim.right) : (origin.dx * (elementViewPortDim.left));
            var transformY = Math.min(-1.5 * elementViewPortDim.height, Math.max(-300, -5.5 * elementViewPortDim.height));
            var transformRotate = ((origin.dx > 0) ? "+=" : "-=") + origin.angle;
            var bezierPath = [
                {x: origin.dx * elementViewPortDim.width, y: transformY},
                {x: transformX, y: transformY}
            ];

            // delete handled params (don't pass on)
            delete params.direction;

            // the tween
            return this._animations.sequence([
                this._animations.applyTween('BaseFade', element, duration, delay, {from: {opacity: 0}, ease: 'Linear.easeIn'}),
                this._animations.applyTween('BasePosition', element, duration, delay, {from: {bezier: {values: bezierPath, type: 'soft'}}, ease: 'Sine.easeOut', immediateRender: false}),
                this._animations.applyTween('BaseRotate', element, duration, delay, {from: {rotation: transformRotate}, ease: 'Sine.easeOut', immediateRender: false})
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
            left: { dx: '-1', angle: '90'},
            right: { dx: '1', angle: '90'}
        }
    };
});