define(["lodash", "react", "siteUtils", "wixappsCore/core/typesConverter", "wixappsCore/proxies/mixins/baseProxy"], function (_, React, siteUtils, /** wixappsCore.typesConverter */typesConverter, baseProxy) {
    'use strict';

    function getCompProp() {
        return {
            showAutoplay: this.getCompProp('showAutoplay') || false,
            loop: this.getCompProp('loop') || false,
            showCounter: this.getCompProp('showCounter') || false,
            expandEnabled: this.getCompProp('expandEnabled') || false,
            galleryImageOnClickAction: this.getCompProp('galleryImageOnClickAction'),
            imageMode: this.getCompProp('imageMode'),
            maxSpeed: this.getCompProp('maxSpeed') || 5,
            margin: this.getCompProp('margin'),
            aspectRatio: 1.333
        };
    }

    function convertData() {
        var items = _.map(this.proxyData, function (item) {
            var newItem = _.clone(item);
            return this.props.viewProps.resolveImageData(newItem, this.props.viewProps.siteData.serviceTopology, this.props.viewProps.packageName);
        }, this);

        return {
            items: items
        };
    }

    /**
     * @class proxies.SliderGallery
     * @extends proxies.mixins.baseProxy
     */
    return {
        mixins: [baseProxy],
        useSkinInsteadOfStyles: true,
        renderProxy: function () {
            var componentType = 'wysiwyg.viewer.components.SliderGallery';
            var data = convertData.call(this);
            var compProp = getCompProp.call(this);

            var sliderProps = _.merge(this.getChildCompProps(componentType),
                {
                    compData: typesConverter.imageList(data, this.props.viewProps.resolveImageData, this.props.viewProps.siteData.serviceTopology, this.props.viewProps.siteData),
                    compProp: compProp,
                    onImageSelected:  this.handleViewEvent,
                    structure: this.props.structure
                });

            var props = {
                'data-proxy-name': 'SliderGallery',
                'data-aspect-ratio': compProp.aspectRatio,
                'data-image-mode': compProp.imageMode,
                id: sliderProps.id + '_container',
                style: sliderProps.style,
                ref: 'container'
            };

            return React.DOM.div(props, siteUtils.compFactory.getCompClass(componentType)(sliderProps));

        }
    };
});
