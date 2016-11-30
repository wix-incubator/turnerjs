define(['lodash', 'react', 'core', 'utils', 'santaProps'], function (_, React, core, utils, santaProps) {
    'use strict';

    var mixins = core.compMixins;
    var urlUtils = utils.urlUtils;

    function trimUrlOnSecondQuestionMark(url) {
        // if URL includes 2 characters of '?'
        // for example: "https://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F68403644?"
        var splitedUrlArr = url.split("?");
        if (splitedUrlArr && splitedUrlArr.length > 2) {
            url = splitedUrlArr[0] + '?' + splitedUrlArr[1];
        }
        return url;
    }

    function normalizeSoundcloudUrl(url) {
        url = trimUrlOnSecondQuestionMark(url);
        url = decodeURIComponent(url);
        url = encodeSemicolon(url);
        return url;
    }

    function encodeSemicolon(str) {
        return str.replace(/;/g, '%3b');
    }

    function isDataTrue(propName, props) {
        // dataFixer required !!!
        // Checks for true in either boolean or text values. This is done because
        // when setting the data from the panel, i get actual boolean values.
        // When setting the panel via the server, i get string values.
        return props.compData[propName] === true || props.compData[propName] === "true";
    }

    /**
     * @class components.soundCloudWidget
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "SoundCloudWidget",
        mixins: [mixins.skinBasedComp],
        propTypes: {
            compData: santaProps.Types.Component.compData.isRequired,
            style: santaProps.Types.Component.style.isRequired,
            os: santaProps.Types.Browser.os.isRequired,
            isPlayingAllowed: santaProps.Types.RenderFlags.isPlayingAllowed.isRequired
        },
        statics: {
            useSantaTypes: true
        },
        getSoundCloudUrl: function () {
            var url = this.props.compData.url;
            if (url) {
                url = urlUtils.setUrlParam(url, "visual", isDataTrue("showArtWork", this.props));
                url = urlUtils.setUrlParam(url, "auto_play", this.props.isPlayingAllowed && isDataTrue("autoPlay", this.props));
                url = normalizeSoundcloudUrl(url);
            }
            return url || "";
        },

        getInitialState: function () {
            return {
                $trackUrl: this.props.compData.url === '' ? 'noContent' : ''
            };
        },

        getSkinProperties: function () {
            var styles = {};

            // on mobile safari, don't show scrolling
            if (this.props.os.ios) {
                _.assign(styles, {overflow: 'scroll', '-webkit-overflow-scrolling': 'touch'});
            }
            var frameProps = {
                src: this.getSoundCloudUrl(),
                width: this.props.style.width,
                height: this.props.style.height,
                style: styles
            };

            return {
                "iFrameHolder": {
                    children: [
                        React.DOM.iframe(frameProps)
                    ]
                }
            };
        }
    };
});
