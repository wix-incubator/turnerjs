define(['layout/wixappsLayout/proxyLayoutRegistrar'], function(/** layout.proxyLayoutRegistrar */ proxyLayoutRegistrar){
    "use strict";

    proxyLayoutRegistrar.registerCustomMeasure("MediaLabel", function(proxyNode, siteData, measureMap){
        var compId = proxyNode.id;

        measureMap.width[compId] = proxyNode.offsetWidth;
        measureMap.height[compId] = proxyNode.offsetHeight;

        return {
            comp: {
                compType: 'wysiwyg.viewer.components.MediaRichText',
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
    });

});
