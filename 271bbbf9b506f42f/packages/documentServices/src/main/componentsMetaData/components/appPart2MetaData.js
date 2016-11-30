define([
    'documentServices/constants/constants',
    'documentServices/dataModel/dataModel',
    'documentServices/wixapps/services/metadata',
    'documentServices/documentMode/documentModeInfo',
    'documentServices/componentsMetaData/metaDataUtils'
], function (
    consts,
    dataModel,
    metadata,
    documentModeInfo,
    metaDataUtils
) {
    'use strict';

    function getPartName(ps, compPointer) {
        var compData = dataModel.getDataItem(ps, compPointer);
        if (!compData) {
            throw "Can't find data for component id " + compPointer.id;
        }

        return compData.appPartName;
    }

    function isDuplicatable(ps, compRef) {
        return !documentModeInfo.isMobileView(ps) && metadata.wasPartLoadedSuccessfully(ps, getPartName(ps, compRef));
    }

    //TODO: handle single item page when we'll have it
    return {
        resizableSides: [consts.RESIZE_SIDES.LEFT, consts.RESIZE_SIDES.RIGHT],
        removable: true,
        duplicatable: isDuplicatable,
        containableByStructure: metaDataUtils.notContainableByPopup,
        usingLegacyAppPartSchema: true
    };
});
