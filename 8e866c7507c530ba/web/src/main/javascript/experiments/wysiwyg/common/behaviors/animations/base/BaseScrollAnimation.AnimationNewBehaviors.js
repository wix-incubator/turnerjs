define.experiment.newAnimation('BaseScroll.AnimationPageTransitions', function() {
    return {
        init: function(animations) {
            this._animations = animations;
        },
        /**
         * Scroll the content of an element
         * @param {HTMLElement|String} elements DOM element or DOM Id
         * @param {Number} [duration=1.0]
         * @param {Number} [delay=0]
         * @param {Object} params
         * @param {Number|Object} params.to.scrollTo
         * @param {Number|Number} [params.to.scrollTo.x]
         * @param {Number|Number} [params.to.scrollTo.y]
         * @param {Number|Boolean} [params.to.autoKill=true] set to false so the scroll will continue even if interrupted
         * @returns {Sequence}
         */
        animate: function(elements, duration, delay, params) {
            params = params ? _.cloneDeep(params) : {};
            params.duration = _.isNumber(parseFloat(duration)) ? duration : this._defaults.duration;
            params.delay = _.isNumber(parseFloat(delay)) ? delay : this._defaults.delay;
            params = _.defaults(params, this._defaults.params);

            return this._animations.sequence([
                this._animations.tween(elements, params, this._allowedParams)
            ]);
        },

        _defaults: {
            duration: 1.0,
            delay: 0,
            params: {
                scrollTo: {x: 0, y: 0}
            }
        },

        _allowedParams: ['scrollTo', 'autoKill'],

        group: ['base']
    };
});