define.experiment.newAnimation('Reveal.AnimationNewBehaviors', function() {
    return {
        init: function(animations) {
            this._animations = animations;
        },
        /**
         * Reveal (Clip) animation object
         * @param {HTMLElement} element DOM element to animate
         * @param {Number} [duration]
         * @param {Number} [delay]
         * @param {Object} [params]
         * @param {String} [params.direction=left] 'top' or 'right' or 'bottom' or 'left'
         * @returns {Tween}
         */
        animate: function(element, duration, delay, params) {
            params = params ? _.cloneDeep(params) : {};

            params.data = params.data || {};
            params.data.elementClearParams = {
                elements: element,
                types: [this._animations.ClearTypes.CSS_STYLE]
            };

            // parse params
            params.direction = params.direction || this._defaults.direction;
            var elemAngleInDeg = element.$logic ? element.$logic.getAngle() : 0;
            //var elemAngleInRad = elemAngleInDeg * Math.PI / 180;
            var adjDirection = params.direction !== 'center' ? this._adjustDirection(this._paramsMap[params.direction].idx, elemAngleInDeg) : params.direction;

            var fromClipParams = this._getClipTweenParams(element, adjDirection);

            // delete handled params (don't pass on)
            delete params.direction;

            // the tween
            return this._animations.sequence([
                this._animations.applyTween('BaseFade', element, duration * 0.25, delay, {from: {opacity: 0}, ease: 'Cubic.easeInOut'}),
                this._animations.applyTween('BaseClip', element, duration, delay, {from: fromClipParams, ease: 'Cubic.easeInOut'})
            ], params);
        },

        group: ['entrance'],

        options: {
            hideOnStart: true,
            screenInThreshold: '15%',
            waitForPageTransition: true
        },

        _defaults: {
            direction: 'left'
        },

        _paramsMap: {
            top: {idx: 0},
            right: {idx: 1},
            bottom: {idx: 2},
            left: {idx: 3}
        },

        _adjustDirection: function(idx, angle) {
            var direction = ['top', 'right', 'bottom', 'left'];
            var shiftBy = Math.round(angle / 90);

            idx = (idx + (direction.length - 1) * shiftBy) % direction.length;

            return direction[idx];
        },

        _getClipTweenParams: function(element, direction) {
            var compRect = element.getCoordinates(); // mootools
            var contentRect = element.getContentRect();

            var top = contentRect.top - compRect.top;
            var left = contentRect.left - compRect.left;
            var right = contentRect.width + left;
            var bottom = contentRect.height + top;

            var clipParams = {
                top: ['+=0', '+=0', top, '+=0'],
                right: ['+=0', '+=0', '+=0', right],
                center: [(bottom + top) / 2, (right + left) / 2, (bottom + top) / 2, (right + left) / 2],
                bottom: [bottom, '+=0', '+=0', '+=0'],
                left: ['+=0', left, '+=0', '+=0']
            };

            return {clip: 'rect(' + clipParams[direction].join('px,') + 'px)'};
        }
    };
});

