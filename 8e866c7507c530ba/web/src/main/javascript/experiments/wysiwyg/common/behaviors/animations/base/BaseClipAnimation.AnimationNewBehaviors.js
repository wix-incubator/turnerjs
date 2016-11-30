define.experiment.newAnimation('BaseClip.AnimationNewBehaviors', function() {
    return {
        init: function(animations) {
            this._animations = animations;
        },
        /**
         * Clip base animation object
         * @param {HTMLElement|String} elements DOM element or DOM Id
         * @param {Number} [duration=1.0]
         * @param {Number} [delay=0]
         * @param {Object} params
         * @param {Number|String} [params.from.clip]
         * @param {Number|String} [params.to.clip]
         * @returns {Tween}
         */
        animate: function(elements, duration, delay, params) {
            params = params ? _.cloneDeep(params) : {};

            params.duration = _.isNumber(parseFloat(duration)) ? duration : this._defaults.duration;
            params.delay = _.isNumber(parseFloat(delay)) ? delay : this._defaults.delay;

            params.data = params.data || {};
            params.data.elementClearParams = {
                elements: elements,
                types: [this._animations.ClearTypes.CSS_STYLE]
            };

            /**
             * Set CSS clipping rectangle for each element passed
             * using _animations.set  - (a required preliminary for animating clip) -
             * Since we are using _animations.set we must pass data.elementClearParams to each 'set' function
             * for the cssText value of each element to be saved without the clip property
             **/
            var tweens = [];
            elements = (elements.length) ? elements : [elements];

            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                var data = {
                    elementClearParams: {
                        elements: element,
                        types: [this._animations.ClearTypes.CSS_STYLE]
                    }
                };

                var clipRect = this._getClipRect(element);
                tweens.push(this._animations.set(element, {clip: clipRect, data: data}));
            }

            /**
             * Adding the actual 'Clip' animation params for designated element(s)
             **/
            tweens.push(this._animations.tween(elements, params, this._allowedParams));

            // the tween
            return this._animations.sequence(tweens, {data: params.data});
        },

        _getClipRect: function(element) {
            var compRect = element.getCoordinates(); // mootools
            var contentRect = element.getContentRect();

            var top = contentRect.top - compRect.top;
            var left = contentRect.left - compRect.left;
            var right = contentRect.width + left;
            var bottom = contentRect.height + top;

            return 'rect(' + [top, right, bottom, left].join('px,') + 'px)';
        },

        _defaults: {
            duration: 1.0,
            delay: 0
        },

        _allowedParams: ['clip'],

        group: ['base']
    };
});

