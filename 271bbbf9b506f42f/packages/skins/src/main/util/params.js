/**
 * Created by eitanr on 8/20/14.
 */
define(['lodash', 'color', 'skins/util/skins', 'skins/util/evals'], function (_, color, skins, defaultEvaluators) {
    'use strict';

    var paramMutators = {
        //color
        "brightness": function (paramValue, brightness) {
            return paramValue.value(brightness * paramValue.hsv().v);
        },
        "alpha": function (paramValue, alpha) {
            return paramValue.alpha(alpha * paramValue.alpha());
        },
        //size
        "decrease": function (paramValue, decreaseFrom) {
            return _.parseInt(paramValue) - _.parseInt(decreaseFrom);
        },
        "increase": function (paramValue, increaseFrom) {
            return _.parseInt(paramValue) + _.parseInt(increaseFrom);
        },
        "multiply": function (paramValue, multiplyOn) {
            return _.parseInt(paramValue) * parseFloat(multiplyOn);
        },
        "max": function (paramValue, maxValue) {
            return Math.max(_.parseInt(paramValue), _.parseInt(maxValue));
        },
        "eval": function(paramValue, expression, evaluators) {
            return evaluators[expression](paramValue);
        }
    };

    function applyMutator(paramValue, mutator, evals) {
        if (paramMutators[mutator[0]]) {

            return paramMutators[mutator[0]].call(undefined, paramValue, mutator[1], evals);
        }
        return paramValue;
    }

    function handleColorParam(value, colors) {
        var colorParts = value.split("color_");
        if (colorParts.length === 2) {
            value = colors[_.parseInt(colorParts[1])];
        }
        if (_.includes(value, ",") && !_.includes(value, 'rgb')) {
            value = "rgba(" + value + ")";
        }
        return color(value);
    }

    function handleColorAlphaProp(value, paramName, paramsDefaults, styleData) {
        var mappedParamName = Array.isArray(paramsDefaults[paramName]) && paramsDefaults[paramName][0];
        var alphaProp = "alpha-" + (mappedParamName || paramName);

        var alpha = !_.isUndefined(styleData[alphaProp]) ? styleData[alphaProp] : paramsDefaults[alphaProp];
        if (!_.isUndefined(alpha)) {
            value = paramMutators.alpha(value, parseFloat(alpha));
        }

        return value;
    }

    function getCssUnits(cssValue) {
        var numericValue = _.parseInt(cssValue).toString();
        cssValue = cssValue.toString();

        if (isNaN(numericValue) || cssValue === numericValue) {
            return '';
        }

        return cssValue.substr(cssValue.indexOf(numericValue) + numericValue.length);
    }

    function getParamValue(paramName, styleData, paramsDefaults) {
        var paramValue = !_.isUndefined(styleData[paramName]) ? styleData[paramName] : paramsDefaults[paramName];

        if (!_.isArray(paramValue)) {
            return paramValue;
        }

        if (paramValue.length === 1) {
            return styleData[paramValue[0]] || paramsDefaults[paramValue[0]];
        }

        var units = '';
        paramValue = _.reduce(paramValue, function (sum, parameterName) {
            var paramVal = styleData[parameterName] || paramsDefaults[parameterName];
            units = units || getCssUnits(paramVal);
            return sum + _.parseInt(paramVal);
        }, 0);

        if (units === 'x') { //not sure its needed, possibly because of corrupted data
            units = 'px';
        }

        return paramValue + units;
    }

    function isBoxShadowOff(paramName, styleData, paramsDefaults) {
        var shadowOnProp = "boxShadowToggleOn-" + paramName;
        var isShadowOn = styleData[shadowOnProp] || paramsDefaults[shadowOnProp];
        return isShadowOn === "false";
    }

    function limitBorderRadius(paramValue) {
        //FF and IE don't support css numbers larger than 17895697 (0x1111111); We limit to 99999 for good measure's sake
        //Also, make the fix only if we're dealing with data from style, since we assume data from skin will be OK

        var borderRadius = '';
        _.forEach(paramValue.replace(/px/g, '').split(' '), function (br) {
            var brValue = Math.min(_.parseInt(br), 99999);
            borderRadius += ' ' + brValue + (brValue === 0 ? '' : 'px');
        });

        paramValue = borderRadius.substring(1);
        return paramValue;
    }

    function renderParam(paramName, skinData, styleData, colors, evaluators) {
        if (!skinData.params) {
            return '';
        }

        evaluators = evaluators || defaultEvaluators;

        var paramType = skinData.params[paramName];
        var isDefinedInStyleData = _.has(styleData, paramName);
        var paramValue = getParamValue(paramName, styleData, skinData.paramsDefaults);

        if (typeof paramValue === 'undefined' || !paramType) {
            return '';
        }

        switch (paramType) {
            case "BG_COLOR":
            case "COLOR":
            case "COLOR_ALPHA":
                paramValue = handleColorParam(paramValue, colors);
                paramValue = handleColorAlphaProp(paramValue, paramName, skinData.paramsDefaults, styleData);
                break;

            case "BORDER_RADIUS":
                if (styleData[paramName]) {
                    paramValue = limitBorderRadius(paramValue);
                }
                break;

            case "BOX_SHADOW":
                if (isBoxShadowOff(paramName, styleData, skinData.paramsDefaults)) {
                    return '';
                }
                break;

            default:
        }

        paramValue = applyMutators(paramName, paramValue, skinData.paramsMutators, isDefinedInStyleData, evaluators);

        return {
            type: paramType,
            value: paramValue
        };
    }

    function applyMutators(paramName, paramValue, paramsMutators, isDefinedInStyleData, evaluators) {
        if (paramsMutators && paramsMutators[paramName]) {
            //TODO: multiply multiple alpha mutators before applying (like in Audio3dPlayer)
            var mutators = paramsMutators[paramName];
            if (isDefinedInStyleData) {
                mutators = _.reject(mutators, 2);
            }
            return _.reduce(mutators, function(value, mutator) {
                return applyMutator(value, mutator, evaluators);
            }, paramValue);
        }
        return paramValue;
    }

    function getSkinParamActualValue(paramName, skinName, styleId, siteData) {
        var allThemes = siteData.getAllTheme(),
            myTheme = allThemes[styleId],
            styleData = myTheme.style.properties,
            themeData = allThemes.THEME_DATA,
            skinData = skins[skinName],
            param = renderParam(paramName, skinData, styleData, themeData.color, defaultEvaluators);

        return param ? _.parseInt(param.value) : 0;
    }

    function getSkinDefaultParams(skinName) {
        var skinData = skins[skinName];
        return skinData.paramsDefaults;
    }

    function getSkinExports(skinName) {
        var skinData = skins[skinName];
        return skinData.exports;
    }

    return {
        /***
         *
         * @param paramName
         * @param skinData
         * @param styleData
         * @param themeData
         * @param evals
         * @returns {*}
         */
        renderParam: renderParam,
        /**
         *
         * @param paramName
         * @param skinName
         * @param styleId
         * @param siteData
         * @returns {Number}
         */
        getSkinParamActualValue: getSkinParamActualValue,
        /**
         * @param skinName
         * @returns {*}
         */
        getSkinDefaultParams: getSkinDefaultParams,
        /**
         * @param skinName
         * @returns {*}
         */
        getSkinExports:getSkinExports
    };


});
