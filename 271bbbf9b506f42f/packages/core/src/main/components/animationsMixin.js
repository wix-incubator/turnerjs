define(['lodash', 'santaProps', 'animations', 'core/components/util/animationsQueueHandler'], function(_, santaProps, animations, /** core.animationsQueueHandler */queueHandler) {
    'use strict';

    var SantaTypes = santaProps.Types;

    /**
     * Sequence constructor.
     * @type core.animationsMixin.Sequence
     * @param {core.animationsMixin} comp
     * @constructor
     */
    function Sequence(comp) {
        this.comp = comp;
        this.animations = [];
        this.callbacks = {};
        this.id = _.uniqueId('seq_');
    }

    /**
     * Add a new animation or transition to the sequence
     * @param {{sourceRefs:Array<string|ReactCompositeComponent>|string|ReactCompositeComponent, destRefs:Array<string|ReactCompositeComponent>|string|ReactCompositeComponent|undefined}|Array<string>|string=""} refNames
     * The React.ref names of the elements to animate,
     * 1. empty string - uses the current component
     * 2. refName as string - uses the element the refName points to
     * 3. array of refNames - uses the list of elements pointed by the list of refNames
     * 4. an object with only 'sourceRefs' - does the same as the corresponding previous cases
     * 5. an object with both 'sourceRes' and 'destRefs'  - expect 'animationName' to be a transition animation and registers the animation as a transition
     * @param {string} animationName The name of the animation (or transition) to use
     * @param {number} duration The duration of the animation
     * @param {number} delay The time to wait before starting the animation
     * @param {object|function} [params] Optional parameters to pass to the animation, if passed a function, evaluated when playing the animation
     * @param {string|number} [position='+=0'] the position of the animation in the sequence, default is right after the end of the timeline
     *
     * @example
     * Allowed values:
     *   'SomeString'  - add a new label, or apply animation where a previous label is
     *   Number        - Number of seconds from the start of the sequence, 0 is the beginning of the sequence
     *   '+=N'/'-=N'   - Number of N seconds from the end the sequence
     *   'S-=N'/'S+=N' - Number of N seconds from label S in the sequence
     *   See http://greensock.com/docs/#/HTML5/GSAP/TimelineMax/add/ for clearer reference
     * @returns {Sequence} this instance
     */
    Sequence.prototype.add = function(refNames, animationName, duration, delay, params, position) {
        this.animations.push({
            refNames: refNames,
            animationName: animationName,
            duration: duration,
            delay: delay,
            params: params,
            position: position
        });
        //Chain
        return this;
    };
    /**
     * add a callback when all animations of this sequence complete
     * @param {function} callback
     * @returns {Sequence} this instance
     */
    Sequence.prototype.onCompleteAll = function(callback) {
        this.callbacks.onComplete = callback;
        //Chain
        return this;
    };
    /**
     * add a callback when a the reversed sequence arrives to the timeline's 0
     * @param {function} callback
     * @returns {Sequence} this instance
     */
    Sequence.prototype.onReverseAll = function(callback) {
        this.callbacks.onReverseComplete = callback;
        //Chain
        return this;
    };
    /**
     * add a callback when this sequence is interrupted and will never complete
     * @param {function} callback
     * @returns {Sequence} this instance
     */
    Sequence.prototype.onInterruptAll = function(callback) {
        this.callbacks.onInterrupt = callback;
        //Chain
        return this;
    };
    /**
     * add a callback when all animations of this sequence start
     * @param {function} callback
     * @returns {Sequence} this instance
     */
    Sequence.prototype.onStartAll = function(callback) {
        this.callbacks.onStart = callback;
        //Chain
        return this;
    };

    Sequence.prototype.onInit = function(callback) {
        this.callbacks.onInit = callback;
    };

    /**
     * Schedule this sequence to play
     * @param {object|function} [params] additional params to pass to the sequence
     * @returns {string} the sequence id
     */
    Sequence.prototype.execute = function(params) {
        this.comp.executeAnimationsWhenPossible(this.comp, this.id, this.animations, this.callbacks, params);
        return this.id;
        //TODO: should we kill this instance?
    };

    Sequence.prototype.getId = function() {
        return this.id;
    };

    Sequence.prototype.hasAnimations = function() {
        return !_.isEmpty(this.animations);
    };

    /**
     * @class core.animationsMixin
     */
    return {

        propTypes: {
            isSiteBusy: SantaTypes.isSiteBusy
        },

        getInitialState: function() {
            this._animationsQueue = [];
            this._liveSequences = {};
            this._isBusy = true;
            return null;
        },

        /**
         * Schedule a sequence of one or more animations and transitions
         * @param {core.animationsMixin} comp The animatable component that is the context of this animation
         * @param {String} id Animation id for future reference
         * @param {Array<{refNames:{sourceRefs:Array<string|ReactCompositeComponent>|string|ReactCompositeComponent, destRefs:Array<string|ReactCompositeComponent>|string|ReactCompositeComponent|undefined}|Array<string>|string="", animationName:String, duration:Number, delay:Number, params:Object, position:String|Number|null}>} anims An array of animation definition objects
         * @param {{onComplete:function, onStart:function, onInterrupt:function}|null} callbacks An object containing zero or more callbacks
         * @param [params] additional timelineparams
         */
        executeAnimationsWhenPossible: function(comp, id, anims, callbacks, params) {

            if (_.isEmpty(this._liveSequences)) {
                this._liveSequences = {};
            }
            if (_.isEmpty(this._animationsQueue)) {
                this._animationsQueue = [];
            }

            this._animationsQueue.push({comp: comp, id: id, animations: anims, callbacks: callbacks, params: params});
            if (!this.isBusy()) {
                queueHandler.flushQueue(this._animationsQueue, this._liveSequences);
            }
        },

        componentWillUpdate: function() {
            this._isBusy = true;
        },

        componentDidUpdate: function() {
            this._isBusy = false;
            if (!this.isBusy()) {
                queueHandler.flushQueue(this._animationsQueue, this._liveSequences);
            }
        },

        componentDidMount: function() {
            this._isBusy = false;
        },

        componentDidLayoutAnimations: function() {
            queueHandler.flushQueue(this._animationsQueue, this._liveSequences);
        },

        componentWillUnmount: function() {
            this._isBusy = true;
            this.clearAnimationsQueue(false);
        },

        /**
         * Stop and kill all active animations set by this component, be default seek to the end of the animation.
         * @param {boolean} [seekToEnd=true] Seek to end of the animation or leave the transformed values of the affected component as is.
         */
        clearAnimationsQueue: function(seekToEnd) {
            _.forEach(this._liveSequences, function(sequence) {
                animations.kill(sequence, seekToEnd ? 1 : undefined);
            });
            this._liveSequences = {};
            this._animationsQueue = [];
        },

        /**
         * return true if the component or the site are in a lifeCycle process (somewhere between 'render' and 'didLayout')
         * @returns {boolean}
         */
        isBusy: function() {
            var isSiteBusy = this.props.isSiteBusy || this.props.siteAPI.isSiteBusy; // siteAPI used in wixPageReact
            return !this.isMounted() || this._isBusy || isSiteBusy();
        },

        /**
         * Schedule a single animation on an element inside this component.
         * @variation 1
         * @borrows core.animationsMixin.sequence
         * @param {{sourceRefs:Array<string|ReactCompositeComponent>|string|ReactCompositeComponent, destRefs:Array<string|ReactCompositeComponent>|string|ReactCompositeComponent|undefined}|Array<string>|string=""} refNames
         * The React.ref names of the elements to animate,
         * 1. empty string - uses the current component
         * 2. refName as string - uses the element the refName points to
         * 3. array of refNames - uses the list of elements pointed by the list of refNames
         * 4. an object with only 'sourceRefs' - does the same as the corresponding previous cases
         * 5. an object with both 'sourceRefs' and 'destRefs'  - expect 'animationName' to be a transition animation and registers the animation as a transition
         * @param {string} animationName The name of the animation (or transition) to use
         * @param {number} duration The duration of the animation
         * @param {number} delay The time to wait before starting the animation
         * @param {object|function} [params] Optional parameters to pass to the animation, if passed a function evaluated when playing the animation
         * @param {{onStart:{function}, onComplete:{function}, onInterrupt:{function}}} [callbacks]
         * @returns {String} the sequence id
         */
        animate: function(refNames, animationName, duration, delay, params, callbacks) {

            var sequence = this.sequence(refNames, animationName, duration, delay, params);

            callbacks = callbacks || {};

            if (callbacks.onStart) {
                sequence.onStartAll(callbacks.onStart);
            }
            if (callbacks.onInterrupt) {
                sequence.onInterruptAll(callbacks.onInterrupt);
            }
            if (callbacks.onComplete) {
                sequence.onCompleteAll(callbacks.onComplete);
            }
            return sequence.execute();

        },

        /**
         * Schedule a single transition animation on two element inside this component.
         * variation 1
         * @borrows core.animationsMixin.animate
         * @param {Array<string|ReactCompositeComponent>|string|ReactCompositeComponent} sourceRefNames The React.ref names of the elements to animate from
         * @param {Array<string|ReactCompositeComponent>|string|ReactCompositeComponent} destinationRefNames The React.ref names of the elements to animate to
         * @param {string} animationName The name of the animation to call
         * @param {number} duration The duration of the animation
         * @param {number} delay The time to wait before starting the animation
         * @param {object|function} [params] Optional parameters to pass to the animation, if passed a function evaluated when playing the animation
         * @param {{onStart:{function}, onComplete:{function}, onInterrupt:{function}}} [callbacks]
         * @returns {String} the sequence id
         */
        transition: function(sourceRefNames, destinationRefNames, animationName, duration, delay, params, callbacks) {
            return this.animate({
                sourceRefs: sourceRefNames,
                destRefs: destinationRefNames
            }, animationName, duration, delay, params, callbacks);
        },

        /*eslint no-unused-vars:0*/
        /**
         * Initiate a sequence object of animations or transitions on one or more elements inside this component.
         * Arguments are optional for initiation, if passed than all arguments but 'params' are mandatory (same as 'animate' params)
         * Passing params is a shorthand to sequence().add(refNames, animationName, duration, delay, params)
         * To execute this animation, must finish with "execute()"
         * @example
         * sequence('SlideIn', target1, 1, 0, params2)
         *   .add('SlideIn', target2, 1, 0, params2, 0)
         *   .add('FadeOut', 1, 1, target2, params3, '+=0')
         *   .add('SpinOut', 2, 0, target, params4, 'someLabel')
         *   .add('Clip', target, ,1,1, params5 'someLabel')
         *   .onCompleteAll(someFunction, this)
         *   .execute(sequenceParams)
         * @variation 2
         * @see Sequence
         * @param {{sourceRefs:Array<string|ReactCompositeComponent>|string|ReactCompositeComponent, destRefs:Array<string|ReactCompositeComponent>|string|ReactCompositeComponent|undefined}|Array<string>|string=""} [refNames]
         * The React.ref names of the elements to animate,
         * 1. empty string - uses the current component
         * 2. refName as string - uses the element the refName points to
         * 3. array of refNames - uses the list of elements pointed by the list of refNames
         * 4. an object with only 'sourceRefs' - does the same as the corresponding previous cases
         * 5. an object with both 'sourceRes' and 'destRefs'  - expect 'animationName' to be a transition animation and registers the animation as a transition
         * @param {string} [animationName] The name of the animation (or transition) to use
         * @param {number} [duration] The duration of the animation
         * @param {number} [delay] The time to wait before starting the animation
         * @param {object|function} [params] Optional parameters to pass to the animation, if passed a function, evaluated when playing the animation
         * @returns {Sequence}
         */
        sequence: function(refNames, animationName, duration, delay, params) {
            var seq = new Sequence(this);
            if (arguments.length) {
                seq.add.apply(seq, arguments);
            }
            return seq;
        },

        /**
         * Get the tweenEngine instance of sequence with id
         * @param {string} id
         * @returns {TimelineMax}
         */
        getSequence: function(id) {
            return (id) ? this._liveSequences[id] : null;
        },

        /**
         * Kill a running animation and remove it from live animations list
         * @param {string} id
         * @param {number} [seekTo]
         */
        stopSequence: function(id, seekTo) {
            var sequence = this.getSequence(id);
            if (sequence) {
                animations.kill(sequence, seekTo);
                delete this._liveSequences[id];
            }
        },

        reverseSequence: function(id){
            var sequence = this.getSequence(id);
            if (sequence) {
                sequence.reversed(!sequence.reversed()); //todo Shimi_Liderman 24/03/2016 15:32 expose reverse in animations
            }
        },

        /**
         *
         * @param id
         * @param duration
         * @param [easing]
         * @param [callbacks]
         */
        easeStartSequence: function(id, duration, easing, callbacks) {
            var sequence = this.getSequence(id);
            if (sequence) {
                animations.animateTimeScale(sequence, duration, 0, 1, easing, callbacks);
            }
        },

        /**
         *
         * @param id
         * @param duration
         * @param [easing]
         * @param [callbacks]
         */
        easeStopSequence: function(id, duration, easing, callbacks) {
            var sequence = this.getSequence(id);
            var oldOnComplete;
            if (sequence) {
                callbacks = callbacks || {};
                oldOnComplete = callbacks.onComplete || function() {
                };
                callbacks.onComplete = function() {
                    oldOnComplete();
                    this.stopSequence(id);
                }.bind(this);

                if (!sequence.paused()) {
                    animations.animateTimeScale(sequence, duration, 1, 0, easing, callbacks);
                } else {
                    this.stopSequence(id);
                }
            }

        },

        /**
         * Get extra properties for animation or transition definition
         * @borrows animations.getProperty
         * @param {string} animationName
         * @returns {AnimationProperties}
         */
        getAnimationProperties: function(animationName) {
            return animations.getProperties(animationName);
        },

        addTickerEvent: animations.addTickerEvent,
        removeTickerEvent: animations.removeTickerEvent

    };
});
