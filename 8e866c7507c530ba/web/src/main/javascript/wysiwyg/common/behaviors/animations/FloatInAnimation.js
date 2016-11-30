define.animation('FloatIn', function(){
    return {
        init: function(animations){
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
            params = params || {};
            params.direction = (params.direction || "").trim().toLowerCase();

            // parse params
            var direction =  (params.direction in this._paramsMap) ? params.direction : this._defaults.direction;
            var fromParams = this._paramsMap[direction];

            // calc element transform in respect to browser's view-port
            // browser's view-port width/height is the actual width/height excluding scrollBars
            var browserViewPortDim = {width: window.getSize().x, height: window.getSize().y};
            var elementViewPortDim = element.getBoundingClientRect();

            var transformY = fromParams.dy * fromParams.distance;
            var transformX = fromParams.dx * ((fromParams.dx > 0) ? Math.max(0, Math.min(browserViewPortDim.width - elementViewPortDim.right, fromParams.distance))
                                                                  : Math.max(0, Math.min(elementViewPortDim.left, fromParams.distance)));

            // the tween
            return this._animations.sequence([
                this._animations.applyTween('BaseFade', element, duration, delay,{from: {opacity: 0},  ease: 'Cubic.easeIn'}),
                this._animations.applyTween('BasePosition', element, duration, delay, {from: {x: transformX, y: transformY}, ease: 'Sine.easeOut'})
            ], params);
        },

        group: ['entrance'],

        options: {
            hideOnStart: true,
            screenInThreshold: '15%',
            waitForPageTransition: true
        },

        _defaults:{
            direction: 'right'
        },

        _paramsMap:{
            left:   {dx: '-1', dy: '0', distance: '120'},
            right:  {dx: '1', dy: '0', distance: '120'},
            top:    {dx: '0', dy: '-1', distance: '60'},
            bottom: {dx: '0', dy: '1', distance: '60'}
        }
    };
});
