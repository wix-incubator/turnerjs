define(['react', 'lodash', 'core', 'utils', 'socialCommon'], function (React, _, /** core */core, utils, socialCommon) {
    'use strict';

    var mixins = core.compMixins;

    var LAYOUT_SIZES = {
        Button: {w: 100, h: 21},
        ButtonWithoutCounter: {w: 64, h: 21},
        Link: {w: 50, h: 21},
        LinkWithoutIcon: {w: 30, h: 21},
        Icon: {w: 36, h: 36}
    };
    var DEFAULT_SIZE = LAYOUT_SIZES.Button;

    var getIframeSrc = function (props, currentUrl) {
        var data = props.compData;
        var iframeParams = {
            id: props.id,
            url: currentUrl,
            style: data.style,
            text: data.text || 'Share'
        };

        return props.siteData.santaBase + '/static/external/VKShare.html?' + utils.urlUtils.toQueryString(iframeParams);
    };

    var getSizes = function (widthFromVK, style) {
        var size = LAYOUT_SIZES[style] || DEFAULT_SIZE;
        return {
            width: widthFromVK || size.w,
            height: size.h
        };
    };

    function getIframeProperties(props, size, currentUrl) {
        return {
            allowTransparency: 'true',
            key: 'VKShareButton-' + props.currentUrlPageId,
            frameBorder: '0',
            src: getIframeSrc(props, currentUrl),
            scrolling: 'no',
            style: _.clone(size)
        };
    }

    /**
     * @class components.VKShareButton
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'VKShareButton',
        mixins: [mixins.skinBasedComp, socialCommon.socialCompMixin],
        onVKPostMessage: function (data) {
            this.setState({
                widthFromVK: data.width
            });
        },
        getInitialState: function () {
            return {};
        },
        componentDidMount: function () {
            this.props.siteAPI.getSiteAspect('vkPostMessage').registerToPostMessage(this);//eslint-disable-line react/no-did-mount-callbacks-from-props
        },
        componentWillUnmount: function () {
            this.props.siteAPI.getSiteAspect('vkPostMessage').unRegisterToPostMessage(this);
        },
        getSkinProperties: function () {
            var size = getSizes(this.state.widthFromVK, this.props.compData.style);
            var currentUrl = this.getSocialUrl();
            var iframeProps = getIframeProperties(this.props, size, currentUrl);//we need to create React.DOM.iframe so that we can pass it a key, to solve CLNT-4186

            return {
                "": {
                    style: size
                },
                iframe: React.DOM.iframe(iframeProps)
            };
        }
    };
});
