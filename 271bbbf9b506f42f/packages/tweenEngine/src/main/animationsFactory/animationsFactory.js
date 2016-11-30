define(['lodash', 'utils'], function(_, utils) {
    'use strict';

    /**
     * returns an animation factory constructor
     * @returns {{animate: animate, transition: transition, sequence: sequence, registerAnimation: registerAnimation, registerTransition: registerTransition, getProperties: getProperties, getAnimationsDefs: getAnimationsDefs, getTransitionsDefs: getTransitionsDefs}}
     * @constructor
     */
    function FactoryConstructor() {

        var animationsDefs = {};
        var transitionsDefs = {};

        /**
         * Start a new sequence
         * @param [params]
         * @constructor
         */
        function SequenceBuilder(params) {
            var baseSequence = 'BaseSequence'; // I have to use a var or ESLint will be mad.
            this.timeline = animationsDefs[baseSequence](params ? _.cloneDeep(params) : {});
        }

        /**
         * Add another animation, transition or sequence to the sequence
         * @param {TweenMax|TimelineMax|Array} tweens
         * @param {String|number} [position='+=0']
         * @param {String|number} [align='normal']
         * @returns {SequenceBuilder}
         */
        SequenceBuilder.prototype.add = function(tweens, position, align) {
            position = (typeof position === 'undefined') ? '+=0' : position;
            align = align || 'normal';
            this.timeline.add(tweens, position, align);
            return this;
        };

        /**
         * Get the real timeline attached to the sequence
         * @returns {TimelineMax}
         */
        SequenceBuilder.prototype.get = function() {
            return this.timeline;
        };

        /**
         * Instantiate a new SequenceBuilder
         * @variation 1
         * @param [params]
         * @returns {SequenceBuilder}
         */
        function sequence(params) {
            return new SequenceBuilder(params);
        }

        /**
         * Schedule an animation on an element
         * @variation 2
         * @param {String} name The name of the animation (ie. "FadeIn")
         * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
         * @param {Number} [duration=1] Animation Duration in seconds
         * @param {Number} [delay=0] The time to wait in seconds before starting the animation
         * @param {Object} [params] Additional parameters for the animation
         * @returns {TweenMax|TimelineMax|null} The animation function to schedule, null if this animation is not registered
         */

        function animate(name, elements, duration, delay, params) {
            var animationsDef = animationsDefs[name];
            if (!animationsDef) {
                utils.log.error('Warning:', name, 'is not a registered animation. skipping.');
                return null;
            }
            return animationsDef(elements, duration, delay, params ? _.cloneDeep(params) : {});
        }

        /**
         * Schedule an transition animation between two elements
         * The difference from "animate" is that "transition" functions receives two elements and animated between them.
         * @variation 2
         * @param {String} name The name of the animation (ie. "FadeIn")
         * @param {Array<HTMLElement>|HTMLElement} sourceElements DOM element to animate from
         * @param {Array<HTMLElement>|HTMLElement} destinationElements DOM element to animate to
         * @param {Number} [duration=1] Animation Duration in seconds
         * @param {Number} [delay=0] The time to wait in seconds before starting the animation
         * @param {Object} [params] Additional parameters for the animation
         * @returns {TimelineMax|null} The animation function to schedule, null if this animation is not registered
         */
        function transition(name, sourceElements, destinationElements, duration, delay, params) {
            var transitionsDef = transitionsDefs[name];
            if (!transitionsDef) {
                utils.log.error('Warning:', name, 'is not a registered transition. skipping.');
                return null;
            }
            return transitionsDef(sourceElements, destinationElements, duration, delay, params ? _.cloneDeep(params) : {});
        }

        /**
         * This function is used by animation and transition classes to register themselves on this animations instance
         * @param {string} animationName The public name of the animation which it will be called with
         * @param {function} animationFunc The animation function
         */
        function registerAnimation(animationName, animationFunc) {
            if (transitionsDefs[animationName]) {
                utils.log.error('Warning: there is already a transition with the name', animationName);
            }
            animationsDefs[animationName] = animationFunc;
        }

        /**
         * API Sugar. currently does the same as registerAnimation
         * This function is used by animation and transition classes to register themselves on this animations instance
         * @param {string} animationName The public name of the animation which it will be called with
         * @param {function} animationFunc The animation function
         */
        function registerTransition(transitionName, transitionFunc) {
            if (animationsDefs[transitionName]) {
                utils.log.error('Warning: there is already an animation with the name', transitionName);
            }
            transitionsDefs[transitionName] = transitionFunc;
        }

        /**
         * @typedef {object} AnimationProperties
         * @property {array<string>} groups        - Groups (or tags) this animation or transition is assigned to
         * @property {boolean} [hideOnStart]       - Animations only: Flag notating if this animation should hide the element before starting
         * @property {number} [defaultDuration]    - Transitions only: the default transition duration
         */
        /**
         * Get special properties for the passed animation or transition name
         * @param {string} name
         * @returns {AnimationProperties}
         */
        function getProperties(name) {
            return (animationsDefs[name] || transitionsDefs[name] || {}).properties || {};
        }

        function getAnimationsDefs() {
            return animationsDefs;
        }

        function getTransitionsDefs() {
            return transitionsDefs;
        }

        /**
         * @class core.animationsFactory
         */
        return {
            animate: animate,
            transition: transition,
            sequence: sequence,
            registerAnimation: registerAnimation,
            registerTransition: registerTransition,
            getProperties: getProperties,
            getAnimationsDefs: getAnimationsDefs,
            getTransitionsDefs: getTransitionsDefs
        };
    }
    return FactoryConstructor;
});
