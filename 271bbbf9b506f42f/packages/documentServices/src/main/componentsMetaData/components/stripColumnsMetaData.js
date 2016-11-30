/**
 * Created by avim on 1/17/16.
 */
define([
    'documentServices/constants/constants',
    'documentServices/componentsMetaData/metaDataUtils',
    'documentServices/documentMode/documentModeInfo',
    'documentServices/dataModel/dataModel'
], function(constants, metaDataUtils, documentModeInfo, dataModel) {
    'use strict';

    var ALLOWED_COLUMN_TYPE = 'wysiwyg.viewer.components.Column';

    return {
        canContain: function (ps, compPointer, potentialChildCompPtr) {
            var childType = metaDataUtils.getComponentType(ps, potentialChildCompPtr);
            return childType === ALLOWED_COLUMN_TYPE;
        },
        containableByStructure: metaDataUtils.containableByFullWidthPopup,
        moveDirections: [constants.MOVE_DIRECTIONS.VERTICAL],
        resizableSides: function (ps, compPtr) {
            var isSingleColumnStrip = ps.pointers.components.getChildren(compPtr).length === 1;
            if (ps.siteAPI.isMobileView() && !isSingleColumnStrip) {
                return [];
            }

            return [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.BOTTOM];
        },
        fullWidth: function (ps, compPointer) {
            var propertiesItem = dataModel.getPropertiesItem(ps, compPointer);
            return propertiesItem.fullWidth;
        },
        fullWidthByStructure: function (ps, compStructure) {
            return compStructure.props.fullWidth;
        },
        canBeFixedPosition: false,
        mobileConversionConfig: {
            filterChildrenWhenHidden: true,
            isScreenWidth: true,
            marginX: 0,
            category: 'columns'
        }
    };
});
