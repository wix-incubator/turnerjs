define.animation('SpinIn', function(){
    return {
        init: function(animations){
            this._animations = animations;
        },
        /**
        * SpinIn animation object
        * @param {HTMLElement} element DOM element to animate
        * @param {Number} [duration]
        * @param {Number} [delay]
        * @param {Object} [params]
        * @param {String} [params.direction=cw] 'cw' for clock wise or 'ccw' for counter clock wise
        * @param {Number} [params.cycles=5]
        * @returns {Timeline}
        */
        animate: function(element, duration, delay, params) {
            params = params || {};
            params.direction = (params.direction || "").trim().toLowerCase();
            params.cycles = !isNaN(params.cycles) ? params.cycles : this._defaults.cycles;

            // parse params
            var direction = (params.direction in this._paramsMap) ? params.direction : this._defaults.direction;
            var fromParams = _.clone(this._paramsMap[direction]);

            var transformRotate = ((fromParams.direction > 0) ? "+=" : "-=") + 360 * params.cycles;

            // the tween
            return this._animations.sequence([
                this._animations.applyTween('BaseFade', element, duration, delay,{from: {opacity: 0}, ease: 'Sine.easeIn'}),
                this._animations.applyTween('BaseScale', element, duration, delay, {from: {scale: 0}, ease: 'Sine.easeOut'}),
                this._animations.applyTween('BaseRotate', element, duration, delay, {from: {rotation: transformRotate}})
            ], params);
        },

        group: ['entrance'],

        options: {
            hideOnStart: true,
            screenInThreshold: '15%',
            waitForPageTransition: true
        },

        _defaults:{
            direction: 'cw',
            cycles: '5'
        },

        _paramsMap:{
            cw:   {direction: '-1'},
            ccw:  {direction: '1'}
        }
    };
});
