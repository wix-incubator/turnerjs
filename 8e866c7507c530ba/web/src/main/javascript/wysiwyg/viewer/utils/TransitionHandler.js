define.Class('wysiwyg.viewer.utils.TransitionHandler', function(def){

    def.binds(['_swipeHorizontalTransition', '_swipeHorizontalTransitionFullScreen',
        '_swipeVerticalTransition', '_swipeVerticalTransitionFullScreen',
        '_noTransition', '_inOutTransition', '_crossFadeTransition', '_shrinkFadeTransition',
        '_trackCallback']);

    def.fields({
        _useCSS3 : false,
        _frameRateTrackingActive : false,
        _frameRateCount : 0,
        _trackStartTime : 0
    });

    def.resources(['W.Utils']);

    def.methods({
        initialize : function () {
            this._Tween = this.resources.W.Utils.Tween;
        },
        getTransition : function (transitionID) {
            switch (transitionID) {
                case Constants.TransitionTypes.SWIPE_HORIZONTAL:
                    return this._swipeHorizontalTransition;

                case Constants.TransitionTypes.SWIPE_HORIZONTAL_FULLSCREEN:
                    return this._swipeHorizontalTransitionFullScreen;

                case Constants.TransitionTypes.SWIPE_VERTICAL:
                    return this._swipeVerticalTransition;

                case Constants.TransitionTypes.SWIPE_VERTICAL_FULLSCREEN:
                    return this._swipeVerticalTransitionFullScreen;

                case Constants.TransitionTypes.CROSS_FADE:
                    return this._crossFadeTransition;

                case Constants.TransitionTypes.SHRINK_FADE:
                    return this._shrinkFadeTransition;

                case Constants.TransitionTypes.OUT_IN:
                    return this._inOutTransition;

//                case Constants.TransitionTypes.NONE:
                default:
                    return this._noTransition;
            }
        },

        /**
         * @param {HTMLElement} container
         * @param {number} direction
         * @param {number} duration
         * @param {Function} onComplete
         */
        _noTransition : function(currentDiv, incomingDiv, direction, duration, onComplete) {
            onComplete();
        },

        _swipeHorizontalTransition : function(currentDiv, incomingDiv, direction, duration, onComplete) {
            var offset = currentDiv.getWidth();
            this._swipeHorizontalTransitionCommon(currentDiv, incomingDiv, direction, duration, offset, onComplete);
        },

        _swipeHorizontalTransitionFullScreen : function(currentDiv, incomingDiv, direction, duration, onComplete) {
            var currentDivCoord = currentDiv.getContentRect();
            var rightEdge = Math.max($(document).getSize().x - currentDivCoord.left, currentDivCoord.right);
            var offset = rightEdge - incomingDiv.getContentRect(incomingDiv).left;
            this._swipeHorizontalTransitionCommon(currentDiv, incomingDiv, direction, duration, offset, onComplete);
        },

        /**
         * @param {HTMLElement} container
         * @param {number} direction
         * @param {number} duration
         * @param {Function} onComplete
         */
        _swipeHorizontalTransitionCommon : function(currentDiv, incomingDiv, direction, duration, offset, onComplete) {
            var container = currentDiv.getParent();
            var transitionProp = this.injects().Utils.getCSSBrowserFeature('animation');
            var easeProp = this.injects().Utils.getCSSBrowserFeature('animation-timing-function');
            var transitionParams = {};
            currentDiv.setStyles({'position':'absolute'});
            incomingDiv.setStyles({'position':'absolute'});

            if (direction !== 0) {
                offset = -offset;
            }

            incomingDiv.setStyle("left", offset + "px");
            incomingDiv.setStyle("top", "0px");
            if (this._useCSS3 && transitionProp) {
                transitionParams["left"] = offset + "px";
                transitionParams["margin-left"] = String(-offset) + "px";
                transitionParams[transitionProp] = "swipeHoriz " + duration + "s";
                transitionParams[easeProp] = "ease-in-out";
                container.setStyles(transitionParams);
                setTimeout(function () {
                    container.setStyle(transitionProp, "");
                    container.setStyles({ "left": "0px", "margin-left": "0px"});
                    incomingDiv.setStyles({ "left": "0px" });
                    onComplete();
                }, 1000 * duration);
            } else {
                this._Tween.to(container, duration,
                    { left:String(-offset),
                        ease:"strong_easeInOut",
                        onComplete: function () {
                            incomingDiv.setStyles({ "left": "0px" });
                            container.setStyles({ "top":"0px", "left":"0px" });
                            onComplete();
                        }
                    });
            }
        },

        _swipeVerticalTransition : function(currentDiv, incomingDiv, direction, duration, onComplete) {
            var offset = currentDiv.getHeight();
            this._swipeVerticalTransitionCommon(currentDiv, incomingDiv, direction, duration, offset, onComplete);
        },

        _swipeVerticalTransitionFullScreen : function(currentDiv, incomingDiv, direction, duration, onComplete) {
            var offset = currentDiv.getCoordinates().top + incomingDiv.getHeight();
            this._swipeVerticalTransitionCommon(currentDiv, incomingDiv, direction, duration, offset, onComplete);
        },

        /**
         * @param {HTMLElement} container
         * @param {number} direction
         * @param {number} duration
         * @param {Function} onComplete
         */
        _swipeVerticalTransitionCommon : function(currentDiv, incomingDiv, direction, duration, offset, onComplete) {
            var container = currentDiv.getParent();
            var transitionProp = this.injects().Utils.getCSSBrowserFeature('animation');
            var easeProp = this.injects().Utils.getCSSBrowserFeature('animation-timing-function');
            var transitionParams = {};

            currentDiv.setStyles({'position':'absolute'});
            incomingDiv.setStyles({'position':'absolute'});

            if (direction !== 0) {
                offset = -offset;
            }

            incomingDiv.setStyle("top", offset + "px");
            incomingDiv.setStyle("left", "0px");

            if (this._useCSS3 && transitionProp) {
                transitionParams["top"] = offset + "px";
                transitionParams["margin-top"] = String(-offset) + "px";
                transitionParams[transitionProp] = "swipeVert " + duration + "s";
                transitionParams[easeProp] = "ease-in-out";
                container.setStyles(transitionParams);
                setTimeout(function () {
                    container.setStyle(transitionProp, "");
                    container.setStyles({ "top": "0px", "margin-top": "0px"});
                    incomingDiv.setStyles({ "top": "0px" });
                    onComplete();
                }, 1000 * duration);
            } else {
                this._Tween.to(container, duration,
                    { top:String(-offset),
                        ease:"strong_easeInOut",
                        onComplete: function () {
                            incomingDiv.setStyles({ "top": "0px" });
                            container.setStyles({ "top":"0px", "left":"0px" });
                            onComplete();
                        }
                    });
            }
        },

        /**
         * @param {HTMLElement} container
         * @param {number} direction
         * @param {number} duration
         * @param {Function} onComplete
         */
        _crossFadeTransition : function(currentDiv, incomingDiv, direction, duration, onComplete) {
            var transitionProp = this.injects().Utils.getCSSBrowserFeature('animation');
            currentDiv.setStyles({"position" : "absolute"});
            // The position 'relative' (= non-static) is important because of IE opacity bugs
            incomingDiv.setStyles({"position" : "relative", "top" : "0px", "left": "0px", 'opacity':'0.0' });

            if (this._useCSS3 && transitionProp) {
                currentDiv.setStyle(transitionProp, "fadeOut " + duration + "s");
                incomingDiv.setStyle(transitionProp, "fadeIn " + duration + "s");
                setTimeout(function () {
                    incomingDiv.setStyle(transitionProp, "");
                    currentDiv.setStyle(transitionProp, "");
                    incomingDiv.setStyles({"position" : "absolute"});
                    onComplete();
                }, 1000 * duration);
            }
            else {
                currentDiv.setStyles({"opacity" : "1.0"});
                incomingDiv.setStyles({"opacity" : "0.0", "visibility": "visible"});
                this._Tween.to(currentDiv, duration, {  opacity:0.0, ease:"swing" });
                this._Tween.to(incomingDiv, duration,
                    {   opacity:1.0,
                        ease:"swing",
                        onComplete: function () {
                            onComplete();
                        }
                    });
            }
        },

        /**
         * @param {HTMLElement} container
         * @param {number} direction
         * @param {number} duration
         * @param {Function} onComplete
         */
        _shrinkFadeTransition : function(currentDiv, incomingDiv, direction, duration, onComplete) {
            var size = currentDiv.getCoordinates();
            var container = currentDiv.getParent();
            currentDiv.setStyles({position: "absolute", "top" : "0px", "left": "0px" });
            incomingDiv.setStyles({position: "absolute", "top" : "0px", "left": "0px" });
            var maskDiv = new Element("div");
            maskDiv.setStyles({position: "absolute", width: size.width + "px", height: size.height + "px", 'overflow': "hidden" });
            container.adopt(maskDiv);
            maskDiv.adopt(currentDiv);

            this._Tween.to(maskDiv, duration,
                {
                    top: parseInt(size.height/2) + "px",
                    left: parseInt(size.width/2) + "px",
                    width:"0px",
                    height:"0px",
                    ease: "swing",
                    onComplete: function () {
                        maskDiv.getParent().adopt(currentDiv);
                        maskDiv.destroy();
                        onComplete();
                    }
                });
        },

        /**
         * @param {HTMLElement} container
         * @param {number} direction
         * @param {number} duration
         * @param {Function} onComplete
         */
        _inOutTransition : function(currentDiv, incomingDiv, direction, duration, onComplete) {
            var transitionProp = this.injects().Utils.getCSSBrowserFeature('animation');
            currentDiv.setStyles({"position" : "absolute"});
            // The position 'relative' (= non-static) is important because of IE opacity bugs
            incomingDiv.setStyles({"position" : "relative", "top" : "0px", "left": "0px", "opacity": "0.0", "visibility": "visible" });
            if (this._useCSS3 && transitionProp) {
                currentDiv.setStyle(transitionProp, "fadeOut " + duration + "s");
                incomingDiv.setStyle(transitionProp, "fadeIn " + duration + "s " + duration + "s");
                setTimeout(function () {
                    currentDiv.setStyle(transitionProp, "");
                    currentDiv.setStyles({"opacity" : "0.0"});
                    setTimeout(function () {
                        incomingDiv.setStyle(transitionProp, "");
                        incomingDiv.setStyles({"opacity" : "1.0"});
                        incomingDiv.setStyles({"position" : "absolute"});
                        onComplete();
                    }, 1000 * duration);
                }, 1000 * duration);
            }
            else {
                currentDiv.setStyles({"opacity" : "1.0"});
                incomingDiv.setStyles({"opacity" : "0.0", "visibility": "visible"});
                this._Tween.to(currentDiv, duration * 1.2, {   opacity:0.0, ease:"strong_easeOut"   });
                this._Tween.to(incomingDiv, duration,
                    {   opacity:1.0,
                        ease:"strong_easeIn",
                        onComplete: function () {
                            onComplete();
                        }
                    });
            }
        },

        /**
         * Used only for performance tests.
         * Simply put _startTracking() at the beginning of the transition
         * and _stopTracking() at the end.
         */


        _startTracking : function () {
            this._frameRateTrackingActive = true;
            this._frameRateCount = 0;
            this._trackStartTime = new Date().getTime();
            window.requestAnimFrame(this._trackCallback);
        },

        _stopTracking : function () {
            this._frameRateTrackingActive = false;
            var duration = (new Date().getTime() - this._trackStartTime) / 1000;
//            console.log("Transition framerate " + this._frameRateCount + ", " + duration + ", " + this._frameRateCount/duration);
        },

        _trackCallback : function () {
            this._frameRateCount++;
            if (this._frameRateTrackingActive) {
                window.requestAnimFrame(this._trackCallback);
            }
        }
    });

});
