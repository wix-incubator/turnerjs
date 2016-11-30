define([
    'lodash',
    'wixCode',
    'documentServices/wixCode/utils/constants',
    'documentServices/siteMetadata/clientSpecMap'
], function (_, wixCode, constants, clientSpecMap) {
    'use strict';

    function _getAppId(ps) {
        var wixCodeApp = _.first(clientSpecMap.filterAppsDataByType(ps, constants.WIX_CODE_SPEC_TYPE));
        return wixCodeApp ? wixCodeApp.extensionId : '';
    }

    function _getUserId(ps) {
        return ps.dal.get(ps.pointers.general.getUserId()) || '00000000-0000-0000-0000-000000000000';
    }

    function _getBaseDomain(ps) {
        var pointer = ps.pointers.general.getServiceTopology();
        return ps.dal.get(ps.pointers.getInnerPointer(pointer, 'baseDomain'));
    }

    function _getExtendedParams(ps, params) {
        var addedParams = {
            appId: _getAppId(ps),
            userId: _getUserId(ps)
        };

        return _.assign({}, addedParams, params);
    }

    function trace(ps, params) {
        var extendedParams = _getExtendedParams(ps, params);

        return wixCode.log.trace(extendedParams, _getBaseDomain(ps));
    }

    return {
        levels: wixCode.log.levels,
        trace: trace
    };
});
