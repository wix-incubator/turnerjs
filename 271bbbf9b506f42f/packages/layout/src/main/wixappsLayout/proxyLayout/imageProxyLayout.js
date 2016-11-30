define(['zepto', 'lodash', 'layout/wixappsLayout/proxyLayoutRegistrar'], function ($, _, proxyLayoutRegistrar) {
    'use strict';


    function measureImage(proxyNode, siteData, measureMap) {
        var $node = $(proxyNode);
        var compNode = proxyNode.firstChild;
        var compId = compNode.id;

        var dataItem = {
            width: parseInt($node.attr('data-width'), 10),
            height: parseInt($node.attr('data-height'), 10),
            uri: $node.attr('data-uri'),
            quality: siteData.getGlobalImageQuality()
        };

        var propertiesItem = {
            displayMode: $node.attr('data-display-mode')
        };

        measureMap.width[compId] = proxyNode.offsetWidth;
        measureMap.height[compId] = proxyNode.offsetHeight;
        measureMap.custom[compId] = {thisIsMyHeight: measureMap.height[compId]};

        return {
            comp: {
                compType: 'wysiwyg.viewer.components.WPhoto',
                compId: compId,
                structureInfo: {
                    dataItem: dataItem,
                    propertiesItem: propertiesItem,
                    layout: null,
                    styleItem: null
                }
            },
            domManipulations: []
        };
    }

    proxyLayoutRegistrar.registerCustomMeasure("Image", measureImage);
});
