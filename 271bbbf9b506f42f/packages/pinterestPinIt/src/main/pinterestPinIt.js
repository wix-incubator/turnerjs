define(['lodash', 'core', 'utils', 'santaProps', 'socialCommon'], function (_, /** core */ core, utils, santaProps, socialCommon) {
    'use strict';

    var mixins = core.compMixins;
    var urlUtils = utils.urlUtils;

    var BUTTON_SIZES = {
        none: {
            small: {
                width: 40,
                height: 20
            },
            large: {
                width: 56,
                height: 28
            }
        },
        beside: {
            small: {
                width: 40 + 40 + 1, // 40 is counter block width, 1 is margin
                height: 20
            },
            large: {
                width: 56 + 44 + 1, // 44 is counter block width, 1 is margin
                height: 28
            }
        },
        above: {
            small: {
                width: 40,
                height: 20 + 29 + 1// 29 is counter block height, 1 is margin
            },
            large: {
                width: 56,
                height: 28 + 37 + 1 // 37 is counter block height, 1 is margin
            }
        }
    };

    function getButtonDimension(counterPosition, size) {
        return BUTTON_SIZES[counterPosition][size];
    }

    function getIframeSrc(props, url) {
        var iframeSrc = props.santaBase + '/static/external/pinterestPinIt.html?';

        if (_.isEmpty(props.compData.uri) || _.isEmpty(props.compData.description)) {
            iframeSrc += urlUtils.toQueryString(getEmptyIframeParams(props));
        } else {
            iframeSrc += urlUtils.toQueryString(getIframeParams(props, url));
        }
        return iframeSrc;
    }

    function getEmptyIframeParams(props) {
        return {
            gagPath: props.santaBase + '/static/images/pinterestPinIt/pinterest-disabled.png'
        };
    }

    function getIframeParams(props, url) {
        return {
            media: urlUtils.addProtocolIfMissing(props.serviceTopology.staticMediaUrl + '/' + props.compData.uri),
            url: url,
            description: props.compData.description,
            'data-pin-do': 'buttonBookmark',
            'data-pin-config': props.compProp.counterPosition,
            'data-pin-color': props.compProp.color,
            'data-pin-height': getButtonDimension('none', props.compProp.size).height
        };
    }

    /**
     * @class components.PinterestPinIt
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'PinterestPinIt',
        mixins: [mixins.skinBasedComp, socialCommon.socialCompMixin],

        propTypes: {
            compData: santaProps.Types.Component.compData.isRequired,
            santaBase: santaProps.Types.santaBase.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            serviceTopology: santaProps.Types.ServiceTopology.serviceTopology
        },

        statics: {
            useSantaTypes: true
        },

        getSkinProperties: function () {
            var size = getButtonDimension(this.props.compProp.counterPosition, this.props.compProp.size);
            var height = size.height;
            var width = size.width;

            return {
                '': {
                    style: {
                        height: height,
                        width: width
                    }
                },
                iframe: {
                    width: width,
                    height: height,
                    src: getIframeSrc(this.props, this.getSocialUrl(true))
                }
            };
        }
    };
});
