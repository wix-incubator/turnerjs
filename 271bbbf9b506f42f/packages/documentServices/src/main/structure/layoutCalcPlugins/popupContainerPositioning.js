define(['siteUtils', 'documentServices/component/componentStructureInfo'], function(siteUtils, componentStructureInfo){
    'use strict';

    return function fixPopupContainerLayout(ps, compPointer, newLayout){
        var layout = {
            width: newLayout.width,
            height: newLayout.height
        };
        var popupProps = componentStructureInfo.getPropertiesItem(ps, compPointer);
        layout.x = siteUtils.compAlignmentUtils.getLeft(popupProps, layout.width, ps.siteAPI.getScreenWidth(), ps.siteAPI.getSiteWidth());
        if (popupProps.alignmentType === 'fullWidth'){
            layout.x = Math.max(layout.x, 0);
        }
        var measureMap = ps.siteAPI.getSiteMeasureMap();
        layout.y = siteUtils.compAlignmentUtils.getTop(popupProps, layout.height, measureMap.innerHeight.screen);

        return layout;
    };

});