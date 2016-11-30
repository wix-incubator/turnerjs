/** @class wysiwyg.common.behaviors.Animations*/
define.Class('wysiwyg.common.behaviors.Animations', function(classDefinition) {

    /** @type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Config', 'W.Utils', 'W.Experiments']);
    def.utilize(['wysiwyg.common.behaviors.TweenEngine']);

    def.fields({
        _definitions: {
            animations: {}
        },
        _tweenEngine: null
    });

    def.methods(/** @lends wysiwyg.common.behaviors.Animations */{
        /**
         * Initialize Animations Class
         * @param {wysiwyg.common.behaviors.TweenEngine} tweenEngine
         */
        initialize: function(tweenEngine) {
            if (!tweenEngine) {
                tweenEngine = new this.imports.TweenEngine();
            }
            this._tweenEngine = tweenEngine;
        },

        /**
         * Facade to tweenEngine.tween function
         * @lends wysiwyg.common.behaviors.TweenEngine
         * @param {HTMLElement} element DOM element to animate
         * @param {Object} params the tween params passed by the animation resource
         * @param {Array} allowedAnimationParamsList a list of tween parameters allowed for this tween
         * @returns {Tween}
         */
        tween: function(element, params, allowedAnimationParamsList) {
            return this._tweenEngine.tween.apply(this._tweenEngine, arguments);
        },

        /**
         * Calls a tween of 0 seconds duration, equivalent to TweenMax 'set' just with our engine syntax and callbacks
         * @lends wysiwyg.common.behaviors.TweenEngine
         * @param {HTMLElement} element DOM element to animate
         * @param {Object} params the tween params passed by the animation resource
         * @param {Array} allowedAnimationParamsList a list of tween parameters allowed for this tween
         * @returns {Tween}
         */
        set: function(element, params, allowedAnimationParamsList) {
            var setParams = {delay: 0, duration: 0, to: _.cloneDeep(params)};
            return this.tween(element, setParams, allowedAnimationParamsList);
        },

        /**
         * Facade to tweenEngine.sequence function
         * @lends wysiwyg.common.behaviors.TweenEngine
         * @param {Array} tweensList an array of tweenEngine.tween tweens
         * @param {object} [params] extra tweenEngine parameters
         * @returns {Timeline}
         */
        sequence: function(tweensList, params) {
            return this._tweenEngine.sequence.apply(this._tweenEngine, arguments);
        },

        /**
         * Clear all animation properties from an element
         * Passed object can be an element id, and element instance a tween or a timeline
         * If the passed object is a tween or a timeline it is paused, killed and cleared.
         * if a timeline is passed will run recursively on all the elements tweened by this timeline
         * @param {Array|HTMLElement|Tween|Timeline} src
         */
        clear: function(src) {
            return this._tweenEngine.clear.apply(this._tweenEngine, arguments);
        },

        /**
         * Wrapper for tweenEngine addTicker
         * @param {Function} callback
         */
        addTickerEvent: function(callback) {
            this._tweenEngine.addTickerEvent(callback);
        },

        /**
         * Wrapper for tweenEngine removeTicker
         * @param {Function} callback
         */
        removeTickerEvent: function(callback) {
            this._tweenEngine.removeTickerEvent(callback);
        },

        /**
         * Get all animation definitions
         * @returns {Object}
         */
        getAllAnimationDefinitions: function() {
            var allAnimations = define.getDefinition('animation');

            _.forEach(allAnimations, function(definition, name) {
                if (!this._definitions.animations[name]) {
                    this.getAnimationDefinition(name);
                }
            }, this);
            return this._definitions.animations;

        },

        /**
         * Get an animation definition
         * @param {String} name
         * @returns {Object|null} the animation definition (pointer NOT clone)
         */
        getAnimationDefinition: function(name) {
            var animationDefinition, animationEditorPartDefinition;
            if (!this._definitions.animations[name]) {
                animationDefinition = define.getDefinition('animation', name, false);
                if (animationDefinition) {
                    animationDefinition.init(this);
                    animationDefinition = this.resources.W.Experiments.applyExperiments(name, animationDefinition, 'ExperimentAnimationPlugin', this);

                    if (this.resources.W.Config.env.$isEditorFrame) {
                        animationEditorPartDefinition = define.getDefinition('animationEditorPart', name);
                        animationEditorPartDefinition = this.resources.W.Experiments.applyExperiments(name, animationEditorPartDefinition, 'ExperimentAnimationEditorPartPlugin');
                    }
                }
                this._definitions.animations[name] = animationDefinition;
                if (animationDefinition && animationEditorPartDefinition) {
                    this._definitions.animations[name].editorPart = animationEditorPartDefinition;
                }
            }
            return this._definitions.animations[name] || null;
        },

        /**
         * A shorthand to
         *      var a = behaviors.Animations.getAnimationDefinition(AnimationName);
         *      a.init(params...);
         * @param {String} name
         * @param {HTMLElement} element DOM element to animate
         * @param {Number} [duration]
         * @param {Number} [delay]
         * @param {Object} [params]
         * @returns {Tween|Timeline|null}
         */
        applyTween: function(name, element, duration, delay, params) {
            var animation = this.getAnimationDefinition(name);
            if (animation) {
                return animation.animate(element, duration, delay, params);
            }
            return null;
        },

        /**
         * Hide an element based on the passed animation name.
         * Note: this function is "stupid" it doesn't check if this element is assigned with the animation.
         * @param {HTMLElement} element
         * @param {String} animationName
         */
        hideSingleElement: function(element, animationName) {
            var animation;

            if (this.isTweening(element)) {
                return;
            }

            if (!this.isReady()) {
                return;
            }

            animation = this.getAnimationDefinition(animationName);
            if (animation && animation.options && animation.options.hideOnStart) {
                element.addClass('hideForAnimation');
            }
        },

        /**
         * Remove the Hide className form an element
         * @param {HTMLElement} element
         * @param {String} behaviorName
         */
        unHideSingleElement: function(element) {
            if (element) {
                element.removeClass('hideForAnimation');
            }
        },

        /**
         * If the tweenEngine is ready, we are ready
         * @returns {null|*}
         */
        isReady: function() {
            return this._tweenEngine && this._tweenEngine.isReady();
        },

        /**
         * Return if the passed element is in the middle of an animation
         * @param {HTMLElement} element
         * @returns {boolean}
         */
        isTweening: function(element) {
            return this._tweenEngine.isTweening(element);
        }
    });
});