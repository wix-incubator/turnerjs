define(['core', 'utils', 'lodash', 'santaProps', 'image'], function (core, /** utils */utils, _, santaProps, image) {
    'use strict';

    var mixins = core.compMixins;
    var RSS_FEED = "feed.xml";

    function getDimensionsByRatio(imageData, style) {
        if (style.width < style.height) {
            return {
                height: imageData.height * style.width / imageData.width,
                width: style.width
            };
        }
        return {
            height: style.height,
            width: imageData.width * style.height / imageData.height
        };
    }

    function getImageSkinProperties(imageData) {
        if (!imageData) {
            return {};
        }

        if (imageData.width === imageData.height) {
            imageData.width = imageData.height = Math.min(this.props.style.width, this.props.style.height);
        } else {
            _.assign(imageData, getDimensionsByRatio(imageData, this.props.style));
        }

        return this.createChildComponent(
            imageData,
            'core.components.Image', 'image',
            {
                skinPart: 'image',
                imageData: imageData,
                containerWidth: this.props.style.width,
                containerHeight: this.props.style.height,
                displayMode: 'full'
            }
        );
    }

    function getLinkSkinProperties() {
        var linkData = {};

        if (this.props.compData.link) {
            linkData = this.props.compData.link;
            var linkRenderInfo = this.props.linkRenderInfo;
            var baseUrl = linkRenderInfo.isViewerMode ? linkRenderInfo.externalBaseUrl : utils.urlUtils.baseUrl(linkRenderInfo.externalBaseUrl);
            linkData.url = utils.urlUtils.joinURL(baseUrl, RSS_FEED);

            linkData = utils.linkRenderer.renderLink(linkData, linkRenderInfo, this.props.rootNavigationInfo);
        }

        linkData.title = this.props.compData.alt;
        linkData.style = {
            width: this.props.style.width,
            height: this.props.style.height
        };

        return linkData;
    }

    /**
     * @class components.ImageButton
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */
    return {
        displayName: 'RSSButton',
        mixins: [
            mixins.timeoutsMixin,
            mixins.skinBasedComp
        ],

        propTypes: _.assign({
            compData: santaProps.Types.Component.compData.isRequired,
            linkRenderInfo: santaProps.Types.Link.linkRenderInfo.isRequired,
            rootNavigationInfo: santaProps.Types.Component.rootNavigationInfo.isRequired,
            style: santaProps.Types.Component.style.isRequired
        }, santaProps.santaTypesUtils.getSantaTypesByDefinition(image)),

        statics: {
            useSantaTypes: true
        },

        getSkinProperties: function () {
            var imgData = this.props.compData.image;

            return {
                image: getImageSkinProperties.call(this, imgData),
                link: getLinkSkinProperties.call(this),
                "": {
                    title: imgData.alt
                }
            };
        }

    };
});
