define(['lodash', 'core', 'react', 'socialCommon', 'santaProps'], function (_, core, React, socialCommon, santaProps) {
    'use strict';

    var mixins = core.compMixins;
    var compHeight = {SIMPLE: 130, FACES: 214, STREAM: 575, MAX: 2000};

    function getHeights(props) {
        var showFaces = props.compData.showFaces,
            showStream = props.compData.showStream,
            currentHeight = props.style.height;
        var heights = {};

        if (!showStream && showFaces) {
            heights.minHeight = heights.maxHeight = heights.currentHeight = compHeight.FACES;
        } else if (showStream) {
            heights.minHeight = compHeight.STREAM;
            heights.maxHeight = compHeight.MAX;
            heights.currentHeight = currentHeight < heights.minHeight ? heights.minHeight : currentHeight;
        } else {
            heights.minHeight = heights.maxHeight = heights.currentHeight = compHeight.SIMPLE;
        }
        return heights;
    }

    return {
        displayName: 'FacebookLikeBox',
        mixins: [mixins.skinBasedComp, socialCommon.facebookComponentMixin],

        propTypes: {
            compData: santaProps.Types.Component.compData.isRequired,
            style: santaProps.Types.Component.style.isRequired
        },

        statics: {
            useSantaTypes: true
        },

        getInitialState: function () {
            return {
                ready: true
            };
        },

        getHref: function () {
            return 'http://www.facebook.com/' + (this.props.compData && this.props.compData.facebookPageId);
        },

        getSkinProperties: function () {
            var data = this.props.compData,
                compStyle = this.props.style,
                heights = getHeights(this.props),
                href = this.getHref();

            return {
                '': {
                    children:
                        React.DOM.div({
                            className: 'fb-page',
                            'data-href': href,
                            'data-height': heights.currentHeight,
                            'data-width': compStyle.width || 280,
                            'data-hide-cover': !data.showHeader,
                            'data-show-posts': data.showStream,
                            'data-show-facepile': data.showFaces,
                            'data-adapt-container-width': true,
                            // hack- fb sdk does not send the right container_width without it
                            key: compStyle.width + '' + compStyle.height
                        }),
                    style: {
                        minWidth: 280,
                        maxWidth: 500,
                        minHeight: heights.minHeight,
                        maxHeight: heights.maxHeight
                    }
                }
            };
        }
    };
});
