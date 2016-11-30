define(['lodash'], function (_) {
    'use strict';

    function updateCacheKillerValue(ps, pointer) {
        var newValue = Date.now().toString();
        var currentVal = ps.dal.get(pointer);
        if (currentVal === newValue) {
            newValue += '_1';
        }
        ps.dal.set(pointer, newValue);
    }

    function init(ps) {
        reset(ps);
    }

    function reset(ps) {
        // clear all file-specific cacheKiller values
        ps.dal.set(ps.pointers.wixCode.getFileCacheKillerMap(), {});

        // make "now" the default cacheKiller value so all following requests will be fresh
        updateCacheKillerValue(ps, ps.pointers.wixCode.getDefaultFileCacheKiller());
    }

    function notifyFileModified(ps, fileId) {
        if (_.startsWith(fileId, 'public/pages/')) {
            updateCacheKillerValue(ps, ps.pointers.wixCode.getFileCacheKiller(fileId));
        } else {
            // we don't know the effect of the changed public/backend file on pages' code, so we can't rely on cached scripts anymore --> reset everything
            reset(ps);
        }
    }

    return {
        init: init,
        reset: reset,
        notifyFileModified: notifyFileModified
    };
});
