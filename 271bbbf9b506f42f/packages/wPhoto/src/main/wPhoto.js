define(['lodash', 'react', 'core', 'santaProps', 'utils', 'image', 'zoomedImage', 'imageClientApi'], function (_, React, /** core */ core, santaProps, utils, image, zoomedImage, imageClientApi) {
    'use strict';

    var linkRenderer = utils.linkRenderer;
    var mixins = core.compMixins;
    var CANCEL_ZOOM_TIMEOUT = 1200;
    var convertedDisplayModes = {
        'fitWidthStrict': imageClientApi.fittingTypes.LEGACY_FIT_WIDTH,
        'fitHeightStrict': imageClientApi.fittingTypes.LEGACY_FIT_HEIGHT
    };

    /**
     * !onClickBehavior is checked since old wPhotoProperties data items did not have an onClickBahvior property
     * @param onClickBehavior
     * @param linkData
     * @returns {*|boolean}
     */
    function shouldShowLink(onClickBehavior, linkData) {
        return (linkData && (onClickBehavior === 'goToLink' || !onClickBehavior)) || onClickBehavior === 'zoomMode';
    }

    /**
     *
     * @param compData
     * @param propertyQuery
     * @param linkData
     * @param onClickBehavior
     * @param imageCompSize
     * @param {site.rootNavigationInfo} navInfo
     * @param renderLink
     * @param renderImageZoomLink
     * @returns {{style: {}}}
     */
    function generateLinkPartProps(compData, propertyQuery, linkData, onClickBehavior, imageCompSize, navInfo, renderLink, renderImageZoomLink, linkRenderInfo) {
        var properties = {style: {}};
        properties.style.width = imageCompSize.width;
        properties.style.height = imageCompSize.height;
        //todo Shimi_Liderman 8/21/14 16:31 Should the link be in the image's container size? - for example PolaroidSkin
        if (shouldShowLink(onClickBehavior, linkData)) {
            properties.style.cursor = 'pointer';
        }

        if (onClickBehavior === 'zoomMode') {
            _.assign(properties, renderImageZoomLink(linkRenderInfo, navInfo, compData, null, propertyQuery));
        } else if (linkData && (onClickBehavior === 'goToLink' || !onClickBehavior)) {
            // !onClickBehavior is checked since old wPhotoProperties data items did not have an onClickBahvior property
            _.assign(properties, renderLink(linkData, linkRenderInfo, navInfo));
        } else {
            properties.parentConst = React.DOM.div;
        }

        return properties;
    }

    function buildImage(compName, params) {
        return this.createChildComponent(this.props.compData, compName, 'img', params);
    }

    function getImageParams(photoProps, imageCompSize) {
        return {
            id: photoProps.id + 'img',
            ref: 'img',
            containerWidth: imageCompSize.width,
            containerHeight: imageCompSize.height,
            displayMode: convertedDisplayModes[photoProps.compProp.displayMode] || photoProps.compProp.displayMode,
            effectName: photoProps.compProp.effectName,
            imageData: photoProps.compData,
            usePreloader: photoProps.usePreloader !== false,
            addItemProp: photoProps.addItemProp
        };
    }

    function buildZoomableImage(imageParams, eventListeners, photoProperties) {
        var imageComp;
        if (this.state.isInZoom) {
            imageParams.className = this.classSet({'zoomedin': true});
            imageParams.initialClickPosition = this.state.initialClickPosition;
            imageComp = buildImage.call(this, 'core.components.ZoomedImage', imageParams);
            eventListeners.onMouseLeave = waitBeforeZoomOut.bind(this);
            eventListeners.onMouseEnter = cancelZoomOut.bind(this);
        } else {
            imageParams.className = this.classSet({'zoomedout': true});
            imageComp = buildImage.call(this, 'core.components.Image', imageParams);
            eventListeners.onMouseLeave = _.noop;
            eventListeners.onMouseEnter = _.noop;
        }
        _.assign(photoProperties, eventListeners);

        return imageComp;
    }

    function createImageComponent(imageCompSize, imageOriginalSize, isZoomAndPanMode, photoProperties) {
        var imageParams = getImageParams(this.props, imageCompSize);
        var eventListeners = {onClick: toggleZoom.bind(this)};

        if (!isZoomAndPanMode || isOriginalImageSmallerThanImageComp(imageOriginalSize, imageCompSize)) {
            return buildImage.call(this, 'core.components.Image', imageParams);
        }

        return buildZoomableImage.call(this, imageParams, eventListeners, photoProperties);
    }

    function getPhotoProps(photoStyle, photoCompSize, parsedSkinParams, title) {
        var properties = {style: _.cloneDeep(photoStyle)};

        properties.style.width = photoCompSize.width;
        properties.style.height = photoCompSize.height;

        // adding exact size info to node, so that it'll be accessible from the layout
        properties['data-exact-height'] = photoCompSize.exactHeight;

        // adding content-padding to node, so that it'll be accessible from layout
        properties['data-content-padding-horizontal'] = parsedSkinParams.contentPaddingHorizontal;
        properties['data-content-padding-vertical'] = parsedSkinParams.contentPaddingVertical;

        // adding title to component div from data
        properties.title = title;

        return properties;
    }

    function toggleZoom(event) {
        var self = this;
        var isInZoom = this.state.isInZoom;

        if (isInZoom) {
            this.refs.img.zoomOut(function () {
                self.setState({isInZoom: !isInZoom});
            });
        } else {
            this.setState({
                isInZoom: !isInZoom,
                initialClickPosition: {clientX: event.clientX, clientY: event.clientY}
            });
        }
        var hasEffect = this.props.compProp.effectName && this.props.compProp.effectName !== 'none';
        if (hasEffect) {
            this.registerReLayout();
        }
    }

    function waitBeforeZoomOut(event) {
        var self = this;
        cancelZoomOut.call(this);
        this.zoomTimer = setTimeout(function () {
            toggleZoom.apply(self, [event]);
        }, CANCEL_ZOOM_TIMEOUT);
    }

    function cancelZoomOut() {
        clearTimeout(this.zoomTimer);
    }

    function isOriginalImageSmallerThanImageComp(imageOriginalSize, imageCompSize) {
        return imageOriginalSize.width < imageCompSize.width ||
            imageOriginalSize.height < imageCompSize.height;
    }

    function parseSkinParams(skinParams, skinExports) {
        var parsedParams = {};
        var contentPaddingLeft = parseInt(skinParams.contentPaddingLeft.value || 0, 10) + parseInt(skinExports.contentPaddingLeft || 0, 10);
        var contentPaddingRight = parseInt(skinParams.contentPaddingRight.value || 0, 10) + parseInt(skinExports.contentPaddingRight || 0, 10);
        var contentPaddingTop = parseInt(skinParams.contentPaddingTop.value || 0, 10) + parseInt(skinExports.contentPaddingTop || 0, 10);
        var contentPaddingBottom = parseInt(skinParams.contentPaddingBottom.value || 0, 10) + parseInt(skinExports.contentPaddingBottom || 0, 10);

        parsedParams.contentPaddingHorizontal = contentPaddingLeft + contentPaddingRight;
        parsedParams.contentPaddingVertical = contentPaddingTop + contentPaddingBottom;

        return parsedParams;
    }

    function getImageCompSizeBySkinParams(photoOriginalSize, parsedSkinParams) {
        var width = photoOriginalSize.width - parsedSkinParams.contentPaddingHorizontal,
            height = photoOriginalSize.height - parsedSkinParams.contentPaddingVertical;
        return {
            width: width > 0 ? width : 16,
            height: height > 0 ? height : 16
        };
    }

    function getPhotoCompSizeBySkinParams(imageCompSize, parsedSkinParams) {
        return {
            width: imageCompSize.width + parsedSkinParams.contentPaddingHorizontal,
            height: imageCompSize.height + parsedSkinParams.contentPaddingVertical,
            exactHeight: (imageCompSize.exactHeight || imageCompSize.height) + parsedSkinParams.contentPaddingVertical
        };
    }

    /**
     * @class components.WPhoto
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "WPhoto",

        propTypes: _.assign({
            id: santaProps.Types.Component.id,
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            structure: santaProps.Types.Component.structure,
            linkRenderInfo: santaProps.Types.Link.linkRenderInfo.isRequired,
            rootNavigationInfo: santaProps.Types.Component.rootNavigationInfo.isRequired
        }, santaProps.santaTypesUtils.getSantaTypesByDefinition(image), santaProps.santaTypesUtils.getSantaTypesByDefinition(zoomedImage)),

        statics: {
            useSantaTypes: true
        },

        mixins: [mixins.skinBasedComp, mixins.skinInfo, mixins.animationsMixin],

        getInitialState: function () {
            this.zoomTimer = null;
            return {
                isInZoom: false
            };
        },

        getSkinProperties: function () {
            var propertyQuery = this.props.structure.propertyQuery;
            var linkData = this.props.compData.link || null;
            var onClickBehavior = this.props.compProp.onClickBehavior;
            var displayMode = this.props.compProp.displayMode;
            var componentOriginalSize = _.pick(this.props.style, ['width', 'height']);
            var imageOriginalSize = {width: this.props.compData.width, height: this.props.compData.height};

            // computations
            var parsedSkinParams = parseSkinParams(
                this.getParams(['contentPaddingLeft', 'contentPaddingRight', 'contentPaddingBottom', 'contentPaddingTop']),
                this.getSkinExports());
            var imageCompSize = utils.imageUtils.getContainerSize(
                getImageCompSizeBySkinParams(componentOriginalSize, parsedSkinParams),
                imageOriginalSize,
                convertedDisplayModes[displayMode] || displayMode);
            var photoCompSize = getPhotoCompSizeBySkinParams(imageCompSize, parsedSkinParams);
            var photoProperties = getPhotoProps(this.props.style, photoCompSize, parsedSkinParams, this.props.compData.title);
            var imageProperties = createImageComponent.call(this, imageCompSize, imageOriginalSize, onClickBehavior === 'zoomAndPanMode', photoProperties);
            var linkProperties = generateLinkPartProps(
                    this.props.compData,
                    propertyQuery,
                    linkData,
                    onClickBehavior,
                    imageCompSize,
                    this.props.rootNavigationInfo,
                    linkRenderer.renderLink,
                    linkRenderer.renderImageZoomLink,
                    this.props.linkRenderInfo
                );
            return {
                "": photoProperties,
                "img": imageProperties,
                "link": linkProperties
            };
        },
        getDefaultSkinName: function () {
            return "wysiwyg.viewer.skins.photo.DefaultPhoto";
        }
    };
});
