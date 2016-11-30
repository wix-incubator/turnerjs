define(['documentServices/wixapps/utils/pathUtils'], function (pathUtils) {
    'use strict';

    function wasPartLoadedSuccessfully(ps, partName) {
        var metadata = ps.dal.getByPath(pathUtils.getAppPart2MetadataPath(partName));
        return metadata && metadata.loading === false && !metadata.error;
    }

    function wasRepoLoadedSuccessfully(ps) {
        var metadata = ps.dal.getByPath(pathUtils.getAppbuilderMetadataPath());
        return metadata && metadata.loading === false && !metadata.error;
    }

    return {
        wasPartLoadedSuccessfully: wasPartLoadedSuccessfully,
        wasRepoLoadedSuccessfully: wasRepoLoadedSuccessfully
    };
});