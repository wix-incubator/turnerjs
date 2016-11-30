define(['lodash',
    'documentServices/siteMetadata/generalInfo',
    'documentServices/tpa/constants'
], function (_, generalInfo, tpaConstants) {
    'use strict';

    var getRenderedReactCompsByCompIds = function (siteAPI, compIds) {
        var comps = [];
        _.forEach(compIds, function (compId) {
            var comp = siteAPI.getComponentById(compId);
            if (comp) {
                comps.push(comp);
            }
        });
        return comps;
    };

    var isSiteSaved = function (ps) {
        return !generalInfo.isFirstSave(ps);
    };

    var isTpaByCompType = function (compType) {
        return _.includes(tpaConstants.COMP_TYPES, compType) || _.includes(tpaConstants.TPA_COMP_TYPES, compType);
    };

    var isTpaByAppType = function (appDataType) {
        return !(appDataType === 'wixapps' || appDataType === 'appbuilder');
    };

    var isTpaByDataType = function (dataType) {
        return _.includes(tpaConstants.DATA_TYPE, dataType);
    };

    return {
        getRenderedReactCompsByCompIds: getRenderedReactCompsByCompIds,
        isSiteSaved: isSiteSaved,
        isTpaByCompType: isTpaByCompType,
        isTpaByAppType: isTpaByAppType,
        isTpaByDataType: isTpaByDataType
    };
});
