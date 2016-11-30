define(['lodash', 'react', 'core'], function (_, React, /** core */ core) {
    'use strict';
    var mixins = core.compMixins;

    var compStaticsSizes = {
        defaultLayoutWidth: 145,
        defaultLayoutHeight: 33,
        fullLayoutWidth: 212,
        fullLayoutHeight: 55,
        fullLayoutHeightIE: 67,
        toolTipExtraSpace: 60,
        toolTipWidthExtraSpaceDefault: 150,
        toolTipWidthExtraSpaceFull: 150
    };

    function calcDimensionsWithToolTop(height, width, layout) {
        var compMinSizes = calculateCompMinDimensions(height, width, layout);
        return {
            height: compMinSizes.height + compStaticsSizes.toolTipExtraSpace,
            width: compMinSizes.width + (layout === 'default' ? compStaticsSizes.toolTipWidthExtraSpaceDefault : compStaticsSizes.toolTipWidthExtraSpaceFull)
        };
    }

    function calculateCompMinDimensions(height, width, layout) {
        if (layout === 'default') {
            if (height < compStaticsSizes.defaultLayoutHeight) {
                height = compStaticsSizes.defaultLayoutHeight;
            }
            if (width < compStaticsSizes.defaultLayoutWidth) {
                width = compStaticsSizes.defaultLayoutWidth;
            }
        } else {
            if (height < compStaticsSizes.fullLayoutHeight) {
                height = compStaticsSizes.fullLayoutHeight;
            }
            if (width < compStaticsSizes.fullLayoutWidth) {
                width = compStaticsSizes.fullLayoutWidth;
            }
        }
        return {
            width: width,
            height: height
        };
    }

    /**
     * @class components.YouTubeSubscribeButton
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'YouTubeSubscribeButton',
        mixins: [mixins.skinBasedComp],

        getInitialState: function () {
            var layoutState;
            if (this.props.siteData.browser.ie) {
                compStaticsSizes.fullLayoutHeight = compStaticsSizes.fullLayoutHeightIE;
            }
            if (this.props.compProp.layout === 'default') {
                layoutState = this.props.siteData.browser.ie ? 'defaultIE' : 'default';
            } else {
                layoutState = this.props.siteData.browser.ie ? 'fullIE' : 'full';
            }
            return {
                $layout: layoutState,
                $hoverMode: 'nonHover',
                iframeWrapperSizes: calculateCompMinDimensions(this.props.style.height, this.props.style.width, this.props.compProp.layout)
            };
        },

        getIFrameSrc: function () {
            var htmlUrl = this.props.siteData.santaBase + '/static/external/youtubeSubscribeButton.html?';
            var params = [];
            params.push('channel=' + this.props.compData.youtubeChannelId);
            params.push('layout=' + this.props.compProp.layout);
            params.push('theme=' + this.props.compProp.theme);
            return htmlUrl + params.join('&');
        },
        onMouseOut: function () {
            this.setState({
                iframeWrapperSizes: calculateCompMinDimensions(this.props.style.height, this.props.style.width, this.props.compProp.layout),
                $hoverMode: 'nonHover'
            });
        },
        onMouseEnter: function () {
            this.setState({
                iframeWrapperSizes: calcDimensionsWithToolTop(this.props.style.height, this.props.style.width, this.props.compProp.layout),
                $hoverMode: 'hoverMode'
            });
        },
        componentWillReceiveProps: function (nextProps) {
            this.setState({
                iframeWrapperSizes: calcDimensionsWithToolTop(nextProps.style.height, nextProps.style.width, nextProps.compProp.layout)
            });
        },
        getSkinProperties: function () {
            var compMinSizes = calculateCompMinDimensions(this.props.style.height, this.props.style.width, this.props.compProp.layout);
            var frameProps = {
                src: this.getIFrameSrc(),
                allowFullScreen: true,
                frameBorder: '0',
                width: '100%',
                height: '100%',
                onMouseOut: this.onMouseOut,
                onMouseEnter: this.onMouseEnter
            };

            return {
                '': {
                    style: {
                        height: compMinSizes.height,
                        width: compMinSizes.width
                    }
                },
                hitWidth: {
                    style: {left: compMinSizes.width}
                },
                youtubeIframe: {
                    addChildren: [
                        React.DOM.iframe(frameProps)
                    ],
                    style: {
                        width: this.state.iframeWrapperSizes.width,
                        height: this.state.iframeWrapperSizes.height
                    }
                }
            };
        }
    };
});
