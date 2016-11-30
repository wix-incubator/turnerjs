define(['lodash', 'react', 'utils', 'imageClientApi', 'color', 'santaProps'], function (_, React, utils, imageClientApi, Color, santaProps) {
    'use strict';
    var containerUtils = utils.containerBackgroundUtils;
    function getBackgroundBrightness(imageData, onSuccess, onError) {
        var imageUrl = imageData && imageData.uri;

        if (imageUrl) {

            var imageTransformSource = {
                id: imageUrl,
                width: imageData.width,
                height: imageData.height
            };
            var imageTransformTarget = {
                width: 1,
                height: 1
            };
            var uri = imageClientApi.getData(imageClientApi.fittingTypes.SCALE_TO_FILL, imageTransformSource, imageTransformTarget).uri;
            var thumbnailImageUrl = this.props.getMediaFullStaticUrl(uri);
            utils.imageUtils.getImageMeanBrightness(thumbnailImageUrl, {width: 1, height: 1}, onSuccess, onError);
        } else {
            var bgColor = getBackgroundColor.call(this);
            onSuccess(bgColor.values.hsv[2], bgColor.values.alpha);
        }
        //var bgColor = getBackgroundColor.call(this, this.props);
        //onSuccess(bgColor.values.hsv[2]);
    }

    function getBackgroundColor() {
        var bgData = this.safeGetBgData();
        return new Color(utils.colorParser.getColor(this.props.colorsMap, bgData.color, bgData.colorOpacity));
    }

    function updateDynamicColorAspect(brightness, alpha) {
        var dynamicColorElementsAspect = this.props.dynamicColorElementsAspect;
        dynamicColorElementsAspect.updateInformation(this.props.id, {brightness: brightness, alpha: alpha});
    }

    function handleBgChange(imageData, bgColor) {
        var newImageUrl = imageData && imageData.uri;
        var didImageChange = newImageUrl !== this.lastBackgroundImageUrl;
        var bgColorHex = bgColor && bgColor.hexString();
        var lastBgColorHex = this.lastBackgroundBgColor && this.lastBackgroundBgColor.hexString();
        var didColorChangeAndNoImage = !newImageUrl && bgColorHex !== lastBgColorHex;
        var didAlphaChange = bgColor && (bgColor.values.alpha !== this.lastAlpha);

        if (didImageChange || didColorChangeAndNoImage || didAlphaChange) {
            getBackgroundBrightness.call(this, imageData, updateDynamicColorAspect.bind(this));
        }

        this.lastBackgroundImageUrl = newImageUrl;
        this.lastBackgroundBgColor = bgColor;
        this.lastAlpha = bgColor.values.alpha;
    }

    return {
        propTypes: {
            id: React.PropTypes.string,
            compDesign: React.PropTypes.object,
            compData: React.PropTypes.object,
            colorsMap: santaProps.Types.Theme.colorsMap.isRequired,
            isMobileView: santaProps.Types.isMobileView.isRequired,
            dynamicColorElementsAspect: santaProps.Types.SiteAspects.dynamicColorElements.isRequired,
            getMediaFullStaticUrl: santaProps.Types.ServiceTopology.getMediaFullStaticUrl.isRequired
        },

        componentDidMount: function() {
            if (!this.props.isMobileView) {
                var bgColor = getBackgroundColor.call(this);
                var imageData = this.getMediaImageData();

                handleBgChange.call(this, imageData, bgColor);
            }
        },
        componentDidUpdate: function() {
            if (!this.props.isMobileView) {
                var bgColor = getBackgroundColor.call(this);
                var bgColorHex = bgColor && bgColor.hexString();
                var lastBgColorHex = this.lastBackgroundBgColor && this.lastBackgroundBgColor.hexString();
                var imageData = this.getMediaImageData();
                var imageUrl = imageData && imageData.uri;
                var didColorChange = bgColorHex !== lastBgColorHex;
                var didImageChange = imageUrl !== this.lastBackgroundImageUrl;
                var didAlphaChange = bgColor && (bgColor.values.alpha !== this.lastAlpha);

                if (didColorChange || didImageChange || didAlphaChange) {
                    handleBgChange.call(this, imageData, bgColor);
                }
            }
        },

        getMediaImageData: function () {
            var bgData = this.safeGetBgData();
            var media = bgData.mediaRef;
            if (media) {
                switch (media.type) {
                    case 'Image':
                        return media;
                    case 'WixVideo':
                        return media.posterImageRef;
                }
            }

            return null;
        },
        safeGetBgData: function(){
            return (this.props.id === "SITE_BACKGROUND") ? this.getBgData() : containerUtils.getBgData(this.props.compDesign, this.props.compData);
        }
    };
});
