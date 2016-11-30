define(['core', 'utils'], function (core, utils) {
    'use strict';

    var mixins = core.compMixins,
        urlUtils = utils.urlUtils;

    return {
        displayName: 'FlickrBadgeWidget',
        mixins: [mixins.skinBasedComp],
        getInitialState: function () {
            return {
                width: this.props.style.width,
                height: this.props.style.height
            };
        },
        componentDidMount: function () {
            window.addEventListener('message', this.processMessage);
        },
        componentWillUnmount: function () {
            window.removeEventListener('message', this.processMessage);
        },
        processMessage: function(message){
            if (message.data && message.data.compId === this.props.id) {
                this.registerReLayout();
                this.setState(message.data.size);
            }
        },
        getFlickSrc: function () {
            var data = this.props.compData,
                urlParams = {
                    imageCount: data.imageCount,
                    whichImages: data.whichImages,
                    imageSize: data.imageSize,
                    layoutOrientation: data.layoutOrientation,
                    userId: data.userId,
                    tag: data.tag,
                    origin: utils.urlUtils.origin(),
                    compId: this.props.id
                };

            return this.props.siteData.santaBase + '/static/external/flickrBadgeWidget.html?' + urlUtils.toQueryString(urlParams);
        },
        getSkinProperties: function () {
            return {
                "": {
                    style: {
                        width: this.state.width,
                        height: this.state.height
                    }
                },
                iframe: {
                    src: this.getFlickSrc(),
                    height: this.state.height,
                    width: this.state.width
                },
                overlayClick: {
                    href: 'http://www.flickr.com/photos/' + this.props.compData.userId + '/',
                    target: '_blank'
                }
            };
        }
    };
});
