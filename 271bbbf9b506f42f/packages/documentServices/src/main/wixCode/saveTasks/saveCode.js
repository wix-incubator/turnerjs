define([
    'lodash',
    'bluebird',
    'documentServices/wixCode/services/fileSystemService',
    'wixCode',
    'documentServices/wixCode/utils/utils',
    'documentServices/wixCode/utils/constants'
], function (_, Promise, fileSystemService, wixCode, utils, constants) {
    'use strict';

    function getClientSpecMap(snapshot){
        return snapshot.getIn(['rendererModel', 'clientSpecMap']).toJS();
    }

    function getWixCloudBaseUrl(snapshot){
        return snapshot.getIn(['serviceTopology', 'wixCloudEditorBaseUrl']);
    }

    function saveCode(lastSnapshot, currentSnapshot, resolve, reject) {
        var clientSpecMap = getClientSpecMap(currentSnapshot);

        if (!wixCode.wixCodeWidgetService.hasWixCodeWidgetSpecs(clientSpecMap)) {
            resolve();
            return;
        }

        var clientSpec = wixCode.wixCodeWidgetService.getWixCodeSpec(clientSpecMap);
        var prevModifiedMap = (lastSnapshot && lastSnapshot.getIn(constants.paths.MODIFIED_FILE_CONTENTS)) ? lastSnapshot.getIn(constants.paths.MODIFIED_FILE_CONTENTS).toJS() : {};
        var modifiedMap = currentSnapshot.getIn(constants.paths.MODIFIED_FILE_CONTENTS).toJS();

        var toSave = _.transform(modifiedMap, function(acc, content, fileId) {
            var prevContent = prevModifiedMap[fileId];
            if (content !== prevContent) {
                acc.push({fileId: fileId, content: content});
            }
        }, []);

        if (_.isEmpty(toSave)) {
            resolve();
            return;
        }

        var readOnly = currentSnapshot.getIn(constants.paths.IS_APP_READ_ONLY);
        if (readOnly) {
            reject(new Error('Wix Code App is not writeable'));
            return;
        }

        var baseUrl = getWixCloudBaseUrl(currentSnapshot);
        var gridAppId = currentSnapshot.getIn(constants.paths.GRID_APP_ID);
        var scari = currentSnapshot.getIn(constants.paths.SCARI);
        var codeAppInfo = utils.createCodeAppInfo(baseUrl, gridAppId, clientSpec.signature, scari);

        var savePromises = _.map(toSave, function(entry) {
            return saveFile(codeAppInfo, entry.fileId, entry.content);
        });

        Promise.all(savePromises)
            .then(_.partial(resolve, undefined))
            .catch(reject);
    }

    function saveFile(codeAppInfo, fileId, content) {
        var descriptor = fileSystemService.getVirtualDescriptor(codeAppInfo, fileId, false);
        return fileSystemService.writeFile(codeAppInfo, descriptor, content);
    }

    return {
        partialSave: saveCode,
        fullSave: saveCode,
        firstSave: saveCode,
        saveAsTemplate: saveCode,
        publish: function (currentData, resolve) {
            resolve();
        },
        getTaskName: function () {
          return 'saveCode';
        }
    };
});
