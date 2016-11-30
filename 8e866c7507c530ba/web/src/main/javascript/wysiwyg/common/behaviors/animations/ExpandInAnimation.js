define.animation('ExpandIn', function(){
    return {
        init: function(animations){
            this._animations = animations;
        },
        /**
        * ExpandIn animation object
        * @param {HTMLElement} element DOM element to animate
        * @param {Number} [duration]
        * @param {Number} [delay]
        * @param {Object} [params]
        * @returns {TimelineMax}
        */
        animate: function(element, duration, delay, params) {
            params = params || {};

            // the tween
            return this._animations.sequence([
                this._animations.applyTween('BaseFade', element, duration, delay,{from: {opacity: 0}, ease: 'Cubic.easeIn'}),
                this._animations.applyTween('BaseScale', element, duration, delay, {from: {scale: 0}, ease: 'Sine.easeOut'})
            ], params);
        },

        group: ['entrance'],

        options: {
            hideOnStart: true,
            screenInThreshold: '15%',
            waitForPageTransition: true
        }
    };
});
