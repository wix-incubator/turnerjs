define.experiment.newAnimation('FlipIn.AnimationNewBehaviors', function() {
    return {
        init: function(animations) {
            this._animations = animations;
        },
        /**
         * FlipIn from opacity 0 animation object
         * @param {HTMLElement} element DOM element to animate
         * @param {Number} [duration]
         * @param {Number} [delay]
         * @param {Object} [params]
         * @param {String} [params.direction=left] 'top' or 'right' or 'bottom' or 'left'
         * @returns {Tween}
         */
        animate: function(element, duration, delay, params) {
            params = params ? _.cloneDeep(params) : {};

            //TODO: We need to fix or css cleaning technique. passing 'parent' currently solves a problem where
            //TODO: elementClearParams is only read one level down and if 'parent' was only declared in baseRotate3D they were never cleared
            //var parent = element.parentNode;

            params.data = params.data || {};
            params.data.elementClearParams = {
                elements: [element],//, parent],
                types: [this._animations.ClearTypes.CSS_STYLE]
            };

            // parse params
            params.direction = params.direction || this._defaults.direction;
            var elementAngleInDeg = element.$logic ? element.$logic.getAngle() : 0;
            var adjDirection = this._getAdjustedDirection(this._paramsMap[params.direction].idx, elementAngleInDeg);

            var fromParams = {rotationX: this._paramsMap[adjDirection].angleX, rotationY: this._paramsMap[adjDirection].angleY};

            // delete handled params (don't pass on)
            delete params.direction;

            // the tween
            return this._animations.sequence([
                this._animations.applyTween('BaseFade', element, duration * 0.25, delay,{from: {opacity: 0}, ease: 'Strong.easeIn'}),
                this._animations.applyTween('BaseRotate3D', element, duration * 0.75, delay, {from: fromParams, perspective: 800, fallbackFor3D: true, ease: 'Strong.easeIn'})
            ], params);
        },

        group: ['entrance', '3d'],

        options: {
            hideOnStart: true,
            screenInThreshold: '15%',
            waitForPageTransition: true
        },

        _defaults: {
            direction: 'left'
        },

        _paramsMap: {
            top: {angleX: '90', angleY: '0', idx: 0},
            right: {angleX: '0', angleY: '90', idx: 1},
            bottom: {angleX: '-90', angleY: '0', idx: 2},
            left: {angleX: '0', angleY: '-90', idx: 3}
        },

        _getAdjustedDirection: function(idx, angle) {
            var direction = ['top', 'right', 'bottom', 'left'];
            var shiftBy = Math.round(angle/90);

            idx = (idx + (direction.length - 1) * shiftBy) % direction.length;
            return direction[idx];
        }
    };
});