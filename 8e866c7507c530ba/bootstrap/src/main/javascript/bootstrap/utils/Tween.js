/**
 *  TODO:
 *  * report mismatch between required and existing unit in styles
 */
window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

define.Class('bootstrap.utils.Tween', function(classDefinition){
    var def = classDefinition;
    def.statics( {
        _activeTweens: [],

        killAll: function () {
            while(this._activeTweens.length>0) {
                this.killTween(this._activeTweens[0]);
            }
        },

        /**
         *
         * @param target
         * @memberOf bootstrap.utils.Tween
         */
        killTweensOf: function (target) {
            var killList = [];
            this._activeTweens.forEach(
                function(tween) {
                    if(tween._target === target) {
                        killList.push(tween);
                    }
                });
            killList.forEach(
                function(tween) {
                    if(typeof this["killTween"] === 'function'){
                        this.killTween(tween);
                    }
                }
            );
        },

        /**
         *
         * @param tween
         * @memberOf bootstrap.utils.Tween
         */
        killTween: function (tween) {
            var index;

            tween.dispose();
            index = this._activeTweens.indexOf(tween);
            if(index != -1) {
                this._activeTweens.splice(index,1);
            }
        },

        /**
         *
         * @private
         */
        _startTween: function () {
            this.killTweensOf(this._target);
            this._activeTweens.push(this);
            this._t0 = this._getCurrentTime();
            window.requestAnimFrame(this._render.bind(this));
        },

        /**
         * Debug and Testing tools
         */

        debugMode: false,

        log: function () {},

        /**
         *
         * @param target
         * @param duration
         * @param params
         * @memberOf bootstrap.utils.Tween
         */
        to: function (target, duration, params) {
            var ClassDef = this;
            var inst = new ClassDef(target, duration, params);
        },

        /**
         *
         * @param from
         * @param to
         * @param duration
         * @param params
         * @memberOf bootstrap.utils.Tween
         */
        execute: function (from, to, duration, params) {
            params.myProp = to;
            var ClassDef = this;
            var inst = new ClassDef({ myProp:from }, duration, params);
        }
    });

    def.methods( /** @lends {bootstrap.utils.Tween.prototype} **/{
        /**
         *
         * @param target
         * @param duration
         * @param params
         * @constructs
         */
        initialize: function(target, duration, params) {
            var easeParamObj, styleValue;
            this._target = target;
            this._duration = Math.floor(duration * 1000);
            this._easeParams = [];
            this._t = 0;
            this._tStep = null;
            this._isAlive = true;
            var isElement = typeOf(target) == "element";

            if (isElement) {
                this._setValueFunc = this._setStyle;
            } else {
                this._setValueFunc = this._setTargetProperty;
            }

            this._easeFunc = this.linear;
            var easeFuncName = this._parseParameter(params, "ease", "linear");
            if(this[easeFuncName] !== undefined && typeOf(this[easeFuncName]) == "function") {
                this._easeFunc = this[easeFuncName];
            }

            this._onCompleteCallback = this._parseParameter(params, "onComplete", null);
            this._onUpdateCallback = this._parseParameter(params, "onUpdate", null);
            var delay = this._parseParameter(params, "delay", 0);

            for (var propName in params) {
                if(isElement || target[propName] !== undefined) {
                    easeParamObj = { };
                    easeParamObj.propName = propName;

                    if(isElement) {
                        styleValue = target.getStyle(propName);
                        easeParamObj.origValue = parseFloat(styleValue);
                        easeParamObj.unit = this._parseUnit(styleValue);
                        if(isNaN(easeParamObj.origValue)) {
                            // TODO: What if this is 'auto' ?
                            easeParamObj.origValue = 0;
                            easeParamObj.unit = "px";
                        }
                    } else {
                        easeParamObj.origValue = parseFloat(target[propName]);
                    }

                    easeParamObj.targetValue = parseFloat(params[propName]);
                    this._easeParams.push(easeParamObj);
                }
            }

            if(delay === 0) {
                this._startTween();
            } else {
                delay = parseInt(delay * 1000, 10);
                setTimeout(this._startTween.bind(this), delay);
            }
        },

        _parseUnit: function (propValue) {
            var regex = /[^0-9-]+$/;
            if(regex.test(propValue) === true) {
                return String(String(propValue).match(regex)[0]);
            } else {
                return "";
            }
        },

        _parseParameter: function (paramObj, paramName, defaultValue) {
            var result;
            if(paramObj[paramName] !== undefined) {
                result = paramObj[paramName];
                delete paramObj[paramName];
            } else {
                result = defaultValue;
            }
            return result;
        },

        _render: function () {
            var obj;
            var value;
            if(this._isAlive) {
                var currentT = this._getCurrentTime();
                this._tStep = currentT - this._t0;
                this._t0 = currentT;
                this._t += this._tStep;
                for (var i = 0; i < this._easeParams.length; i++) {
                    obj = this._easeParams[i];
                    if(this._t < this._duration) {
                        value = this._easeFunc(this._t, 0, 1, this._duration) * (obj.targetValue-obj.origValue) + obj.origValue;
                    } else {
                        value = obj.targetValue;
                    }

                    if (this.debugMode === true) {
                        this.log(this._tStep, this._t, value);
                    }

                    if(obj.unit) {
                        if(obj.unit == "px") {
                            value = Math.round(value);
                        }
                    }
                    this._setValueFunc(obj.propName, value, obj.unit);
                    if(this._onUpdateCallback !== null) {
                        this._onUpdateCallback(value, this._target, obj.propName);
                    }
                }

                if (this._t < this._duration) {
                    window.requestAnimFrame(this._render.bind(this));
                } else {
                    if(this._onCompleteCallback !== null) {
                        this._onCompleteCallback(this);
                    }
                    this.killTween(this);
                }
            }
        },

        // new Date().getTime() delegated for the sake of mocking (seriously)
        _getCurrentTime: function () {
            return new Date().getTime();
        },

        _setStyle: function (propName, value, unit) {
            this._target.setStyle(propName, String(value) + unit);
        },

        _setTargetProperty: function (propName, value) {
            this._target[propName] = value;
        },

        dispose: function () {
            this._isAlive = false;
            this._target = null;
            this._onCompleteCallback = null;
            this._onUpdateCallback = null;
        },

        /**
         * Ease functions
         *
         */

        linear: function (t, b, c, d) {
            return c * t / d + b;
        },


        strong_easeIn : function (t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },

        strong_easeOut: function (t, b, c, d) {
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        },

        strong_easeInOut: function (t, b, c, d) {
            if ((t/=d*0.5) < 1){ return c*0.5*t*t*t*t*t + b;}
            return c*0.5*((t-=2)*t*t*t*t + 2) + b;
        },

        swing: function (t, b, c, d) {
            return ( -Math.cos( this.linear(t,b,c,d)*Math.PI ) / 2 ) + 0.5;
        }
    });
});

