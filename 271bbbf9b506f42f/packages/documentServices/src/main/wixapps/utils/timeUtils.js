define(['lodash', 'documentServices/wixapps/utils/pathUtils'], function (_, pathUtils) {
    'use strict';

    function normalizeDate(ps, now) {
        var path = pathUtils.getOffsetFromServerTimePath();
        var offset = ps.dal.getByPath(path);
        return (new Date(now - offset)).toISOString();
    }

    return {
        getCurrentTime: function (ps) {
            return normalizeDate(ps, _.now());
        },
        normalizeDate: normalizeDate
    };
});


