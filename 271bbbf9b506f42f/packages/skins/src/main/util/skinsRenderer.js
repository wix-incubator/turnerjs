/**
 * Created with IntelliJ IDEA.
 * User: avim
 * Date: 5/27/14
 * Time: 8:17 AM
 * To change this template use File | Settings | File Templates.
 */
define(['lodash', 'react', 'fonts', 'skins/util/skins', 'utils', 'skins/util/params'],
    function (_, React, fonts, skins, utils, params) {
        'use strict';
        var plugins = [];
        var fontCss = fonts.fontCss;
        var cssUtils = utils.cssUtils;


        var TAG_INDEX = 0;
        var REF_INDEX = 1;
        var CLASS_INDEX = 2;
        var PROPS_INDEX = 3;
        var CHILDREN_START = PROPS_INDEX + 1;

        function scopeClassNames(classes, styleName) {
            var CLASS_PREFIX = '_';
            var GLOBAL_CLASS_PREFIX = CLASS_PREFIX + 'g!';
            return _.map(classes, function (cName) {
                if (_.startsWith(cName, GLOBAL_CLASS_PREFIX)) {
                    return cName.substr(GLOBAL_CLASS_PREFIX.length);
                }
                return styleName + cName;
            }).join(" ");
        }

        function renderSkinHtmlWithPlugins(skinTree, refData, styleName, rootId) {
            var children = [];
            for (var i = CHILDREN_START; i < skinTree.length; i++) {
                var childSkinTree = skinTree[i];
                if (_.isString(childSkinTree)) {
                    children.push(childSkinTree);
                } else {
                    var skinPartName = childSkinTree[1];
                    if (refData[skinPartName] !== 'remove') {
                        children.push(renderSkinHtmlWithPlugins(skinTree[i], refData, styleName, rootId));
                    }
                }
            }
            var parentConstructor = React.DOM[skinTree[TAG_INDEX]];
            var parentProps = _.clone(skinTree[PROPS_INDEX]);
            var classes = skinTree[CLASS_INDEX];
            if (classes) {
                classes = _.clone(classes);
            } else {
                classes = [];
            }
            var wrap;

            var index = skinTree[REF_INDEX];
            if (index !== null) {
                var data = refData[index];
                if (data) {
                    if (React.isValidElement(data)) {
                        return data;
                    }
                    _.forEach(data, function (refVal, refKey) {
                        switch (refKey) {
                            case 'parentConst':
                                parentConstructor = refVal;
                                break;
                            case 'children':
                                children = refVal;
                                break;
                            case 'addChildren':
                                children = children.concat(refVal);
                                break;
                            case 'addChildBefore':
                                var indexToInsertBefore = _.findIndex(children, {props: {refInParent: refVal[1]}});
                                if (indexToInsertBefore !== -1) {
                                    children.splice(indexToInsertBefore, 0, refVal[0]);
                                } else {
                                    children = children.concat(refVal[0]);
                                }
                                break;
                            case 'wrap':
                                wrap = refVal;
                                break;
                            default:
                                parentProps[refKey] = refVal;
                        }
                    });
                }
                parentProps.ref = index;
                parentProps.id = parentProps.id || rootId + index;
                classes.push(index);
            }
            if (classes.length) {
                var classesToAdd = scopeClassNames(classes, styleName);
                parentProps.className = parentProps.className ? parentProps.className + " " + classesToAdd : classesToAdd;
            }
            var res = parentConstructor.apply(null, [parentProps].concat(children));
            if (wrap) {
                res = wrap[0].apply(null, [wrap[1], res]);
            }
            return res;
        }

        function renderSkinHTML(skinTree, refData, styleName, rootId, structure, props, state) {
            var skinTreeWithParentDiv = ["div", "", [], {}].concat(skinTree || []);
            _.forEach(plugins, function (func) {
                func.call(this, refData, skinTreeWithParentDiv, structure, props, state);
            }, this);
            return renderSkinHtmlWithPlugins(skinTreeWithParentDiv, refData, styleName, rootId);
        }

        /**
         * Apply changes on a component from other plugins: preview, automation-qa, etc
         * @param func a function to run given the refData
         */
        function registerRenderPlugin(func) {
            if (typeof func === 'function') {
                plugins.push(func);
            }
        }

        function defaultToPixelUnits(propValue) {
            return isNaN(propValue) ? propValue : propValue + 'px';
        }

        /**
         * param types:
         * BG_COLOR
         * BORDER_RADIUS
         * BOX_SHADOW
         * FONT
         * SIZE
         * COLOR
         * COLOR_ALPHA
         * TRANSITION
         * URL
         * OTHER param type is not in use.
         *
         * @param paramValue
         * @param {string} paramType BORDER_RADIUS
         * @param themeData
         * @return {*}
         */
        function paramValueToCss(paramValue, paramType, themeData, mobileData, serviceTopology) {
            if (paramValue === undefined || paramValue === null) {
                return '';
            }

            switch (paramType) {
                case "BORDER_RADIUS":
                    paramValue = 'border-radius:' + paramValue + ";";
                    break;
                case "BOX_SHADOW":
                    paramValue = 'box-shadow:' + defaultToPixelUnits(paramValue) + ";";
                    break;
                case "FONT":
                    paramValue = 'font:' + fontCss.fontToCSSWithoutColor(paramValue, themeData);
                    break;
                case "FONT_FAMILY":
                    paramValue = 'font-family:' + fontCss.getFullFontFamily(paramValue) + ';';
                    break;
                case "SIZE":
                    paramValue = defaultToPixelUnits(paramValue);
                    break;
                case "COLOR":
                    paramValue = paramValue.hexString();
                    break;
                case "BG_COLOR":
                case "COLOR_ALPHA":
                    paramValue = paramValue.alpha() > 0 ? paramValue.rgbaString() : 'transparent';
                    break;
                case "TRANSITION":
                    paramValue = 'transition: ' + paramValue + ';'; //transition is now prefix free http://caniuse.com/#feat=css-transitions
                    break;
                case "INVERTED_ZOOM":
                    //paramValue = 'transform: scale(' + mobileData.getSiteZoomRatio() + ');';
                    paramValue = 'zoom: ' + mobileData.getSiteZoomRatio() + ';';
                    break;
                case "INVERTED_ZOOM_FIXED":
                    // delete INVERTED_ZOOM (above) after implementation
                    paramValue = 'zoom: ' + mobileData.getInvertedZoomRatio() + ';';
                    break;
                case "ORIENTATION_ZOOM_FIX":
                    paramValue = 'zoom: ' + mobileData.getOrientationZoomFixRation() + ';';
                    break;
                case "ZOOM_BY_SCREEN_PROPERTIES":
                    paramValue = 'zoom: ' + mobileData.getMobileZoomByScreenProperties() + ';';
                    break;
                case "URL":
                    if (paramValue === "BASE_THEME_DIRECTORY") {
                        return serviceTopology.scriptsLocationMap.skins + "/images/wysiwyg/core/themes/base/";
                    } else if (paramValue === "WEB_THEME_DIRECTORY") {
                        return serviceTopology.scriptsLocationMap.skins + "/images/wysiwyg/core/themes/viewer/";
                    }

                    return paramValue;
                case "ALPHA":
                    // do nothing
                    break;

            }
            return paramValue;
        }


        /**
         * Transform Media Object to Css Media Query
         *
         * @param skinData
         * @param styleData
         * @param themeData
         * @param styleName
         */
        function renderSkinMediaQueries(skinData, styleData, themeData, styleName) {
            if (!skinData.mediaQueries || !skinData.mediaQueries.length) {
                return '';
            }

            return _.map(skinData.mediaQueries, function (media) {
                var css = createSkinCss({css: media.css}, styleData, themeData, styleName);
                return [media.query, '{', css, '}'].join("");
            }).join("\n");
        }

        function getParamSplit(prop, skinData, styleProps, themeData, mobileData, serviceTopology) {
            var param = params.renderParam(prop, skinData, styleProps, themeData.color);
            var paramsSplit = param.type === 'SIZE' && _.isString(param.value) ? _.map(param.value.split(' '), function (value) {
                return {
                    value: value,
                    type: 'SIZE'
                };
            }) : [param];

            return _.map(paramsSplit, function (paramToMap) {
                return paramValueToCss(paramToMap.value, paramToMap.type, themeData, mobileData, serviceTopology);
            });
        }

        /***
         *
         * @param skinCssValue
         * @param skinData
         * @param styleProps
         * @param themeData
         * @param mobileData
         * @returns {string} the compiled css definitions without [p1] expressions
         */
        function handleParams(skinCssValue, skinData, styleProps, themeData, mobileData, serviceTopology) {
            return skinCssValue.replace(/\[(.*?)\]/g, function (full, prop) {
                var param = params.renderParam(prop, skinData, styleProps, themeData.color);
                return paramValueToCss(param.value, param.type, themeData, mobileData, serviceTopology);
            });
        }

        /***
         *
         * @param skinCssValue
         * @param skinData
         * @param styleProps
         * @param themeData
         * @param mobileData
         * @returns {string} the compiled css definitions without calc([p1] + [p2]) expressions
         */
        function handleCalcWithParams(skinCssValue, skinData, styleProps, themeData, mobileData, serviceTopology) {
            //e.g: replace calc([p1] - [p2]) when p1 is '10px 11px 12px 13px' and p2=3px, to "calc(10px - 3px) calc(11px - 3px) calc(12px - 3px) calc(13px - 3px)"
            //both p1 and p2 can be of multiple values
            return skinCssValue.replace(/calc\(\[([\w\d]+)\] ([-+*\/]) \[([\w\d]+)\]\)/g, function (full, prop1, calcSign, prop2) {
                var param1Split = getParamSplit(prop1, skinData, styleProps, themeData, mobileData, serviceTopology);
                var param2Split = getParamSplit(prop2, skinData, styleProps, themeData, mobileData, serviceTopology);

                var cssTemplate = _.template('calc(${p1} ${sign} ${p2})');
                var cssValue = [];

                for (var i = 0; i < Math.max(param1Split.length, param2Split.length); i++) {
                    cssValue.push(cssTemplate({
                        p1: param1Split[i] || param1Split[0],
                        p2: param2Split[i] || param2Split[0],
                        sign: calcSign
                    }));
                }

                return cssValue.join(' ');
            });
        }

        /***
         *
         * @param cssVal
         * @param prefix
         * @returns {*}
         */
        function handleAnimationReferences(cssVal, styleId) {
            return cssVal.replace(/((-webkit-)?animation(-name)?: ?)/mgi, '$1' + styleId + '_');
        }

        /***
         *
         * @param skinData
         * @param styleProps
         * @param themeData
         * @param styleId
         * @param mobileData
         * @returns {string} the compiled css definitions for the skin (after applying params, etc)
         */
        function renderSkinCssRules(skinData, styleProps, themeData, styleId, mobileData, serviceTopology) {
            return _.map(skinData.css, function (cssVal, cssSelector) {
                var prefix = cssSelector[0] === '@' ? styleId + '_' : '.' + styleId;
                cssSelector = cssSelector.replace(/%/g, prefix);

                cssVal = handleCalcWithParams(cssVal, skinData, styleProps, themeData, mobileData, serviceTopology);
                cssVal = handleParams(cssVal, skinData, styleProps, themeData, mobileData, serviceTopology);
                cssVal = handleAnimationReferences(cssVal, styleId);

                return cssSelector + " {" + cssVal + "}";

            }).join("\n");
        }


        function createSkinCss(skinData, styleProps, themeData, styleId, mobileData, serviceTopology) {
            var skinCss = renderSkinCssRules.apply(null, arguments) + renderSkinMediaQueries.apply(null, arguments);

            if (skinData.exports) {
                _.forEach(skinData.exports, function (compVal, compName) {
                    if (compVal.skin && skins[compVal.skin]) {
                        skinCss += "\n" + createSkinCss(skins[compVal.skin], styleProps, themeData, cssUtils.concatenateStyleIdToSkinPart(styleId, compName), mobileData, serviceTopology);
                    }
                });
            }
            return skinCss;
        }

        return {
            /***
             *
             * @param skinData
             * @param styleProps
             * @param themeData
             * @param styleId
             * @returns {string} the recursively-compiled css definitions for the skin (after applying params, media queries)
             */
            createSkinCss: createSkinCss,

            /***
             * create React DOM for render
             * @param skinTree
             * @param refData
             * @param styleName
             * @param rootId
             * @returns {*}
             * @private
             */
            renderSkinHTML: renderSkinHTML,
            /**
             * Apply changes on a component from other plugins: preview, automation-qa, etc
             * @param func a function to run given the refData
             *
             * When applying the plugin, func will be called with the following parameters:
             * func(refData, skinTree, structure, TAG_INDEX, REF_INDEX, CLASS_INDEX, CHILDREN_START)
             */
            registerRenderPlugin: registerRenderPlugin,
            TAG_INDEX: TAG_INDEX,
            REF_INDEX: REF_INDEX,
            CLASS_INDEX: CLASS_INDEX,
            CHILDREN_START: CHILDREN_START
        };
    });
