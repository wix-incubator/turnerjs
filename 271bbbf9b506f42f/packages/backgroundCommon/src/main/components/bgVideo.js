define(['lodash', 'react', 'core', 'backgroundCommon/mixins/bgVideoMixin'], function (_, React, /** core */ core, bgVideoMixin) {
    'use strict';

    function getVideoControls(videoData) {
        return {
            loop: videoData.loop ? 'loop' : '',
            muted: videoData.mute ? 'muted' : '',
            preload: videoData.preload || 'auto'
        };
    }

    /**
     * @class components.bgVideo
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "bgVideo",
        mixins: [core.compMixins.skinBasedComp, bgVideoMixin],
        propTypes: {
            compData: React.PropTypes.object.isRequired
        },
        statics: {
            useSantaTypes: true
        },
        getSkinProperties: function () {
            var controls = getVideoControls(this.props.compData);

            var outerStyle = {
                width: '100%'
            };
            var innerStyle = {
                visibility: 'hidden',
                position: 'absolute'
            };
            return {
                '': {
                    'data-quality': this.state.videoQuality && this.state.videoQuality.quality,
                    'style': outerStyle
                },
                'video': {
                    'loop': controls.loop,
                    'muted': controls.muted,
                    'preload': controls.preload,

                    'style': innerStyle
                }
            };
        }
    };
});
