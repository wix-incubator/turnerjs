define.experiment.newAnimation('SlideIn.AnimationNewBehaviors', function() {
    return {
        init: function(animations) {
            this._animations = animations;
        },
        /**
         * SlideIn (Clip mask) animation object
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
            var elemAngleInRad = elemAngleInDeg * Math.PI / 180;
            var adjDirection = this._getAdjustedDirection(this._paramsMap[params.direction].idx, elemAngleInDeg);

            var fromClipParams = this._getClipTweenParams(element, adjDirection);
            var fromXYParams = this._getTransformTweenParams(element, this._paramsMap[adjDirection], elemAngleInRad);

            // delete handled params (don't pass on)
            delete params.direction;

            // the tween
            return this._animations.sequence([
                this._animations.applyTween('BaseFade', element, duration * 0.25, delay, {from: {opacity: 0}, ease: 'Cubic.easeInOut'}),
                this._animations.applyTween('BaseClip', element, duration, delay, {from: fromClipParams, ease: 'Cubic.easeInOut'}),
                this._animations.applyTween('BasePosition', element, duration, delay, {from: fromXYParams, ease: 'Cubic.easeInOut'})
            ], params);
        },

        group: ['entrance'],

        _defaults: {
            direction: 'left'
        },

        options: {
            hideOnStart: true,
            screenInThreshold: '15%',
            waitForPageTransition: true
        },

        _paramsMap: {
            top:    {dx: 0, dy: -1, idx:0},
            right:  {dx: 1, dy: 0, idx:1 },
            bottom: {dx: 0, dy: 1, idx:2 },
            left:   {dx: -1, dy: 0, idx:3 }
        },

        _getAdjustedDirection: function(idx, angle) {
            var direction = ['top', 'right', 'bottom', 'left'];
            var shiftBy = Math.round(angle/90);

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
                top: [bottom, '+=0', '+=0', '+=0'],
                right: ['+=0', left, '+=0', '+=0'],
                bottom: ['+=0', '+=0', top, '+=0'],
                left: ['+=0', '+=0', '+=0', right]
            };

            return {clip: 'rect(' + clipParams[direction].join('px,') + 'px)'};
        },

        _getTransformTweenParams: function(element, origin, angleInRad) {
            var contentRect = element.getContentRect();

            var width = contentRect.width;
            var height = contentRect.height;

            var x = origin.dy * (height) * Math.sin(-angleInRad) + origin.dx * (width) * Math.cos(angleInRad);
            var y = origin.dy * (height) * Math.cos(-angleInRad) + origin.dx * (width) * Math.sin(angleInRad);

            return {x: x, y: y};
        }
    };
});