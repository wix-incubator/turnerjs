/** @class wysiwyg.common.behaviors.TweenEngine */
define.Class('wysiwyg.common.behaviors.TweenEngine', function(classDefinition) {

    /** @type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Commands', 'TweenMax']);

    def.binds(['_onCompleteEvent', '_onStartEvent', '_onUpdateEvent']);

    def.statics({
        /**
         * Allowed parameters lists
         */
        _allowedTweenMaxParamsList: [
            //Basics
            'ease', 'duration', 'delay', 'to', 'from', 'repeat', 'repeatDelay', 'easeParams', 'stagger', 'transformOrigin', 'lazy',
            //Advanced
            'clearProps', 'paused', 'overwrite', 'autoClear', 'parseTransform', 'fireUpdateCommand', 'data', 'elementClearParams', 'perspective', 'transformPerspective', 'immediateRender', 'callbacks'
        ],

        _allowedTimelineMaxParamsList: [
            //Basics
            'delay', 'repeat', 'repeatDelay', 'stagger',
            //Advanced
            'paused', 'align', 'tweens', 'autoClear', 'data', 'elementClearParams', 'callbacks'
        ]
    });

    def.methods(/** @lends wysiwyg.common.behaviors.TweenEngine */{
        /**
         *
         * @param {TweenResource} tweenResource
         */
        initialize: function(tweenResource) {
            this.resources.W.Commands.registerCommand('TweenEngine.AnimationStart', true);
            this.resources.W.Commands.registerCommand('TweenEngine.AnimationComplete', true);
            this.resources.W.Commands.registerCommand('TweenEngine.AnimationInterrupted', true);

            if (typeof tweenResource === 'undefined') {
                tweenResource = this.resources.TweenMax;
            }
            this._tweenResource = tweenResource;

        },

        /**
         * Animate an element.
         * Passed params are being validated and filtered against _allowedTweenMaxParamsList list
         * @event TweenEngine.AnimationStart on animation start fires a TweenEngine.AnimationStart command
         * @event TweenEngine.AnimationComplete on animation complete fires a TweenEngine.AnimationComplete command
         * @event TweenEngine.AnimationInterrupted if animation is interrupted with tweenEngine.clear() method fires a TweenEngine.AnimationInterrupted command
         * @param {HTMLElement} element DOM element to animate
         * @param {Object} params the tween params passed by the animation resource
         * @param {Boolean} [params.autoClear=false] tells the tween to reset element original style on complete
         * @param {Array<String>} allowedAnimationParamsList a list of tween parameters allowed for this tween
         * @returns {Tween}
         */
        tween: function(element, params, allowedAnimationParamsList) {

            if (!this.isReady()) {
                return null;
            }

            element.removeClass('hideForAnimation');

            params = params || {};
            params = this._validateAnimationParams(_.cloneDeep(params), [allowedAnimationParamsList, this._allowedTweenMaxParamsList]);

            params.data = {};

            params.onComplete = this._onCompleteEvent;
            params.onCompleteParams = ['{self}'];

            params.onStart = this._onStartEvent;
            params.onStartParams = ['{self}'];

            if (params.fireUpdateCommand) {
                params.onUpdate = this._onUpdateEvent;
                params.onUpdateParams = ['{self}'];

            }

            if (params.autoClear) {
                params.data.autoClear = true;
                delete params.autoClear;
            }

            this._saveCssText(element);

            if (params.from && params.to) {
                return this._fromTo(element, params);
            }
            else if (params.from) {
                return this._from(element, params);
            }
            else if (params.to) {
                return this._to(element, params);
            }
            else {
                console.log('Missing to/from object in params. no tween started');
            }

        },

        /**
         * Accepts a list of tweenEngine.tween arguments and returns a timeline with all the returned tweens sequenced to the timeline 0 mark
         * Passed params are being validated and filtered against _allowedTimelineMaxParamsList list
         * @event TweenEngine.AnimationStart on animation start fires a TweenEngine.AnimationStart command
         * @event TweenEngine.AnimationComplete on animation complete fires a TweenEngine.AnimationComplete command
         * @event TweenEngine.AnimationInterrupted if animation is interrupted with tweenEngine.clear() method fires a TweenEngine.AnimationInterrupted command
         * @param {Array<Tween>} tweensList an array of TweenEngine.tween tweens
         * @param {Object} [params] extra tweenEngine parameters
         * @param {Boolean} [params.autoClear=false] tells the tween to reset all elements original style on complete
         * @returns {Timeline}
         */
        sequence: function(tweensList, params, allowedAnimationParamsList) {

            if (!this.isReady()) {
                return null;
            }

            params = params || {};
            params = this._validateAnimationParams(_.cloneDeep(params), [allowedAnimationParamsList, this._allowedTimelineMaxParamsList]);
            params.data = {};

            params.onComplete = this._onCompleteEvent;
            params.onCompleteParams = ['{self}'];

            params.onStart = this._onStartEvent;
            params.onStartParams = ['{self}'];

            if (params.fireUpdateCommand) {
                params.onUpdate = this._onUpdateEvent;
                params.onUpdateParams = ['{self}'];
            }

            if (params.autoClear) {
                params.data.autoClear = true;
                delete params.autoClear;
            }

            params.data.params = _.cloneDeep(params);

            var timeline = new this._tweenResource.timeline(params);
            return timeline.add(tweensList);
        },

        /**
         * Clear all animation properties from an element
         * Passed object can be an element id, and element instance a tween or a timeline
         * If the passed object is a tween or a timeline it is paused, killed and cleared.
         * if a timeline is passed will run recursively on all the elements tweened by this timeline
         * @param {Array|HTMLElement|Tween|Timeline} src
         * @param {Boolean} [silent=false] If true, doesn't broadcast AnimationInterrupted command
         */
        clear: function(src, silent) {
            var i = 0;
            if (!this.isReady()) {
                return null;
            }

            var element, tween, tweens, timeline;
            silent = !!silent;

            //If array or timeline Loop and return:

            //Array
            if (_.isArray(src)) {
                for (i = 0; i < src.length; i++) {
                    this.clear(src[i], true);
                }
                if (!silent) {
                    this.resources.W.Commands.executeCommand('TweenEngine.AnimationInterrupted', {type: 'TweenEngine.AnimationInterrupted', src: src, timeline: timeline, tweens: tweens}, 'TweenEngine');
                }
                return;
            }

            //Timeline
            if (src instanceof this._tweenResource.timeline) {
                timeline = src;
                timeline.pause();

                tweens = timeline.getChildren(true, true, false);

                tweens = _.uniq(tweens, false, function(tween) {
                    return tween.target.id;
                }, this);

                for (i = 0; i < tweens.length; i++) {
                    this.clear(tweens[i], true);
                }

                if (!silent) {
                    this.resources.W.Commands.executeCommand('TweenEngine.AnimationInterrupted', {type: 'TweenEngine.AnimationInterrupted', src: src, timeline: timeline, tweens: tweens}, 'TweenEngine');
                }
                timeline.clear();

                return;
            }

            //If element get element tweens and clear all:

            //HTMLElement
            else if (src instanceof HTMLElement) {
                element = src;
                tweens = this._tweenResource.tween.getTweensOf(element);
                this.clear(tweens, true);
                if (!silent) {
                    this.resources.W.Commands.executeCommand('TweenEngine.AnimationInterrupted', {type: 'TweenEngine.AnimationInterrupted', src: src, timeline: timeline, tweens: tweens}, 'TweenEngine');
                }
                return;
            }

            //If single tween

            //Tween
            else if (src instanceof this._tweenResource.tween) {
                tween = src;
                element = tween.target;
                tween.pause();
                tween.kill();
                if (!silent) {
                    this.resources.W.Commands.executeCommand('TweenEngine.AnimationInterrupted', {type: 'TweenEngine.AnimationInterrupted', src: src, timeline: null, tweens: [tween]}, 'TweenEngine');
                }
            }

//            else {
//                // src + ' is not something i can clear, expecting #id, element, tween or timeline
//                LOG.reportError('ABS_CANNOT_CLEAR_ELEMENT');
//            }

            if (element) {
                this._resetElementStyles(element);
            }
        },

        /**
         * Adds a ticker ( wrapper for requestAnimationFrame / setTimeout 60FPS )
         * We are telling the browser that we wish to perform ( usually an animation ) and that the callback should be called before the next repaint
         * @param {Function} callback
         */
        addTickerEvent: function(callback) {
            this._tweenResource.ticker.addEventListener('tick', callback);
        },

        /**
         * Removes the registered ticker function
         * @param {Function} callback
         */
        removeTickerEvent: function(callback) {
            this._tweenResource.ticker.removeEventListener('tick', callback);
        },

        /**
         * Return if the passed element is in the middle of an animation
         * @param {HTMLElement} element
         * @returns {boolean}
         */
        isTweening: function(element) {
            return this._tweenResource.tween.isTweening(element);
        },

        /**
         * If the tweenResource is ready, we are ready
         * @returns {null|*}
         */
        isReady: function() {
            return !!this._tweenResource;
        },

        /**
         * Set a new "from" animation, the animation will end at the default state of the element
         * a clone of the passed params object is saved on the tween's 'data' object
         * @param {HTMLElement|String} element DOM element or DOM Id
         * @param {Object} params the parameters for the animation
         * @returns {Tween}
         * @private
         */
        _from: function(element, params) {
            var fromParams = _.defaults(_.cloneDeep(params), params.from);
            var duration = fromParams.duration;
            fromParams.data = fromParams.data || {};
            fromParams.data.params = _.cloneDeep(params);

            delete fromParams.from;
            delete fromParams.duration;

            return this._tweenResource.from(element, duration, fromParams);
        },

        /**
         * Set a new "to" animation, the animation will start at the default state of the element
         * a clone of the passed params object is saved on the tween's 'data' object
         * @param {HTMLElement|String} element DOM element or DOM Id
         * @param {Object} params the parameters for the animation
         * @returns {Tween}
         * @private
         */
        _to: function(element, params) {
            var toParams = _.defaults(_.cloneDeep(params), params.to);
            var duration = toParams.duration;
            toParams.data = toParams.data || {};
            toParams.data.params = _.cloneDeep(params);

            delete toParams.to;
            delete toParams.duration;

            return this._tweenResource.to(element, duration, toParams);
        },

        /**
         * Set a new "fromTo" animation
         * a clone of the passed params object is saved on the tween's 'data' object
         * @param {HtmlElement|String} element DOM element or DOM Id
         * @param {Object} params the parameters for the animation
         * @returns {Tween}
         * @private
         */
        _fromTo: function(element, params) {
            var duration = params.duration;
            var fromParams = _.clone(params.from);
            var toParams = _.defaults(_.cloneDeep(params), params.to);
            toParams.data = toParams.data || {};
            toParams.data.params = _.cloneDeep(params);

            delete toParams.to;
            delete toParams.from;
            delete toParams.duration;

            return this._tweenResource.fromTo(element, duration, fromParams, toParams);
        },

        /**
         * Removes from the passed params object values that are not present in the union of allowedAnimationParamsList and this._allowedTweenMaxParamsList
         * @param {Object} params
         * @param {Array<String>} allowedAnimationParamsLists array of arrays of allowed params for this animation
         * @returns {Object}
         * @private
         */
        _validateAnimationParams: function(params, allowedAnimationParamsLists) {

            var allowedParamsList = _.union.apply(_, allowedAnimationParamsLists);

            _.forEach(params, function(value, key, collection) {
                // If the parameter is 'to' of 'from' (for fromTo animations)
                // run validation on the second level
                if (key === 'to' || key === 'from') {
                    this._validateAnimationParams(collection[key], allowedAnimationParamsLists);
                }
                else if (_.indexOf(allowedParamsList, key) < 0) {
                    delete collection[key];
                }
            }, this);
            return params;
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
         * Fire a 'TweenEngine.AnimationComplete' command every time a tween or a timeline starts
         * A side effect for this function is to call the 'clear' function if src.data.autoClear is truethy
         * @param {Tween|Timeline} src
         * @event 'TweenEngine.AnimationComplete' a command
         * @type {object}
         * @property {String} type 'TweenEngine.AnimationComplete'
         * @property {Timeline|null} timeline the timeline, null if not a timeline
         * @property {Array<Tween>} tweens array of tweens, if there is a timeline will recursively pass all timeline tweens (but not timelines) if there is no timeline will pass an array with one tween
         * @private
         */
        _onCompleteEvent: function(src) {
            var tweens, timeline;
            if (src instanceof this._tweenResource.tween) {
                timeline = null;
                tweens = [src];
            }
            else if (src instanceof this._tweenResource.timeline) {
                timeline = src;
                tweens = timeline.getChildren(true, true, false);
            }
            if (src.data.autoClear) {
                this.clear(src, true);
            }

            this.resources.W.Commands.executeCommand('TweenEngine.AnimationComplete', {type: 'TweenEngine.AnimationComplete', timeline: timeline, tweens: tweens}, 'TweenEngine');
        },

        /**
         * Fire a 'TweenEngine.AnimationStart' command every time a tween or a timeline starts
         * @param {Tween|Timeline} src
         * @event 'TweenEngine.AnimationStart' a command
         * @type {object}
         * @property {String} type 'TweenEngine.AnimationStart'
         * @property {Timeline|null} timeline the timeline, null if not a timeline
         * @property {Array<Tween>} tweens array of tweens, if there is a timeline will recursively pass all timeline tweens (but not timelines) if there is no timeline will pass an array with one tween
         * @private
         */
        _onStartEvent: function(src) {
            var tweens, timeline;
            if (src instanceof this._tweenResource.tween) {
                timeline = null;
                tweens = [src];
            }
            else if (src instanceof this._tweenResource.timeline) {
                timeline = src;
                tweens = timeline.getChildren(true, true, false);
            }

            this.resources.W.Commands.executeCommand('TweenEngine.AnimationStart', {type: 'TweenEngine.AnimationStart', timeline: timeline, tweens: tweens}, 'TweenEngine');
        },

        /**
         * Fire a 'TweenEngine.AnimationUpdate' command every time a tween or a timeline starts
         * @param {Tween|Timeline} src
         * @event 'TweenEngine.AnimationUpdate' a command
         * @type {object}
         * @property {String} type 'TweenEngine.AnimationUpdate'
         * @property {Timeline|null} timeline the timeline, null if not a timeline
         * @property {Array<Tween>} tweens array of tweens, if there is a timeline will recursively pass all timeline tweens (but not timelines) if there is no timeline will pass an array with one tween
         * @private
         */
        _onUpdateEvent: function(src) {
            var tweens, timeline;
            if (src instanceof this._tweenResource.tween) {
                timeline = null;
                tweens = [src];
            }
            else if (src instanceof this._tweenResource.timeline) {
                timeline = src;
                tweens = timeline.getChildren(true, true, false);
            }

            this.resources.W.Commands.executeCommand('TweenEngine.AnimationUpdate', {type: 'TweenEngine.AnimationUpdate', timeline: timeline, tweens: tweens}, 'TweenEngine');
        },

        /**
         * Save element.style.cssText to a property on the element's object
         * @param {HTMLElement} element
         * @param {string} element._gsCssText
         * @private
         */
        _saveCssText: function(element) {
            element = $(element);
            if (typeof element._gsCssText === 'undefined') {
                element._gsCssText = element.style.cssText;
            }
        },

        /**
         * match each key in the passed cssObject and replace its value
         * regexp:
         *   1. match: ([space | start] "key" spaces) for key
         *   2. match: (all characters, non greedy) for value
         *   3. look ahead: (stop at semicolon) terminate value search
         * @param {String} cssText
         * @param {Object} cssObject
         * @returns {String}
         * @private
         */
        _updateCssText: function(cssText, cssObject) {
            _.forEach(cssObject, function(value, key) {
                var matcher = new RegExp('((?:\\s|^)' + key + ':\\s*)(.*?)(?=;)');
                cssText = cssText.replace(matcher, '$1' + value);
            });
            return cssText;
        }

    });
});
