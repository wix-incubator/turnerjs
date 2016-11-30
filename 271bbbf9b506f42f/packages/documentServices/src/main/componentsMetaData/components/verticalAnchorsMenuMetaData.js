define([
    'documentServices/componentsMetaData/metaDataUtils'
], function (
    metaDataUtils
) {
    'use strict';

    return {
        styleCanBeApplied: false,
        layoutLimits: function (ps, compPointer) {
            var measureMap = ps.siteAPI.getSiteMeasureMap();
            var customMeasure = measureMap.custom[compPointer.id];

            return {
                minHeight: customMeasure.minHeight,
                minWidth: customMeasure.minWidth
            };
        },
        containableByStructure: metaDataUtils.notContainableByPopup,
        mobileConversionConfig: {
            desktopOnly: true
        }
    };
});
