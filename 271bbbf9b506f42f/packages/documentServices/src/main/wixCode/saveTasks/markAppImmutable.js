define([
    'lodash',
    'documentServices/wixCode/utils/utils',
    'documentServices/wixCode/utils/constants',
    'documentServices/wixCode/utils/traceUtils',
    'documentServices/wixCode/services/wixCodeLifecycleService',
    'wixCode'
], function(_, wixCodeUtils, constants, traceUtils, wixCodeLifecycleService, wixCode) {
    'use strict';

    function getClientSpecMap(snapshot) {
        return wixCodeUtils.extractFromSnapshot(snapshot, ['rendererModel', 'clientSpecMap'], true);
    }

    function markAppImmutable(lastSnapshot, currentSnapshot, resolve, reject) {
        var clientSpecMap = getClientSpecMap(currentSnapshot);
        var wixCodeApp = wixCode.wixCodeWidgetService.getWixCodeSpec(clientSpecMap);
        var traceEnd = wixCode.log.trace(traceUtils.getParams(currentSnapshot, 'markAppImmutable'), traceUtils.getBaseDomain(currentSnapshot));

        if (!wixCodeApp) {
            traceEnd({message: 'no wix code app'});
            resolve();
            return;
        }

        var readOnly = currentSnapshot.getIn(constants.paths.IS_APP_READ_ONLY);
        if (readOnly) {
            traceEnd({message: 'no changes'});
            resolve();
            return;
        }

        wixCodeLifecycleService.markAppImmutable(currentSnapshot)
            .then(function() {
                traceEnd();
                resolve(createDALUpdateObject());
            })
            .catch(function(error) {
                traceEnd({level: wixCode.log.levels.ERROR, message: error});
                reject(error);
            });

        function createDALUpdateObject() {
            var updateObject = {};
            var readOnlyKey = constants.paths.IS_APP_READ_ONLY.join('.');
            updateObject[readOnlyKey] = true;
            return updateObject;
        }
    }

    return {
        partialSave: markAppImmutable,
        fullSave: markAppImmutable,
        firstSave: markAppImmutable,
        saveAsTemplate: markAppImmutable,
        publish: function (currentData, resolve) {
            resolve();
        },
        getTaskName: function () {
          return 'markAppImmutable';
        }
    };
});
