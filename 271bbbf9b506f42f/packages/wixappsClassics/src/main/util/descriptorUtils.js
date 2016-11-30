define(['lodash', 'utils'], function (_, utils) {
    'use strict';

    function doesAllowHeightResize(partDefinition, viewName, format) {
        var path = 'allowHeightResize';

        var configByFormat = utils.objectUtils.resolvePath(partDefinition, ["configByFormat", format, path]);
        if (configByFormat !== null) {
            return configByFormat;
        }

        var configByView = utils.objectUtils.resolvePath(partDefinition, ['configByView', viewName, path]);
        if (configByView !== null) {
            return configByView;
        }

        if (_.has(partDefinition, path)) {
            return partDefinition[path];
        }

        return false;
    }

    return {
        doesAllowHeightResize: doesAllowHeightResize
    };
});
