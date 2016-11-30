define.experiment.animation('BaseFade.AnimationNewBehaviors', function(){
    return {
        init: function(animations){
            this._animations = animations;
        },
        /**
        * Fade base animation object
        * @param {HTMLElement|String} elements DOM element or DOM Id
        * @param {Number} [duration=1.0]
        * @param {Number} [delay=0]
        * @param {Object} params
        * @param {Number|String} [params.from.opacity]
        * @param {Number|String} [params.to.opacity]
        * @param {Number|String} [params.lazy=false] GSAP 1.12.0 introduced 'lazy' rendering. we need the default to be false for opacity.
        * @returns {Tween}
        */
        animate: function(elements, duration, delay, params) {
            params = params ? _.cloneDeep(params): {};

            params.duration = _.isNumber(parseFloat(duration)) ? duration : this._defaults.duration;
            params.delay = _.isNumber(parseFloat(delay)) ? delay : this._defaults.delay;
            params.lazy = !!params.lazy;
            params.data = params.data || {};
            params.data.elementClearParams = {
                elements: elements,
                types: [this._animations.ClearTypes.CSS_STYLE]
            };

            return this._animations.tween(elements, params, this._allowedParams);
        },

        _defaults:{
            duration: 1.0,
            delay: 0
        },

        _allowedParams: ['opacity'],

        group: ['base']
    };
});
