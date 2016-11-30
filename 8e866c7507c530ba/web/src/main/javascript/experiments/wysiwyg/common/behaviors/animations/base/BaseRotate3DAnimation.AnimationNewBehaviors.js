define.experiment.newAnimation('BaseRotate3D.AnimationNewBehaviors', function() {
    return {
        init: function(animations) {
            this._animations = animations;
        },
        /**
         * Rotate animation object
         * @param {HTMLElement|String} element DOM element or DOM Id
         * @param {Number} [duration=1.0]
         * @param {Number} [delay=0]
         * @param {Object} params
         * @param {Number} [params.perspective]
         * @param {Number|String} [params.from.rotationX] in Deg
         * @param {Number|String} [params.from.rotationY] in Deg
         * @param {Number|String} [params.from.rotationZ] in Deg
         * @param {Number|String} [params.to.rotationX] in Deg
         * @param {Number|String} [params.to.rotationY] in Deg
         * @param {Number|String} [params.to.rotationZ] in Deg
         * @param {boolean} [params.fallbackFor3D=false] Use 'scale' instead of 'rotate' to emulate 3d rotation on non supporting browsers. default is 'false'
         * @returns {Sequence}
         */
        animate: function(elements, duration, delay, params) {
            params = params ? _.cloneDeep(params) : {};
            params.duration = _.isNumber(parseFloat(duration)) ? duration : this._defaults.duration;
            params.delay = _.isNumber(parseFloat(delay)) ? delay : this._defaults.delay;
            params = _.defaults(params, this._defaults.params);

            elements = elements.length ? elements : [elements];
            var fallbackFor3D = !!params.fallbackFor3D;
            var perspective = params.perspective;
            delete params.perspective;
            delete params.fallbackFor3D;

            //TODO: We need to fix or css cleaning technique.
            //TODO: this setting is actually never read
            var parents = _.map(elements, function(element) {
                return element.parentNode;
            });

            params.data = params.data || {};
            params.data.elementClearParams = {
                elements: elements,//.concat(parents),
                types: [this._animations.ClearTypes.CSS_STYLE]
            };

            if (fallbackFor3D && !Modernizr.csstransforms3d) {
                this._applyFallbackFor3D(params);
            }

            return this._animations.sequence([
                this._animations.tween(elements, params, this._allowedParams),

//                this._animations.set($('bgNode'), {z: -1}), //Fix safari intersecting 3d transformations
                this._animations.set(parents, {zIndex: 0}), //Fix safari intersecting 3d transformations

                this._animations.set(elements, {transformPerspective: perspective})
            ], {data: params.data});
        },

        _applyFallbackFor3D: function(params) {
            _.forEach([params, params.to, params.from], function(param) {
                if (param && (param.rotationX || param.rotationY)) {
                    param.scaleY = param.rotationX && Math.abs(Math.cos(param.rotationX * Math.PI / 180));
                    param.scaleX = param.rotationY && Math.abs(Math.cos(param.rotationY * Math.PI / 180));
                    param.rotationX = undefined;
                    param.rotationY = undefined;

                }
            }, this);
            this._allowedParams = this._allowedParams.concat(['scaleX', 'scaleY']);
        },

        _defaults: {
            duration: 1.0,
            delay: 0,
            params: {
                perspective: 0
            }
        },

        _allowedParams: ['rotationX', 'rotationY', 'rotationZ'],

        group: ['base', '3d']
    };
});