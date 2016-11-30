define(['lodash', 'core', 'utils', 'imageClientApi'], function (_, /** core */ core, utils, imageClientApi) {

    'use strict';

    var mixins = core.compMixins;
    var linkRenderer = utils.linkRenderer;

    var translatedLanguageKeys = { // TODO: add i18n bundle and move to another model if it's the same for both models
        goToLinkText: 'Go to link'
    };

    function getZoomChild(compData, zoomDimensions, isMobileOrTablet, quality) {
        var imageProps = {
            id: this.props.id + 'image',
            ref: 'image',
            key: compData.id,
            imageData: compData,
            quality: quality,
            containerWidth: zoomDimensions.imageContainerWidth,
            containerHeight: zoomDimensions.imageContainerHeight,
            displayMode: imageClientApi.fittingTypes.LEGACY_FULL,
            onClick: this.props.goToNextItem,
            effectName: this.props.compProp.effectName,
            usePreloader: true
        };


        if (isMobileOrTablet) {
            imageProps.onClick = this.props.toggleButtons;
            imageProps.onTap = this.props.toggleButtons;
        }

        return this.createChildComponent(
            compData,
            'core.components.Image',
            'image',
            imageProps);
    }

    /**
     * @class components.ImageZoomDisplayer
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'ImageZoomDisplayer',
        mixins: [mixins.skinBasedComp],

        getInitialState: function() {
            var device = 'desktop';
            if (this.props.siteData.isMobileDevice()) {
                device = 'mobile';
            } else if (this.props.siteData.isTabletDevice()) {
                device = 'tablet';
            }
            return {$device: device};
        },

        getSkinProperties: function () {
            var compData = this.props.compData;
            var compProps = this.props.compProp;
            var siteData = this.props.siteData;
            var zoomDimensions = this.props.zoomDimensions;
            var imgQuality = this.props.quality;
            var refs = {
                title: {
                    children: compData.title
                },
                description: {
                    children: compData.description
                },
                image: getZoomChild.call(this, compData, zoomDimensions, siteData.isMobileDevice() || siteData.isTabletDevice(), imgQuality)

            };

            if (compData.link) {
                refs.link = linkRenderer.renderLink(compData.link, siteData, this.props.rootNavigationInfo);
                refs.link.children = (compProps && compProps.goToLinkText) ? compProps.goToLinkText : translatedLanguageKeys.goToLinkText;
            }

            return refs;
        }
    };
});
