define(['lodash', 'reactDOM', 'core', 'utils', 'imageClientApi', 'swfobject'], function(_, ReactDOM, core, utils, imageClientApi) {
    'use strict';

    var mixins = core.compMixins;
    var linkRenderer = utils.linkRenderer;

    function initLinkSkinPart(compData, siteData, compProp, rootNavigationInfo) {
        var hasLink = !!compData.link;
        var linkSkinPart = hasLink ? linkRenderer.renderLink(compData.link, siteData, rootNavigationInfo) : {};
        linkSkinPart.style = {
            textAlign: compProp.align
        };
        return linkSkinPart;
    }

    function calculateContainerSize(displayMode, styleWidth, styleHeight, mediaWidth, mediaHeight) {
        var compSize = {
            width: styleWidth,
            height: styleHeight
        };
        var mediaSize = {
            width: mediaWidth,
            height: mediaHeight
        };
        if (displayMode === "fit") {
            return utils.imageUtils.getContainerSize(
                compSize,
                mediaSize,
                imageClientApi.fittingTypes.LEGACY_FIT_WIDTH
            );
        } else if (displayMode === "stretch") {
            return utils.imageUtils.getContainerSize(
                compSize,
                mediaSize,
                imageClientApi.fittingTypes.STRETCH
            );
        }
        // "original"
        return {
            width: mediaWidth,
            height: mediaHeight
        };
    }

    function createFallbackImage(imageData, containerSize) {
        return this.createChildComponent(
            imageData,
            'core.components.Image',
            'noFlashImg',
            {
                id: this.props.id + 'noFlashImg',
                ref: 'noFlashImg',
                imageData: imageData,
                containerWidth: containerSize.width,
                containerHeight: containerSize.height,
                displayMode: imageClientApi.fittingTypes.LEGACY_FULL,
                usePreloader: true
            });
    }

    function embedFlashObject() {
        window.swfobject.embedSWF(
            getFlashUrl(this.props.compData, this.props.siteData),
                this.props.id + "flashContainer",
            "100%",
            "100%",
            "10.0.0",
            "playerProductInstall.swf",
            null,
            getFlashParams(),
            getFlashAttributes(),
            onSWFEmbedded.bind(this)
        );

        this.embeddedUri = this.props.compData.uri;
    }

    function onSWFEmbedded(obj) {
        // success is report as true if the minimum Flash player required is available
        // and that the Flash plugin-in <object> DOM element for the SWF was created.
        // SWFObject cannot detect if the swf file request has actually loaded or not.
        if (obj.success) {
            ReactDOM.findDOMNode(this.refs.noFlashImgContainer).style.display = 'none';
        }
    }

    function getFlashUrl(compData, siteData) {
        if (compData.uri) {
            return siteData.serviceTopology.staticMediaUrl + '/' + compData.uri;
        }
        return '';
    }

    function getFlashParams() {
        return {
            quality: 'high',
            bgcolor: '#FAFAFA',
            allowscriptaccess: 'never',
            allowfullscreen: 'true',
            wMode: 'transparent',
            scale: 'exactFit',
            flashVars: '',
            play: 'true',
            autoplay: 'true'
        };
    }

    function getFlashAttributes() {
        return {align: 'middle'};
    }

    /**
     * @class components.soundCloudWidget
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */
    return {
        displayName: 'FlashComponent',
        mixins: [mixins.skinBasedComp],

        getInitialState: function () {
            this.embeddedUri = null;

            var hasLink = !!this.props.compData.link;
            return {$linkableComponent: (hasLink ? 'link' : 'noLink')};
        },

        componentDidMount: function () {
            embedFlashObject.call(this);
        },

        componentDidUpdate: function() {
            if (this.props.compData.uri !== this.embeddedUri) {
                embedFlashObject.call(this);
            }
        },

        getSkinProperties: function () {
            var imageData = this.props.compData.placeHolderImage;
            var displayMode = this.props.compProp.displayMode;
            var mediaWidth = this.props.compData.uri ? this.props.compData.width : imageData.width;
            var mediaHeight = this.props.compData.uri ? this.props.compData.height : imageData.height;
            var containerSize = calculateContainerSize(displayMode, this.props.style.width, this.props.style.height, mediaWidth, mediaHeight);

            return {
                '': {
                    style: {
                        width: containerSize.width,
                        height: containerSize.height
                    }
                },
                'link': initLinkSkinPart(this.props.compData, this.props.siteData, this.props.compProp, this.props.rootNavigationInfo),
                'noFlashImg': createFallbackImage.call(this, imageData, containerSize)
            };
        }
    };
});
