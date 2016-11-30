define(['lodash', 'utils', 'core'], function (_, utils, /** core */ core) {
    'use strict';

    var htmlParser = utils.htmlParser;

    function uglyTempFixClassNames(str) {
        var fixedStr = str;
        var classesToReplace = ["smallMusa", "smallLogo", "face", "cap", "spacer", "emphasis", "adFooterBox", "siteBanner", "bigMusa", "txt", "shd", "wrapper", "logoDot"];
        _.forEach(classesToReplace, function (key) {
            fixedStr = fixedStr.split(key).join('wixAds_' + key);
        });
        return fixedStr || '';
    }

    function normalizedTagOpen(output, tagName, attrs, unary) {
        var attrsStr = _.map(attrs, function (attrObj) {
            return attrObj.name + "='" + attrObj.escaped + "'";
        }).join(" ");
        output.push("<" + tagName + " " + attrsStr + (unary ? "/" : "") + ">");
    }

    function normalizedTagEnd(output, tagName) {
        output.push("</" + tagName + ">");
    }

    function normalizedTagChars(output, text) {
        output.push(text);
    }

    function normalizeCrappyHtml(str) {
        var output = [];
        htmlParser(str, {
            start: normalizedTagOpen.bind(null, output),
            end: normalizedTagEnd.bind(null, output),
            chars: normalizedTagChars.bind(null, output)
        });
        return output.join("");
    }

    function shouldHideAd (){
        return this.props.siteData.isFacebookSite() && this.props.siteData.rendererModel.premiumFeatures.length > 0;
    }

    /**
     * @class components.WixAdsDesktop
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */
    return {
        displayName: "WixAdsDesktop",
        mixins: [core.compMixins.skinBasedComp],

        getInitialState: function () {
            this.onAdClick = this.onPreviewAdClick || this.onViewerAdClick;
            return {
                $viewerState: "desktop",
                $appType: this.props.siteData.isFacebookSite() ? "facebook" : ""
            };
        },

        getSkinProperties: function () {
            return {
                "desktopWADTop": {
                    onClick: this.onAdClick,
                    style: {
                        visibility: this.props.siteAPI.isZoomOpened() || shouldHideAd.call(this) ? "hidden" : "visible"
                    }
                },
                "desktopWADTopLabel": {
                    dangerouslySetInnerHTML: {__html: uglyTempFixClassNames(normalizeCrappyHtml(this.props.adData.topLabel))}
                },
                "desktopWADTopContent": {
                    dangerouslySetInnerHTML: {__html: uglyTempFixClassNames(normalizeCrappyHtml(this.props.adData.topContent))}
                },
                "desktopWADBottom": {
                    onClick: this.onAdClick,
                    style: {
                        visibility: this.props.siteAPI.isZoomOpened() || shouldHideAd.call(this) ? "hidden" : "visible",
                        display: "block !important"
                    }
                },
                "desktopWADBottomContent": {
                    className: this.classSet({
                        nativeAndroid: this.props.siteData.mobile.isAndroidOldBrowser()
                    }),
                    dangerouslySetInnerHTML: {__html: uglyTempFixClassNames(normalizeCrappyHtml(this.props.adData.footerLabel))}
                }
            };
        },

        onViewerAdClick: function () {
            this.props.siteAPI.openPopup(this.props.adData.adUrl, "_blank");
        }
    };
});
