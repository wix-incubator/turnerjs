/** @class wysiwyg.common.behaviors.Animations*/
define.experiment.Class('wysiwyg.common.behaviors.Animations.AnimationNewBehaviors', function(classDefinition, experimentStrategy) {

    /** @type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;
    var strategy = experimentStrategy;

    def.methods(/** @lends wysiwyg.common.behaviors.Animations */{

        initialize: strategy.after(function(tweenEngine) {
            this.utils = this._tweenEngine.utils;
            this.ClearTypes = this._tweenEngine.ClearTypes;
        }),

        /**
         * Facade to tweenEngine.tween function
         * @lends wysiwyg.common.behaviors.TweenEngine
         * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
         * @param {Object} params the tween params passed by the animation resource
         * @param {Array} allowedAnimationParamsList a list of tween parameters allowed for this tween
         * @returns {Tween}
         */
        tween: function(elements, params, allowedAnimationParamsList) {
            return this._tweenEngine.tween.apply(this._tweenEngine, arguments);
        },

        /**
         * Calls a tween of 0 seconds duration, equivalent to TweenMax 'set' just with our engine syntax and callbacks
         * @lends wysiwyg.common.behaviors.TweenEngine
         * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
         * @param {Object} params the tween params passed by the animation resource (no need to 'to' or 'from', always defaults to 'to')
         * @param {Array} [allowedAnimationParamsList] a list of tween parameters allowed for this tween
         * @returns {Tween}
         */
        set: function(elements, params) {
            params = params ?  _.cloneDeep(params) : {};
            params.duration = 0;
            params.delay = 0;
            params.to = params.to || {};
            return this.tween(elements, params, _.keys(params));
        }
    });
});