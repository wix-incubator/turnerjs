define.experiment.animation('BasePosition.AnimationNewBehaviors', function() {
    return {
        init: function(animations){
            this._animations = animations;
        },
        /**
         * Glide base animation object
         * @param {HTMLElement|String} elements DOM element or DOM Id
         * @param {Number} [duration=1.0]
         * @param {Number} [delay=0]
         * @param {Object} params
         * @param {Number|String} [params.from.x]
         * @param {Number|String} [params.from.y]
         * @param {Number|String} [params.from.bezier]
         * @param {Number|String} [params.to.x]
         * @param {Number|String} [params.to.y]
         * @param {Number|String} [params.to.bezier]
         * @returns {Tween}
         */
        animate: function(elements, duration, delay, params) {
            params = params ? _.cloneDeep(params): {};

            params.duration = _.isNumber(parseFloat(duration)) ? duration : this._defaults.duration;
            params.delay = _.isNumber(parseFloat(delay)) ? delay : this._defaults.delay;

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

        _allowedParams: ['left', 'top', 'x', 'y', 'z', 'bezier'],

        group: ['base']
    };
});

