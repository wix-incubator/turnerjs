define(['lodash', 'utils', 'TweenMax', 'TimelineMax', 'ScrollToPlugin', 'DrawSVGPlugin'], function(_, /** utils */ utils, tweenMax, TimelineMax) {
    "use strict";

    var _allowedTweenMaxParamsList = [
        //Basics
        'ease', 'duration', 'delay', 'to', 'from', 'repeat', 'yoyo', 'repeatDelay', 'easeParams', 'stagger', 'transformOrigin',
        //Advanced
        'clearProps', 'paused', 'overwrite', 'autoClear', 'parseTransform', 'fireUpdateCommand', 'data', 'elementClearParams', 'perspective', 'transformPerspective', 'immediateRender', 'callbacks', 'force3D', 'transformStyle'
    ];

    var _allowedTimelineMaxParamsList = [
        //Basics
        'delay', 'repeat', 'yoyo', 'repeatDelay', 'stagger',
        //Advanced
        'paused', 'align', 'tweens', 'autoClear', 'data', 'elementClearParams', 'callbacks'
    ];


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
     * @param                  {Array<String>} allowedAnimationParamsList a list of tween parameters allowed for this tween
     * @returns {TweenMax}
     */
    function tween(elements, params, allowedAnimationParamsList) {
        var tweenFunc;
        // We handle only Arrays
        if (!_.isArray(elements)) {
            if (elements instanceof window.NodeList) {
                elements = _.toArray(elements);
            } else {
                elements = [elements];
            }
        }

        params = params || {};
        params = _validateAnimationParams(params, [allowedAnimationParamsList, _allowedTweenMaxParamsList]);

        _assignCallbacks(params);

        if (params.from && params.to) {
            tweenFunc = _fromTo;
        } else if (params.from) {
            tweenFunc = _from;
        } else {
            tweenFunc = _to;
        }
        return tweenFunc(elements, params);
    }

    /**
     * Accepts a list of tweenMax arguments and returns a timeline with all the returned tweens timelined to the timeline 0 mark
     * Passed params are being validated and filtered against _allowedTimelineMaxParamsList list
     * @variation 3
     * @param                   {Array<tweenMax>} tweensAndtimelinesList an array of tweenMax and TimelineMax objects
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
     * @param                  {Array<String>} allowedAnimationParamsList a list of tween parameters allowed for this tween
     * @returns {TimelineMax}
     */

    function timeline(params, allowedAnimationParamsList) {
        params = _validateAnimationParams(params || {}, [allowedAnimationParamsList, _allowedTimelineMaxParamsList]);
        _assignCallbacks(params);
        return new TimelineMax(params);
    }

    /**
     * Calls a tween of 0 seconds duration, equivalent to TweenMax 'set' just with our engine syntax and callbacks
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Object} params the tween params passed by the animation resource (no need to 'to' or 'from', always defaults to 'to')
     * @returns {TweenMax}
     */
    function set(elements, params) {
        params = params ? _.cloneDeep(params) : {};
        params.duration = 0;
        params.delay = 0;
        params.to = params.to || {};
        return tween(elements, params, _.keys(params));
    }

    /**
     * Kill a tween or timeline and invoke a callback if passed
     * Before killing the animation set the position of the play head to the end of the animation (simulate completion)
     * @param {TweenMax|TimelineMax} src
     * @param {number} [seekTo] when stopping the animation - keep the components in their current state or seek to the end of the animation.
     */
    function kill(src, seekTo) {

        if (!src.paused()) {
            src.pause();
            _onInterruptHandler(src);
        }
        if (_.isNumber(seekTo)) {
            src.progress(seekTo, true);
        }
        src.kill();
        if (src.clear) {
            src.clear();
        }
    }

    /**
     * Adds a ticker ( wrapper for requestAnimationFrame / setTimeout 60FPS )
     * We are telling the browser that we wish to perform ( usually an animation ) and that the callback should be called before the next repaint
     * @param {Function} callback
     */
    function addTickerEvent(callback) {
        tweenMax.ticker.addEventListener('tick', callback);
    }

    /**
     * Removes the registered ticker function
     * @param {Function} callback
     */
    function removeTickerEvent(callback) {
        tweenMax.ticker.removeEventListener('tick', callback);
    }

    /**
     * Return if the passed element is in the middle of an animation
     * @param {HTMLElement} element
     * @returns {boolean}
     */
    function isTweening(element) {
        return tweenMax.isTweening(element);
    }

    /**
     * Set a new "from" animation, the animation will end at the default state of the element
     * a clone of the passed params object is saved on the tweenMax's 'data' object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element or DOM Id
     * @param {Object} params the parameters for the animation
     * @param {string|number} params.stagger use stagger
     * @returns {TweenMax}
     * @private
     */
    function _from(elements, params) {
        var duration, fromParams, tw, seq, stagger, data, delay;

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

            tw = tweenMax.staggerFrom(elements, duration, fromParams, stagger);
            seq = timeline({data: data, delay: delay}).add(tw);
        } else {
            tw = tweenMax.from(elements, duration, fromParams);
        }

        return seq || tw;
    }

    /**
     * Set a new "to" animation, the animation will start at the default state of the element
     * a clone of the passed params object is saved on the tweenMax's 'data' object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element or DOM Id
     * @param {Object} params the parameters for the animation
     * @param {string|number} params.stagger use stagger
     * @returns {TweenMax}
     * @private
     */
    function _to(elements, params) {
        var duration, toParams, tw, seq, stagger, data, delay;
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

            tw = tweenMax.staggerTo(elements, duration, toParams, stagger);
            seq = timeline({data: data, delay: delay}).add(tw);
        } else {
            tw = tweenMax.to(elements, duration, toParams);
        }

        return seq || tw;
    }

    /**
     * Set a new "fromTo" animation
     * a clone of the passed params object is saved on the tweenMax's 'data' object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element or DOM Id
     * @param {Object} params the parameters for the animation
     * @param {string|number} params.stagger use stagger
     * @returns {TweenMax}
     * @private
     */
    function _fromTo(elements, params) {
        var toParams, fromParams, duration, tw, seq, stagger, data, delay;

        duration = params.duration;
        stagger = params.stagger;
        delay = params.delay;

        fromParams = params.from;
        toParams = params.to;
        toParams.data = toParams.data || {};

        delete params.to;
        delete params.from;
        delete params.duration;
        delete params.stagger;
        delete toParams.duration;
        delete toParams.stagger;

        toParams = _.merge(toParams, params);

        if (typeof stagger !== 'undefined') {
            data = toParams.data;
            toParams.data = {};
            delete toParams.delay;

            tw = tweenMax.staggerFromTo(elements, duration, fromParams, toParams, stagger);
            seq = timeline({data: data, delay: delay}).add(tw);
        } else {
            tw = tweenMax.fromTo(elements, duration, fromParams, toParams);
        }

        return seq || tw;
    }

    function _assignCallbacks(params) {

        params.data = params.data || {};

        if (params.callbacks) {
            params.data.callbacks = {};
            if (params.callbacks.onComplete) {
                params.data.callbacks.onComplete = params.callbacks.onComplete;
                params.onComplete = _onCompleteHandler;
                params.onCompleteParams = ['{self}'];
            }
            if (params.callbacks.onReverseComplete) {
                params.data.callbacks.onReverseComplete = params.callbacks.onReverseComplete;
                params.onReverseComplete = _onReverseCompleteHandler;
                params.onReverseCompleteParams = ['{self}'];
            }
            if (params.callbacks.onStart) {
                params.data.callbacks.onStart = params.callbacks.onStart;
                params.onStart = _onStartHandler;
                params.onStartParams = ['{self}'];
            }
            if (params.callbacks.onUpdate) {
                params.data.callbacks.onUpdate = params.callbacks.onUpdate;
                params.onUpdate = _onUpdateHandler;
                params.onUpdateParams = ['{self}'];
            }
            if (params.callbacks.onInterrupt) {
                params.data.callbacks.onInterrupt = params.callbacks.onInterrupt;
            }
        }

        delete params.callbacks;

        return params;
    }

    /**
     * OnComplete callback for tweens and timelines
     * @param {TweenMax|TimelineMax} src
     * @private
     */
    function _onCompleteHandler(src) {
        _callHandlerIfExists(src, 'onComplete');
    }

    /**
     * OnReverseComplete callback for tweens and timelines
     * @param {TweenMax|TimelineMax} src
     * @private
     */
    function _onReverseCompleteHandler(src) {
        _callHandlerIfExists(src, 'onReverseComplete');
    }

    /**
     * OnStart callback for tweens and timelines
     * @param {TweenMax|TimelineMax} src
     * @private
     */
    function _onStartHandler(src) {
        _callHandlerIfExists(src, 'onStart');
    }

    /**
     * OnUpdate callback (will invoke every animationFrame) for tweens and timelines
     * @param {TweenMax|TimelineMax} src
     * @private
     */
    function _onUpdateHandler(src) {
        _callHandlerIfExists(src, 'onUpdate');
    }

    /**
     * OnUpdate callback (will invoke every animationFrame) for tweens and timelines
     * @param {TweenMax|TimelineMax} src
     * @private
     */
    function _onInterruptHandler(src) {
        _callHandlerIfExists(src, 'onInterrupt');
    }

    function _callHandlerIfExists(src, eventName) {
        if (_.isFunction(_.get(src, 'data.callbacks.' + eventName))) {
            src.data.callbacks[eventName](src);
        }
    }

    /**
     * Removes from the passed params object values that are not present in the union of allowedAnimationParamsList and this._allowedTweenMaxParamsList
     * @param {Object} params
     * @param {Array<Array<String>>} allowedAnimationParamsLists array of arrays of allowed params for this animation
     * @returns {Object}
     * @private
     */
    function _validateAnimationParams(params, allowedAnimationParamsLists) {

        var allowedParamsList = _.union.apply(_, allowedAnimationParamsLists);

        _.forEach(params, function(value, key, collection) {
            // If the parameter is 'to' of 'from' (for fromTo animations)
            // run validation on the second level
            if (key === 'to' || key === 'from') {
                _validateAnimationParams(collection[key], allowedAnimationParamsLists);
            } else if (!_.includes(allowedParamsList, key)) {
                delete collection[key];
            }
        }, this);
        return params;
    }

    function delayedCall(delay, callback, params, scope) {
        return tweenMax.delayedCall(delay, callback, params, scope);
    }

    /**
     *
     * @param src
     * @param {number} duration
     * @param {number} from
     * @param {number} to
     * @param {string} [easing=Linear.easeOut]
     * @param {{onStart:function, onUpdate:function, onComplete:function}} [callbacks]
     * @returns {*}
     */
    function animateTimeScale(src, duration, from, to, easing, callbacks) {
        var fromParams = {
            timeScale: from
        };
        var toParams = {
            timeScale: to,
            easing: easing || 'Linear.easeNone'
        };
        if (callbacks) {
            _.assign(toParams, callbacks);
        }
        if (from === 0 && src.paused()){
            src.play();
        }
        return tweenMax.fromTo(src, duration, fromParams, toParams);
    }

    /**
     * Utility function, USE WITH CAUTION.
     * see http://greensock.com/docs/#/HTML5/GSAP/TweenMax/static_lagSmoothing/
     * @param {number} threshold
     * @param {number} [adjustedLag] optional if threshold is 0;
     */
    function adjustLagSmoothing(threshold, adjustedLag){
        //tweenMax is not loaded on server side rendering and tests, so testing for existence
        if (typeof tweenMax.lagSmoothing === 'function'){
            tweenMax.lagSmoothing(threshold, adjustedLag);
        }
    }

    /**
     * Utility function, USE WITH CAUTION.
     * see http://greensock.com/docs/#/HTML5/All/TweenLite/ticker/
     * @param {boolean} isRaf
     */
    function useRAF(isRaf){
        if (tweenMax.ticker && typeof tweenMax.ticker.useRAF === 'function'){
            tweenMax.ticker.useRAF(isRaf);
        }
    }

    /**
     * @class core.animations.tweenEngineGreenSock
     */
    return {
        timeline: timeline,
        tween: tween,
        set: set,
        kill: kill,
        addTickerEvent: addTickerEvent,
        removeTickerEvent: removeTickerEvent,
        isTweening: isTweening,
        getElementRect: utils.domMeasurements.getElementRect,
        getContentRect: utils.domMeasurements.getContentRect,
        getBoundingRect: utils.domMeasurements.getBoundingRect,
        getBoundingContentRect: utils.domMeasurements.getBoundingContentRect,
        delayedCall: delayedCall,
        animateTimeScale: animateTimeScale,
        adjustLagSmoothing: adjustLagSmoothing,
        useRAF: useRAF
    };
});
