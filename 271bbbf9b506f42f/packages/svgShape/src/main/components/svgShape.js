define(['lodash', 'core', 'skins', 'color', 'utils', 'santaProps', 'svgShape/util/svgShapeDataRequirementsChecker'],
    function (_, core, skinsPackage, Color, utils, santaProps) {
        "use strict";
        var skinRenderer = skinsPackage.skinsRenderer,
            defaultSkinName = 'skins.viewer.svgshape.SvgShapeDefaultSkin',
            defaultSkinHtml = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 376.654 376.654"><g><polygon points="298.185,264.061 149.092,352.082 0,264.061 0,88.021 149.092,0 298.185,88.021 "/></g></svg>';

        var getSvgString = function (siteShape, skinName) {
            if (skinName === defaultSkinName) {
                return defaultSkinHtml;
            }
            if (siteShape) {
                return siteShape;
            }
            // no data
            return null;
        };

        function wrapSvgWithLink(svgString, linkObject) {
            var anchorAttributes = '';
            _.forOwn(linkObject, function (value, key) {
                anchorAttributes += ' ' + key + '="' + value + '"';
            });

            return '<a' + anchorAttributes + '>' + svgString + '</a>';
        }

        /**
         * Tinted SVG
         * search for all 'fill' attributes and replace with tint color'.
         * @param svgString
         * @param fillColor hexColor
         * @return {{svgString: string, isTinted: boolean}}}
         */
        function transformToTintColors(svgString, fillColor) {
            var baseColor = new Color(fillColor);
            var tintedColor;
            var isTinted = false;
            var newSvgString = svgString.replace(/fill="(.*?)"/gi, function (full, colorToTint) {

                var colorObj = new Color(colorToTint);
                if (isGreyscale(colorObj)) {
                    var tint = 1 - (255 - colorObj.red()) / 255;
                    var rTint = Math.floor(baseColor.red() + (255 - baseColor.red()) * tint);
                    var gTint = Math.floor(baseColor.green() + (255 - baseColor.green()) * tint);
                    var bTint = Math.floor(baseColor.blue() + (255 - baseColor.blue()) * tint);
                    tintedColor = new Color({red: rTint, green: gTint, blue: bTint});
                    isTinted = true;
                    // return tinted color
                    return 'fill="' + tintedColor.hexString() + '"';
                }

                // no chnage, return original svg color
                return 'fill="' + colorToTint + '"';
            });
            return {svgString: newSvgString, isTinted: isTinted};

        }

        /**
         *
         * @param colorObj
         * @returns {boolean}
         */
        function isGreyscale(colorObj) {
            return _.isEqual(colorObj.red(), colorObj.green(), colorObj.blue()) && colorObj.red() !== 255;
        }


        /**
         * @class components.SvgShape
         * @extends {ReactCompositeComponent}
         * @property {comp.properties} props
         */
        return {
            displayName: "SvgShape",
            mixins: [core.compMixins.baseCompMixin],

            statics: {
                useSantaTypes: true
            },

            propTypes: {
                id: santaProps.Types.Component.id,
                structure: santaProps.Types.Component.structure,
                skin: santaProps.Types.Component.skin,
                compData: santaProps.Types.Component.compData.isRequired,
                theme: santaProps.Types.Component.theme,
                rootNavigationInfo: santaProps.Types.Component.rootNavigationInfo,
                THEME_DATA: santaProps.Types.Theme.THEME_DATA,
                svgString: santaProps.Types.SvgShape.string,
                styleId: santaProps.Types.Component.styleId,
                linkRenderInfo: santaProps.Types.Link.linkRenderInfo,
                serviceTopology: santaProps.Types.ServiceTopology.serviceTopology
            },

            // NOTE: getSkinProperties is inherited, do not remove it
            getSkinProperties: function () {
                var skinName = this.props.skin;
                var refData = {'': {}};
                var svgString = getSvgString(this.props.svgString, skinName, this.props.id, this.props.structure.layout);
                if (svgString) {
                    var theme = this.props.theme;
                    var styleCss = '';
                    var defaultSkin = skinsPackage.skins[defaultSkinName];
                    var shapeSkin = {};
                    var compData = this.props.compData;
                    var defaultFillColor = defaultSkin.paramsDefaults.fillcolor;
                    var fillColor = defaultFillColor;

                    if (compData && compData.link) {
                        var linkObject = utils.linkRenderer.renderLink(compData.link, this.props.linkRenderInfo, this.props.rootNavigationInfo);
                        svgString = wrapSvgWithLink(svgString, linkObject);
                    }

                    if (theme) {
                        shapeSkin = {
                            css: defaultSkin.css,
                            params: defaultSkin.params,
                            paramsDefaults: defaultSkin.paramsDefaults
                        };

                        styleCss = '<style type="text/css">' + skinRenderer.createSkinCss(shapeSkin, theme.style.properties, this.props.THEME_DATA, this.props.styleId, null, this.props.serviceTopology) + '</style>';
                        fillColor = theme.style.properties.fillcolor || fillColor;
                    }

                    var svgTransformedObject = transformToTintColors(svgString, utils.colorParser.getColorValue(this.props.THEME_DATA, fillColor));
                    //the original svg string may include 'fill' values.
                    //those values should be transformed to 'tinted color'
                    svgString = svgTransformedObject.svgString;
                    refData[''] = {
                        dangerouslySetInnerHTML: {__html: (styleCss + svgString) || ''}
                    };
                }

                this.updateRootRefDataStyles(refData['']);

                return refData;
            },

            render: function () {
                var refData = this.getSkinProperties();

                return skinRenderer.renderSkinHTML(null, refData, this.props.styleId, this.props.id, this.props.structure, this.props, this.state);
            }
        };
    });
