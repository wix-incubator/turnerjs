define(['react', 'lodash', 'core', 'utils', 'santaProps'], function (React, _, /** core */ core, /** utils */ utils, santaProps) {
    'use strict';
    var mixins = core.compMixins;

    function getOverlayImage(staticMediaUrl, data) {
        return 'url(' + utils.urlUtils.joinURL(staticMediaUrl, data.uri) + ')';
    }


    /**
     *
     * @param compProp
     * @param props
     */
    function getMediaTransforms(compProp, colorsMap, staticMediaUrl) {
        // todo: some logics
        var style = {};
        if (compProp.colorOverlay) {
            style.backgroundColor = utils.colorParser.getColor(colorsMap, compProp.colorOverlay, compProp.colorOverlayOpacity);
        }
        if (compProp.imageOverlay) {
            style.backgroundImage = getOverlayImage(staticMediaUrl, compProp.imageOverlay);
        }

        return style;

    }


    function getOverlayStyle(props) {
        var overlayStyle = {
            width: '100%',
            height: '100%',
            position: 'absolute'
        };

        var mediaTransforms = getMediaTransforms(props.compProp, props.colorsMap, props.staticMediaUrl);
        return _.assign(overlayStyle, mediaTransforms);
    }

    function shouldRenderFullScreen(effectName, fixedBackgroundColorBalata, renderFixedPositionBackgrounds) {
        return fixedBackgroundColorBalata && utils.containerBackgroundUtils.isFullScreenByEffect(effectName, renderFixedPositionBackgrounds);
    }

    /**
     * @class components.bgImage
     * @extends {core.skinBasedComp}
     */
    function getOuterStyle() {
        var outerStyle = _.assign({position: 'absolute'}, this.props.style, {
            width: '100%',
            height: '100%'
        });
        //chrome specific issue #CLNT-6532 , chrome smooth scrolling isnt synced with animation frame.
        //workaround: placing the background color as fixed layer
        if (shouldRenderFullScreen(this.props.compProp.effectName, this.props.fixedBackgroundColorBalata, this.props.renderFixedPositionBackgrounds)) {
            _.assign(outerStyle, {top: 0, position: 'fixed'});
        }

        return outerStyle;
    }

    return {
        displayName: "bgOverlay",
        mixins: [mixins.skinBasedComp],
        propTypes: {
            compProp: React.PropTypes.object.isRequired,
            style: React.PropTypes.object,
            colorOverlay: React.PropTypes.string,
            colorOverlayOpacity: React.PropTypes.number,
            effectName: React.PropTypes.string,
            colorsMap: santaProps.Types.Theme.colorsMap.isRequired,
            staticMediaUrl: santaProps.Types.ServiceTopology.staticMediaUrl,
            fixedBackgroundColorBalata: santaProps.Types.BrowserFlags.fixedBackgroundColorBalata.isRequired,
            renderFixedPositionBackgrounds: santaProps.Types.RenderFlags.renderFixedPositionBackgrounds
        },
        statics: {
            useSantaTypes: true
        },
        getSkinProperties: function () {
            var outerStyle = getOuterStyle.call(this);

            var innerStyle = getOverlayStyle(this.props);

            var properties = {
                "": {
                    style: outerStyle
                }
            };

            properties[utils.balataConsts.OVERLAY] = {style: innerStyle};

            return properties;
        }
    };
});
