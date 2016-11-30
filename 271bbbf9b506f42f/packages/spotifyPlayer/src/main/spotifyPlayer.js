define(['core', 'utils', 'santaProps', 'lodash'], function (/** core */core, utils, santaProps, _) {
    "use strict";

    var mixins = core.compMixins;

    var urlUtils = utils.urlUtils;
    var baseUrl = 'https://embed.spotify.com/?';

    var sizeLimits = {
        compact: {
            minW: 250,
            minH: 80
        },
        large: {
            minW: 250,
            minH: 330
        }
    };

    /**
     * Get the iframe source
     * @param uri
     * @param color
     * @param style
     * @returns {string}
     */
    function getIframeSrc(uri, color, style) {
        var queryParams = {
            uri: uri,
            theme: color,
            view: style
        };
        return baseUrl + urlUtils.toQueryString(queryParams);
    }

    /**
     *
     * @param compData
     * @returns {{}}
     */
    function getPlaceHolderProperties(compData) {
        var placeHolderProps = {};

        if (_.size(compData.uri) > 0) {
            placeHolderProps.style = {};
            placeHolderProps.style.display = "none";
        }

        return placeHolderProps;
    }

    function calculateIframeHeight(compProp, compStyle) {
        var height = sizeLimits[compProp.size].minH;
        if (compProp.size === "large") {
            height += compStyle.width - sizeLimits[compProp.size].minW;
        }
        return height;
    }

    /**
     *
     * @param compProp
     * @param compData
     * @param compStyle
     * @returns {{}}
     */
    function getIframeProperties(compProp, compData, compStyle) {
        var iframe = {};
        if (_.size(compData.uri) > 0) {
            iframe.src = getIframeSrc(compData.uri, compProp.color, compProp.style);
            iframe.style = {
                width: compStyle.width,
                height: calculateIframeHeight(compProp, compStyle)
            };
        } else {
            iframe.style = {
                display: "none"
            };
        }
        return iframe;
    }

    /**
     * @class components.spotifyPlayer
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "SpotifyPlayer",
        mixins: [mixins.skinBasedComp],

        propTypes: {
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            style: santaProps.Types.Component.style.isRequired
        },

        statics: {
            useSantaTypes: true
        },

        getSkinProperties: function () {
            return {
                "": {
                    style: {
                        //We add stupid extra 2 pixels for backward compatibility with HTML-CLIENT
                        height: calculateIframeHeight(this.props.compProp, this.props.style) + 2
                    }
                },
                iframe: getIframeProperties(this.props.compProp, this.props.compData, this.props.style),
                placeholder: getPlaceHolderProperties(this.props.compData)
            };
        }
    };
});
