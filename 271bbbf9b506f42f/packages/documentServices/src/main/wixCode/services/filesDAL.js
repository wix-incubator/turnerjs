define([
    'lodash',
    'documentServices/wixCode/services/wixCodeLifecycleService',
    'documentServices/wixCode/services/wixCodeFileCacheService',
    'documentServices/platform/platform',
    'documentServices/constants/constants'
], function (_, wixCodeLifecycleService, wixCodeFileCacheService, platform, constants) {

    'use strict';

    function updatePagePlatformApp(ps, fileId) {
        var filePath = fileId.split('/');
        if (filePath.length === 3 && _.startsWith(fileId, 'public/pages')) {
            var pageId = filePath[2].replace('.js', '');
            var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
            if (pagePointer) {
                platform.updatePagePlatformApp(ps, pagePointer, 'wixCode', true);
            }
        }
    }

    function updateFileContent(ps, fileId, newValue) {
        var pointer = ps.pointers.wixCode.getModifiedFileContent(fileId);
        ps.dal.set(pointer, newValue);

        wixCodeFileCacheService.notifyFileModified(ps, fileId);

        var ensureAppIsWriteable = wixCodeLifecycleService.ensureAppIsWriteable(ps);
        ensureAppIsWriteable.then(_.partial(updatePagePlatformApp, ps, fileId));
        return ensureAppIsWriteable;
    }

    return {
        updateFileContent: updateFileContent
    };
});
