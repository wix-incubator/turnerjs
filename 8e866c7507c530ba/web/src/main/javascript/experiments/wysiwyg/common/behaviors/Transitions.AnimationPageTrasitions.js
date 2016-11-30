/** @class wysiwyg.common.behaviors.Transitions*/
define.experiment.newClass('wysiwyg.common.behaviors.Transitions.AnimationPageTransitions', function(classDefinition) {

    /** @type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Config', 'W.Utils']);

    def.fields({
        _definitions: {
            transitions: {}
        }
    });

    def.methods(/** @lends wysiwyg.common.behaviors.Transitions */{
        /**
         * Initialize Transitions Class
         * @param {wysiwyg.common.behaviors.Animations} animations
         */
        initialize: function(animations) {
           this._animations = animations;
        },

        /**
         * Get a transition definition
         * @param {String} name
         * @returns {Object|null} the animation definition (pointer NOT clone)
         */
        getTransitionDefinition: function(name) {

            if (!this._definitions.transitions[name]) {
                this._definitions.transitions[name] = define.getDefinition('transition', name, false, this._animations);
            }
            return this._definitions.transitions[name] || null;
        },

        /**
         * Get all transitions definitions
         * @returns {Object}
         */
        getAllTransitionDefinitions: function() {

            var allTransitions = define.getDefinition('transition');
            _.forEach(allTransitions, function(definition, name) {
                if (!this._definitions.transitions[name]) {
                    this.getTransitionDefinition(name);
                }
            }, this);
            return this._definitions.transitions;

        },

        /**
         * A shorthand to
         *      var a = behaviors.Transitions.getTransitionDefinition(TransitionName);
         *      a.init(params...);
         * @param {String} name
         * @param {HTMLElement} toPageNode DOM element to show
         * @param {HTMLElement} fromPageNode DOM element to hide
         * @param {Object} [params]
         * @returns {Tween|Sequence|null}
         */
        applyTransition: function(name, toPageNode, fromPageNode, params) {
            var transition = this.getTransitionDefinition(name);
            if (transition) {
                return transition.init(toPageNode, fromPageNode, params);
            }
            return null;
        },

        isReady: function() {
            return this._animations.isReady();
        },

        isTweening: function(element) {
            return this._animations.isTweening(element);
        }
    });
});