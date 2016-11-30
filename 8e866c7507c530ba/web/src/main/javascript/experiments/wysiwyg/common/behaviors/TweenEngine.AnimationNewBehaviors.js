/** @class wysiwyg.common.behaviors.TweenEngine */
define.experiment.Class('wysiwyg.common.behaviors.TweenEngine.AnimationNewBehaviors', function(classDefinition, experimentStrategy) {

    /** @type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;
    var strategy = experimentStrategy;

    def.statics({
        ClearTypes: {
            CSS_STYLE: 'resetStyle'
        }
    });

    def.binds(['_onCompleteHandler', '_onStartHandler', '_onUpdateHandler', '_onInterruptHandler']);

    def.methods({
        initialize: function(tweenResource) {
            if (typeof tweenResource === 'undefined') {
                tweenResource = this.resources.TweenMax;
            }
            this._tweenResource = tweenResource;
            /**
             * Utilities for animation
             */
            this.utils = {};
        },
        /**
         * Animate an element.
         * Passed params are being validated and filtered against _allowedTweenMaxParamsList list
         * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
         * @param                         {Object} params the tween params passed by the animation resource
         * @param                        {Boolean} [params.autoClear=false] tells the tween to reset element original style on complete
         * @param                         {Object} [params.elementClearParams] Which types of clearing to run over elements inside the tween
         * @param             {Array<HTMLElement>} [params.elementClearParams.elements] Which types of clearing to run over elements inside the tween
         * @param                  {Array<String>} [params.elementClearParams.types] Which types of clearing to run over elements inside the tween
         * @param                  {string|number} [params.stagger] stagger passed elements, also uses OnCompleteAll instead of onComplete
         * @param                       {Function} [params.callbacks.onStart]
         * @param                       {Function} [params.callbacks.onComplete]
         * @param                       {Function} [params.callbacks.onInterrupt]
         * @param                       {Function} [params.callbacks.onUpdate]
         * @param                 {Array.<String>} allowedAnimationParamsList a list of tween parameters allowed for this tween
         * @returns {Tween}
         */
        tween: function(elements, params, allowedAnimationParamsList) {
            var elementClearParams;
            if (!this.isReady()) {
                return null;
            }

            // We handle only Arrays
            if (_.isArray(elements) || elements instanceof NodeList) {
                elements = _.toArray(elements);
            }
            else {
                elements = [elements];
            }

            //Remove hide class
            _.forEach(elements, function(element) {
                element.removeClass('hideForAnimation');
            }, this);

            //Save css text
            elementClearParams = params.data && params.data.elementClearParams;
            if (elementClearParams && elementClearParams.elements && _.contains(elementClearParams.types, this.ClearTypes.CSS_STYLE)) {
                this._saveCssText(elementClearParams.elements);
            }
            params = params || {};
            params = this._validateAnimationParams(params, [allowedAnimationParamsList, this._allowedTweenMaxParamsList]);

            this._assignCallbacks(params);

            if (params.from && params.to) {
                return this._fromTo(elements, params);
            }
            else if (params.from) {
                return this._from(elements, params);
            }
            else {
                return this._to(elements, params);
            }

        },

        /**
         * Accepts a list of tweenEngine.tween arguments and returns a timeline with all the returned tweens sequenced to the timeline 0 mark
         * Passed params are being validated and filtered against _allowedTimelineMaxParamsList list
         * @param          {Array<Tween|Timeline>} tweensAndSequencesList an array of TweenEngine.tween and TweenEngine.timeline objects
         * @param                         {Object} [params] extra tweenEngine parameters
         * @param                        {Boolean} [params.autoClear=false] tells the tween to reset all elements original style on complete
         * @param                         {Object} [params.elementClearParams] Which types of clearing to run over elements inside the tween
         * @param             {Array<HTMLElement>} [params.elementClearParams.elements] Which types of clearing to run over elements inside the tween
         * @param                  {Array<String>} [params.elementClearParams.types] Which types of clearing to run over elements inside the tween
         * @param                  {string|number} [params.stagger] stagger passed elements, also uses OnCompleteAll instead of onComplete
         * @param                       {Function} [params.callbacks.onStart]
         * @param                       {Function} [params.callbacks.onComplete]
         * @param                       {Function} [params.callbacks.onInterrupt]
         * @param                       {Function} [params.callbacks.onUpdate]
         * @param                 {Array.<String>} allowedAnimationParamsList a list of tween parameters allowed for this tween
         * @returns {Timeline}
         */
        sequence: function(tweensAndSequencesList, params, allowedAnimationParamsList) {
            var elementClearParams;
            if (!this.isReady()) {
                return null;
            }

            //Save css text
            elementClearParams = params.data && params.data.elementClearParams;
            if (elementClearParams && elementClearParams.elements && _.contains(elementClearParams.types, this.ClearTypes.CSS_STYLE)) {
                this._saveCssText(elementClearParams.elements);
            }

            params = params || {};
            params = this._validateAnimationParams(params, [allowedAnimationParamsList, this._allowedTimelineMaxParamsList]);

            this._assignCallbacks(params);

            var timeline = new this._tweenResource.timeline(params);
            return timeline.add(tweensAndSequencesList);
        },

        /**
         * Clear all animation properties from an element
         * Passed object can be an element id, and element instance a tween or a timeline
         * If the passed object is a tween or a timeline it is paused, killed and cleared.
         * if a timeline is passed will run recursively on all the elements tweened by this timeline
         * @param {Array<Tween>|Array<Timeline>|Tween|Timeline} src
         * @param {Boolean} [silent=false] If true, doesn't broadcast AnimationInterrupted command
         */
        clear: function(src) {
            var tween, timeline, elementClearParams, i;

            if (!this.isReady()) {
                return null;
            }

            //Array
            if (_.isArray(src)) {
                for (i = 0; i < src.length; i++) {
                    this.clear(src[i]);
                }
            }

            //Timeline
            else if (src instanceof this._tweenResource.timeline) {
                timeline = src;
                elementClearParams = timeline.data && timeline.data.elementClearParams;

                if (!timeline.paused()) {
                    timeline.pause();
                    this._onInterruptHandler(timeline);
                }

                if (elementClearParams) {
                    this._clearElementByTypes(elementClearParams);
                }
                else {
                    this.clear(timeline.getChildren(false, true, true), false);
                }

                timeline.clear();
            }

            //Tween
            else if (src instanceof this._tweenResource.tween) {
                tween = src;
                elementClearParams = tween.data && tween.data.elementClearParams;

                if (!tween.paused()) {
                    tween.pause();
                    this._onInterruptHandler(tween);
                }

                tween.kill();

                if (elementClearParams) {
                    this._clearElementByTypes(elementClearParams);
                }
            }
        },

        _clearElementByTypes: function(elementClearParams) {
            var element, i, elements;

            elements = (elementClearParams.elements instanceof HTMLElement) ? [elementClearParams.elements] : elementClearParams.elements;

            if (_.contains(elementClearParams.types, this.ClearTypes.CSS_STYLE)) {
                for (i = 0; i < elements.length; i++) {
                    element = elements[i];
                    this._resetElementStyles(element);
                    }
                }
        },

        /**
         * Clears all tween information for the passed element and resets it's style to previously saved style
         * this is a GreenSock dependent function, and has a workaround for Wix components to handle layout change while animating
         * @param {HTMLElement} element
         * @param {Object} [element.$logic] Wix logic
         * @param {String} [element._gsCssText] saved css state
         * @private
         */
        _resetElementStyles: function(element) {
            var originalStyle = element._gsCssText;
            var logic = element.$logic;

            if (typeof originalStyle !== 'undefined') {
            if (logic) {
                    originalStyle = this._updateCssText(originalStyle, {top: logic.getY() + 'px'});
            }
            delete element._gsCssText;
            this._tweenResource.set(element, {clearProps: 'all'});
                element.style.cssText = originalStyle;
            }

//            delete element._gsTransform;
//            delete element._gsTweenID;
        },

        /**
         * Save element.style.cssText to a property on the element's object
         * @param {HTMLElement} element
         * @param {string} element._gsCssText
         * @private
         */
        _saveCssText: function(elements) {
            var element, i;
            elements = (elements instanceof HTMLElement) ? [elements] : elements;
            for (i = 0; i < elements.length; i++) {
                element = elements[i];
                if (typeof element._gsCssText === 'undefined') {
                    element._gsCssText = element.style.cssText;
            }
            }
        },

        /**
         * Set a new "from" animation, the animation will end at the default state of the element
         * a clone of the passed params object is saved on the tween's 'data' object
         * @param {Array<HTMLElement>|HTMLElement} elements DOM element or DOM Id
         * @param {Object} params the parameters for the animation
         * @param {string|number} params.stagger use stagger
         * @returns {Tween}
         * @private
         */
        _from: function(elements, params) {
            var duration, fromParams, tween, sequence, stagger, data, delay;

            duration = params.duration;
            stagger = params.stagger;
            delay = params.delay;

            fromParams = _.defaults(params, params.from);
            fromParams.data = fromParams.data || {};

            delete fromParams.from;
            delete fromParams.duration;
            delete fromParams.stagger;

            if (typeof stagger !== 'undefined') {
                data = fromParams.data;
                fromParams.data = {};
                delete fromParams.delay;

                tween = this._tweenResource.staggerFrom(elements, duration, fromParams, stagger);
                sequence = this.sequence(tween, {autoClear: fromParams.autoClear, data: data, delay: delay});
            }
            else {
                tween = this._tweenResource.from(elements, duration, fromParams);
            }

            return sequence || tween;
        },

        /**
         * Set a new "to" animation, the animation will start at the default state of the element
         * a clone of the passed params object is saved on the tween's 'data' object
         * @param {Array<HTMLElement>|HTMLElement} elements DOM element or DOM Id
         * @param {Object} params the parameters for the animation
         * @param {string|number} params.stagger use stagger
         * @returns {Tween}
         * @private
         */
        _to: function(elements, params) {
            var duration, toParams, tween, sequence, stagger, data, delay;
            duration = params.duration;
            stagger = params.stagger;
            delay = params.delay;

            toParams = _.defaults(params, params.to || {});
            toParams.data = toParams.data || {};

            delete toParams.to;
            delete toParams.duration;
            delete toParams.stagger;

            if (typeof stagger !== 'undefined') {
                data = toParams.data;
                toParams.data = {};
                delete toParams.delay;

                tween = this._tweenResource.staggerTo(elements, duration, toParams, stagger);
                sequence = this.sequence(tween, {autoClear: toParams.autoClear, data: data, delay: delay});
            }
            else {
                tween = this._tweenResource.to(elements, duration, toParams);
            }

            return sequence || tween;
        },

        /**
         * Set a new "fromTo" animation
         * a clone of the passed params object is saved on the tween's 'data' object
         * @param {Array<HTMLElement>|HTMLElement} elements DOM element or DOM Id
         * @param {Object} params the parameters for the animation
         * @param {string|number} params.stagger use stagger
         * @returns {Tween}
         * @private
         */
        _fromTo: function(elements, params) {
            var toParams, fromParams, duration, tween, sequence, stagger, data, delay;

            duration = params.duration;
            fromParams = params.from;
            stagger = params.stagger;
            delay = params.delay;

            toParams = _.defaults(params, params.to);
            toParams.data = toParams.data || {};

            delete toParams.to;
            delete toParams.from;
            delete toParams.duration;
            delete toParams.stagger;

            if (typeof stagger !== 'undefined') {
                data = toParams.data;
                toParams.data = {};
                delete toParams.delay;

                tween = this._tweenResource.staggerFromTo(elements, duration, fromParams, toParams, stagger);
                sequence = this.sequence(tween, {autoClear: toParams.autoClear, data: data, delay: delay});
            }
            else {
                tween = this._tweenResource.fromTo(elements, duration, fromParams, toParams);
            }

            return sequence || tween;
        },

        _assignCallbacks: function(params) {

            params.data = params.data || {};

            if (params.callbacks) {
                params.data.callbacks = {};
                if (params.callbacks.onComplete) {
                    params.data.callbacks.onComplete = params.callbacks.onComplete;
                    params.onComplete = this._onCompleteHandler;
                    params.onCompleteParams = ['{self}'];
                }
                if (params.callbacks.onStart) {
                    params.data.callbacks.onStart = params.callbacks.onStart;
                    params.onStart = this._onStartHandler;
                    params.onStartParams = ['{self}'];
                }
                if (params.callbacks.onUpdate) {
                    params.data.callbacks.onUpdate = params.callbacks.onUpdate;
                    params.onUpdate = this._onUpdateHandler;
                    params.onUpdateParams = ['{self}'];
                }
                if (params.callbacks.onInterrupt) {
                    params.data.callbacks.onInterrupt = params.callbacks.onInterrupt;
                }
            }
            if (params.autoClear) {
                params.data.autoClear = true;
                params.onComplete = this._onCompleteHandler;
                params.onCompleteParams = ['{self}'];
            }

            delete params.callbacks;
            delete params.autoClear;

            return params;
        },

        /**
         * OnComplete callback for tweens and timelines
         * @param {Tween|Timeline} src
         * @private
         */
        _onCompleteHandler: function(src) {
            if (src.data && src.data.callbacks && typeof src.data.callbacks.onComplete === 'function') {
                src.data.callbacks.onComplete(src);
            }
            if (src.data && src.data.autoClear) {
                this.clear(src);
            }
        },

        /**
         * OnStart callback for tweens and timelines
         * @param {Tween|Timeline} src
         * @private
         */
        _onStartHandler: function(src) {
            if (src.data && src.data.callbacks && typeof src.data.callbacks.onStart === 'function') {
                src.data.callbacks.onStart(src);
            }
        },

        /**
         * OnUpdate callback (will invoke every animationFrame) for tweens and timelines
         * @param {Tween|Timeline} src
         * @private
         */
        _onUpdateHandler: function(src) {
            if (src.data && src.data.callbacks && typeof src.data.callbacks.onUpdate === 'function') {
                src.data.callbacks.onUpdate(src);
            }
        },

        /**
         * OnUpdate callback (will invoke every animationFrame) for tweens and timelines
         * @param {Tween|Timeline} src
         * @private
         */
        _onInterruptHandler: function(src) {
            if (src.data && src.data.callbacks && typeof src.data.callbacks.onInterrupt === 'function') {
                src.data.callbacks.onInterrupt(src);
            }
        },

        onStartEvent: strategy.remove(),
        onUpdateEvent: strategy.remove(),
        onCompleteEvent: strategy.remove()
    });
})
;