define([
    'lodash',
    'documentServices/wixCode/pointers/wixCodePointers' // load for registrations
], function (_) {
    'use strict';

    function initPaths(ps) {
        var pointersToSet = [
            ps.pointers.wixCode.getRoot(),
            ps.pointers.wixCode.getModifiedFileContentMap(),
            ps.pointers.wixCode.getFileCacheKillerMap(),
            ps.pointers.wixCode.getWixCodeModel(),
            ps.pointers.wixCode.getWixCodeAppData()
        ];

        _.forEach(pointersToSet, function (pointer) {
            if (!ps.dal.isExist(pointer)) { // DAL does not support deep merge
                ps.dal.set(pointer, {});
            }
        });
    }

    return {
        initPaths: initPaths
    };
});
