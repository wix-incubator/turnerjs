define(['layout/wixappsLayout/proxyLayoutRegistrar'],
    function (/** layout.proxyLayoutRegistrar */ proxyLayoutRegistrar) {
    'use strict';
    function measureButton(proxyNode, siteData, measureMap) {
        var compId = proxyNode.id;

        measureMap.width[compId] = proxyNode.offsetWidth;
        measureMap.height[compId] = proxyNode.offsetHeight;

        return {
            comp: {
                compType: 'wysiwyg.viewer.components.SiteButton',
                compId: compId,
                structureInfo: {
                    dataItem: null,
                    propertiesItem: null,
                    layout: null,
                    styleItem: null
                }
            },
            domManipulations: []
        };
    }


    proxyLayoutRegistrar.registerCustomMeasure("Button", measureButton);
    proxyLayoutRegistrar.registerCustomMeasure("Button2", measureButton);
});
