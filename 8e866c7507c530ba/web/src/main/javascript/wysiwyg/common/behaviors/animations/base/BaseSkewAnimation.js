define.animation('BaseSkew', function(){
    return {
        init: function(animations){
            this._animations = animations;
        },
        /**
        * Skew animation object
        * @param {HTMLElement|String} element DOM element or DOM Id
        * @param {Number} [duration=1.0]
        * @param {Number} [delay=0]
        * @param {Object} params
        * @param {Number|String} [params.from.skewX]
        * @param {Number|String} [params.from.skewY]
        * @param {Number|String} [params.to.skewX]
        * @param {Number|String} [params.to.skewY]
        * @returns {Tween}
        */
        animate: function(element, duration, delay, params) {
            params = params || {};
            params.duration = _.isNumber(parseInt(duration)) ? duration : this._defaults.duration;
            params.delay = _.isNumber(parseInt(delay)) ? delay : this._defaults.delay;
            params = _.defaults(_.cloneDeep(params), this._defaults.params);

            return this._animations.tween(element, params, this._allowedParams);
        },

        _defaults:{
            duration: 1.0,
            delay: 0,
            params: {}
        },

        _allowedParams: ['skewX', 'skewY'],

        group: ['base']
    };
});