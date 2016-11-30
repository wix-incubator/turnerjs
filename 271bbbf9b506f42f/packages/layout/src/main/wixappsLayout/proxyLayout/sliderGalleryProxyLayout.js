define(['zepto', 'layout/wixappsLayout/proxyLayoutRegistrar'], function ($, /** layout.proxyLayoutRegistrar */ proxyLayoutRegistrar) {
    "use strict";

    function measureSliderGallery(proxyNode, siteData, measureMap) {
        var $node = $(proxyNode);
        var compNode = proxyNode.firstChild;
        var compId = compNode.id;
        
        var propertiesItem = {
            aspectRatio: $node.attr('data-aspect-ratio'),
            imageMode: $node.attr('data-image-mode')
        };

        measureMap.width[compId] = proxyNode.offsetWidth;
        measureMap.height[compId] = proxyNode.offsetHeight;

        return {
            comp: {
                compType: 'wysiwyg.viewer.components.SliderGallery',
                compId: compId,
                structureInfo: {
                    dataItem: null,
                    propertiesItem: propertiesItem,
                    layout: null,
                    styleItem: null
                }
            },
            domManipulations: []
        };
    }


    proxyLayoutRegistrar.registerCustomMeasure("SliderGallery", measureSliderGallery);
});