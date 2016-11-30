define.experiment.newAnimation('DropIn.AnimationNewBehaviors', function(){
    return {
        init: function(animations){
            this._animations = animations;
        },
        /**
        * DropIn animation object
        * @param {HTMLElement} elements DOM element to animate
        * @param {Number} [duration]
        * @param {Number} [delay]
        * @param {Object} [params]
        * @returns {TimelineMax}
        */
        animate: function(element, duration, delay, params) {
            params = params ? _.cloneDeep(params): {};

            params.data = params.data || {};
            params.data.elementClearParams = {
                elements: element,
                types: [this._animations.ClearTypes.CSS_STYLE]
            };

            // the tween
            return this._animations.sequence([
                this._animations.applyTween('BaseFade', element, duration * 0.25, delay,{from: {opacity: 0}, ease: 'Sine.easeIn'}),
                this._animations.applyTween('BaseScale', element, duration, delay, {from: {scale: 6}, ease: 'Sine.easeIn'})
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
