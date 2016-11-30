define.experiment.animation('BaseRotate.AnimationNewBehaviors', function(){
    return {
        init: function(animations){
            this._animations = animations;
        },
        /**
        * Rotate animation object
        * @param {HTMLElement|String} elements DOM element or DOM Id
        * @param {Number} [duration=1.0]
        * @param {Number} [delay=0]
        * @param {Object} params
        * @param {Number|String} [params.from.rotation]
        * @param {Number|String} [params.to.rotation]
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

        _allowedParams: ['rotation'],

        group: ['base']
    };
});