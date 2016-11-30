define(['lodash', 'zepto', 'coreUtils/core/animationFrame'], function (_, $, animationFrame) {
    'use strict';
    var activeTweens = [];

    function killAll() {
        while (activeTweens.length > 0) {
            killTween(activeTweens[0]);
        }
    }

    function killTweensOf(target) {
        if (typeof this.killTween === 'function') {
            _(activeTweens).filter({_target: target}).forEach(this.killTween).commit();
        }
    }

    function killTween(tween) {
        var index;
        tween.dispose();
        index = activeTweens.indexOf(tween);
        if (index !== -1) {
            activeTweens.splice(index, 1);
        }
    }

    function parseUnit(propValue) {
        var regex = /[^0-9-]+$/;
        if (regex.test(propValue) === true) {
            return String(String(propValue).match(regex)[0]);
        }
        return '';
    }

    function parseParameter(paramObj, paramName, defaultValue) {
        var result;
        if (paramObj[paramName] !== undefined) {
            result = paramObj[paramName];
            delete paramObj[paramName];
        } else {
            result = defaultValue;
        }
        return result;
    }


    function setStyle(propName, value, unit) {
        $(this._target).css(propName, String(value) + unit);
    }

    function setTargetProperty(propName, value) {
        this._target[propName] = value;
    }

    var easeFuncs = {
        linear: function linear(t, b, c, d) {
            return c * t / d + b;
        },
        strong_easeIn: function strong_easeIn(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },

        strong_easeOut: function strong_easeOut(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },

        strong_easeInOut: function strong_easeInOut(t, b, c, d) {
            if ((t /= d * 0.5) < 1) {
                return c * 0.5 * t * t * t * t * t + b;
            }
            return c * 0.5 * ((t -= 2) * t * t * t * t + 2) + b;
        },

        swing: function swing(t, b, c, d) {
            return ( -Math.cos((c * t / d + b) * Math.PI) / 2 ) + 0.5;
        }
    };


    var render = function render() {
        var obj;
        var value;
        if (this._isAlive) {
            var currentT = _.now();
            this._tStep = currentT - this._t0;
            this._t0 = currentT;
            this._t += this._tStep;
            for (var i = 0; i < this._easeParams.length; i++) {
                obj = this._easeParams[i];
                if (this._t < this._duration) {
                    value = this._easeFunc(this._t, 0, 1, this._duration) * (obj.targetValue - obj.origValue) + obj.origValue;
                } else {
                    value = obj.targetValue;
                }

                if (obj.unit) {
                    if (obj.unit === "px") {
                        value = Math.round(value);
                    }
                }
                this._setValueFunc(obj.propName, value, obj.unit);
                if (this._onUpdateCallback !== null) {
                    this._onUpdateCallback(value, this._target, obj.propName);
                }
            }

            if (this._t < this._duration) {
                animationFrame.request(render.bind(this));
            } else {
                if (this._onCompleteCallback !== null) {
                    this._onCompleteCallback(this);
                }
                killTween(this);
            }
        }
    };

    function startTween() {
        killTweensOf(this._target);
        activeTweens.push(this);
        this._t0 = _.now();
        animationFrame.request(render.bind(this));
    }


    function Tween(target, duration, params) {
        var easeParamObj, styleValue;
        this._target = target;
        this._duration = Math.floor(duration * 1000);
        this._easeParams = [];
        this._t = 0;
        this._tStep = null;
        this._isAlive = true;
        var isElement = (target instanceof window.HTMLElement);

        if (isElement) {
            this._setValueFunc = setStyle;
        } else {
            this._setValueFunc = setTargetProperty;
        }

        this._easeFunc = this.linear;
        var easeFuncName = parseParameter(params, "ease", "linear");
        if (easeFuncs[easeFuncName] !== undefined && typeof easeFuncs[easeFuncName] === "function") {
            this._easeFunc = easeFuncs[easeFuncName];
        }

        this._onCompleteCallback = parseParameter(params, "onComplete", null);
        this._onUpdateCallback = parseParameter(params, "onUpdate", null);
        var delay = parseParameter(params, "delay", 0);

        for (var propName in params) {
            if (isElement || target[propName] !== undefined) {
                easeParamObj = {};
                easeParamObj.propName = propName;

                if (isElement) {
                    styleValue = $(target).css(propName);
                    easeParamObj.origValue = parseFloat(styleValue);
                    easeParamObj.unit = parseUnit(styleValue);
                    if (isNaN(easeParamObj.origValue)) {
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

        if (delay === 0) {
            startTween.apply(this);
        } else {
            delay = parseInt(delay * 1000, 10);
            setTimeout(startTween.bind(this), delay);
        }
    }

    Tween.prototype.dispose = function () {
        this._isAlive = false;
        this._target = null;
        this._onCompleteCallback = null;
        this._onUpdateCallback = null;
    };


    return {
        killAll: killAll,
        killTweensOf: killTweensOf,
        killTween: killTween,
        Tween: Tween
    };
});
