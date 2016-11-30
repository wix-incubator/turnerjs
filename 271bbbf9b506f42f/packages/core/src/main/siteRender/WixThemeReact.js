/**
 * Created with IntelliJ IDEA.
 * User: avim
 * Date: 6/9/14
 * Time: 3:48 PM
 * To change this template use File | Settings | File Templates.
 */
define([
    'zepto',
    'lodash',
    'react',
    'skins',
    'fonts',
    'utils',
    'core/fonts/fontsLoader',
    'reactDOM'
], function ($, _, React, skinsPackage, fontsPkg, utils, fontsLoader, ReactDOM) {
    'use strict';
    var TEST_NODE_NAME = 'testStyles';

    var fontUtils = fontsPkg.fontUtils;
    var fontCss = fontsPkg.fontCss;
    var uploadedFontsUtils = utils.fonts.uploadedFontsUtils;
    var cssUtils = utils.cssUtils;
    var skinsRenderer = skinsPackage.skinsRenderer;
    var skins = skinsPackage.skins;

    function getMobileIEFixCss(siteData) {
        var url = siteData.santaBase + '/static/css/mobileIEFix.css';
        return React.DOM.link({rel: "stylesheet", type: "text/css", href: url});
    }

    function generateStyleNode(key, content, styleRoot) {
        if (styleRoot) {
            content = _.map(content.trim().split("\n"), function (line) {
                var lineParts = line.split("{");
                var selectorParts = lineParts[0].split(",");
                lineParts[0] = _.map(selectorParts, function (part) {
                    return styleRoot + " " + part;
                });
                return lineParts.join("{");
            }, this).join("\n");
        }
        return React.DOM.style({type: "text/css", key: key, dangerouslySetInnerHTML: {__html: content || ''}});
    }


    function getThemeStyles(themeData, styleRoot) {
        var themeStyles = [];

            var fontStyle = fontCss.getThemeFontsCss(themeData.THEME_DATA.font, themeData.THEME_DATA.color);
            themeStyles.push(generateStyleNode("theme_fonts", fontStyle, styleRoot));

            var themeColorsStyle = cssUtils.getColorsCssString(themeData.THEME_DATA.color);
            themeStyles.push(generateStyleNode("theme_colors", themeColorsStyle, styleRoot));

        return themeStyles;
    }

    function getSkinStyle(themeData, skin, styleId, styleData, mobileData, styleRoot, serviceTopology) {
        var styleProps = _.get(styleData, 'style.properties') || {};
        var skinCSS = skinsRenderer.createSkinCss(skin, styleProps, themeData.THEME_DATA, styleId, mobileData, serviceTopology);
        return generateStyleNode(styleId, skinCSS, styleRoot);
    }

    function getSkinsStyles(themeData, loadedStyles, mobileData, styleRoot, serviceTopology) {
        var skinStyles = [];
        _.forEach(_.keys(loadedStyles), function (styleName) {
            var styleId = loadedStyles[styleName];
            var styleData = themeData[styleName];
            var skin = skins[styleData ? styleData.skin : styleName];

            if (skin) {
                skinStyles.push(getSkinStyle(themeData, skin, styleId, styleData, mobileData, styleRoot, serviceTopology));
            }
        }, this);

        skinStyles.push(getSkinStyle(themeData, skins['wysiwyg.viewer.skins.wixadsskins.WixAdsWebSkin'], 'wixAds', null, mobileData, styleRoot, serviceTopology));
        skinStyles.push(getSkinStyle(themeData, skins['wysiwyg.viewer.skins.MobileAppBannerBasicSkin'], 'mobileAppBanner', null, mobileData, styleRoot, serviceTopology));
        skinStyles.push(getSkinStyle(themeData, skins['skins.viewer.deadcomp.DeadCompPublicSkin'], 'deadComp', null, mobileData, styleRoot, serviceTopology));
        skinStyles.push(getSkinStyle(themeData, skins['wysiwyg.viewer.skins.siteBackgroundSkin'], 'siteBackground', null, mobileData, styleRoot, serviceTopology));
        skinStyles.push(getSkinStyle(themeData, skins['wysiwyg.viewer.skins.PasswordLoginSkin'], 'loginDialog', null, mobileData, styleRoot, serviceTopology)); //TODO: move to aspect

        // Load skin because popup overlay is dynamic and not in a structure
        var POPUP_OVERLAY_CONTAINER = utils.constants.POPUP.POPUP_OVERLAY_CONTAINER;
        skinStyles.push(getSkinStyle(themeData, skins[POPUP_OVERLAY_CONTAINER.SKIN], POPUP_OVERLAY_CONTAINER.STYLE_ID, null, mobileData, styleRoot, serviceTopology));

        return skinStyles;
    }

    function getTestStyle(testNodeIndex, styleRoot) {
        var css = (styleRoot ? styleRoot + " " : "") + "." + TEST_NODE_NAME + " {position:absolute; display: none; z-index: " + testNodeIndex + "}";
        return [React.DOM.style({type: "text/css", key: 'testStyle'}, css), React.DOM.div({
            'ref': TEST_NODE_NAME,
            'className': TEST_NODE_NAME
        })];
    }

    function getPropertySource(paramValue) {
        return /^(font|color)_[0-9]+$/.test(paramValue) ? 'theme' : 'value';
    }

    return React.createClass({
        displayName: 'WixThemeReact',
        getInitialState: function () {
            this.testNodeIndex = 0;
            this.waitingForStylesReady = false;
            this.registeredUsedFonts = [];
            return null;
        },

        render: function () {
            this.testNodeIndex = (this.testNodeIndex + 1) % 100;
            var childStyles = [
                {key: "theme"}
            ];
            var themeData = this.props.themeData;
            var siteData = this.props.siteData;
            var siteAPI = this.props.siteAPI;
            var siteStructure = this.props.masterPage.data.document_data.masterPage;
            if (themeData.THEME_DATA && themeData.THEME_DATA.font) {
                this.registerSkinsFontsUsage();
                if (siteData.getBrowser().ie && !siteData.isMobileView()) {
                    childStyles.push(getMobileIEFixCss(siteData));
                }
                childStyles = childStyles.concat(
                    getThemeStyles(themeData, this.props.styleRoot),
                    getSkinsStyles(themeData, this.props.loadedStyles, this.props.siteData.mobile, this.props.styleRoot, siteData.serviceTopology),
                    getTestStyle(this.testNodeIndex, this.props.styleRoot)
                );

                var renderedRootIds = siteAPI.getRootIdsWhichShouldBeRendered();
                childStyles = childStyles.concat(
                    this.getUploadedFontsStyles(renderedRootIds)
                );

                if (this.props.shouldRenderPage) {
                    childStyles = childStyles.concat(
                        this.getFontsCssLinks(siteData, siteStructure),
                        fontsLoader.getFontsLoaderNode(renderedRootIds, siteData, this.waitForStylesReady, 'fontsLoader')
                    );
                }
            }

            return React.DOM.div.apply(undefined, childStyles);
        },

        componentWillUnmount: function () {
            this.afterStylesReadyCallback = null;
            this.waitingForStylesReady = false;
        },

        registerStylesReadyCallback: function (stylesReadyCallback) {
            this.afterStylesReadyCallback = stylesReadyCallback;
        },

        initWaitForStylesReady: function () {
            if (!this.waitingForStylesReady) {
                this.waitForStylesReady();
            }
        },

        waitForStylesReady: function () {
            if (!this.isMounted()) {
                return;
            }
            var testNode = ReactDOM.findDOMNode(this.refs[TEST_NODE_NAME]);
            this.waitingForStylesReady = true;
            /*eslint eqeqeq:0*/
            var isStylesReadyCallbackRegistered = typeof this.afterStylesReadyCallback === "function";
            //the z-index is string number
            if ($(testNode).css('z-index') == this.testNodeIndex && isStylesReadyCallbackRegistered) {
                this.waitingForStylesReady = false;
                this.afterStylesReadyCallback();
            } else {
                utils.animationFrame.request(this.waitForStylesReady);
            }
        },

        getFontsCssLinks: function () {
            var siteData = this.props.siteData;

            var documentType = siteData.rendererModel.siteInfo.documentType;
            var cssUrls = fontUtils.getCssUrls(documentType, siteData.serviceTopology);
            //if (typeof window !== 'undefined') {
            //    // For CSS that have already been prefetched
            //    // just enable the existing <link> instead of creating new <link>
            //    // (by removing media="none" attribute)
            //    // See fontUtils.js
            //    cssUrls = _.pick(cssUrls, function (cssUrl, key) {
            //        var elem = document.getElementById('font_' + key);
            //        if (!elem) {
            //            return true;
            //        }
            //        elem.removeAttribute('media');
            //        return false;
            //    });
            //}
            return _.map(cssUrls, function (cssUrl, key) {
                return React.DOM.link({rel: "stylesheet", type: "text/css", href: cssUrl, key: key});
            });

        },

        getUploadedFontsStyles: function (renderedRootIds) {

            this.uploadedFonts = this.uploadedFonts || [];
            var self = this;
            var siteData = this.props.siteData;

            _.forEach(renderedRootIds, function (rootID) {
                self.uploadedFonts.push(fontUtils.getPageUsedFontsList(siteData, rootID));
            });

            if (this.skinsFonts) {
                this.uploadedFonts.push(this.skinsFonts);
            }

            var usedUploadedFonts = _(this.uploadedFonts).flatten().union().filter(function (fontFamily) {
                return uploadedFontsUtils.isUploadedFontFamily(fontFamily);
            }).value();

            var uploadedCss = uploadedFontsUtils.getUploadedFontFaceStyles(usedUploadedFonts, this.props.siteData.serviceTopology.mediaRootUrl);

            return generateStyleNode("uploadedFonts", uploadedCss);
        },


        registerSkinFontsUsage: function (generalThemeData, skin, styleData) {
            this.registerInnerSkinFontsUsage(generalThemeData, skin, styleData);
            if (skin.params) {
                var fontParamNames = _.keys(_.omit(skin.params, function (value) {
                    return value !== 'FONT';
                }));
                if (_.get(styleData, 'style.properties')) {
                    _.forEach(fontParamNames, function (paramName) {
                        var fontFamily = '';
                        var propertyValue = styleData.style.properties[paramName] || skin.paramsDefaults[paramName];
                        var propertySource = getPropertySource(propertyValue);

                        if (propertySource === 'value') {
                            fontFamily = fontUtils.parseFontStr(propertyValue).family.toLowerCase();
                        } else if (propertySource === 'theme') {
                            fontFamily = fontUtils.getFontFamilyByStyleId(generalThemeData, propertyValue);
                        }
                        if (fontFamily) {
                            this.registerSkinFontUsage(fontFamily);
                        }
                    }, this);
                }
            }
        },

        registerInnerSkinFontsUsage: function (generalThemeData, skin, styleData) {
            if (skin.exports) {
                _.forEach(skin.exports, function (childComp) {
                    if (childComp.skin && skins[childComp.skin]) {
                        this.registerSkinFontsUsage(generalThemeData, skins[childComp.skin], styleData);
                    }
                }, this);
            }
        },

        registerSkinsFontsUsage: function () {
            var themeData = this.props.themeData;
            _.forEach(_.keys(this.props.loadedStyles), function (styleName) {
                var styleData = themeData[styleName];
                var skin = skins[styleData ? styleData.skin : styleName];
                if (skin) {
                    this.registerSkinFontsUsage(themeData.THEME_DATA, skin, styleData);
                }
            }, this);
        },

        registerSkinFontUsage: function (fontFamily) {
            this.skinsFonts = _.union(this.skinsFonts, [fontFamily]);
        }
    });
});
