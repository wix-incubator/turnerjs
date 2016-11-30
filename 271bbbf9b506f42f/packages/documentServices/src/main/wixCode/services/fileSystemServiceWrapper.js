define([
    'lodash',
    'documentServices/wixCode/services/wixCodeLifecycleService',
    'documentServices/wixCode/services/wixCodeFileCacheService',
    'documentServices/wixCode/services/wixCodeModelService',
    'documentServices/wixCode/services/saveService',
    'documentServices/wixCode/services/fileSystemService',
    'documentServices/wixCode/utils/utils',
    'documentServices/wixCode/utils/constants',
    'documentServices/siteMetadata/clientSpecMap'
], function (_, wixCodeLifecycleService, wixCodeFileCacheService, wixCodeModelService, saveService, fileSystemService, utils, constants, clientSpecMap) {

    'use strict';

    function createNewArguments(ps, args) {
        var clientSpec = _.first(clientSpecMap.filterAppsDataByType(ps, constants.WIX_CODE_SPEC_TYPE));
        var gridAppId = wixCodeModelService.getGridAppId(ps);
        var scari = wixCodeModelService.getScari(ps);
        var serviceTopology = ps.dal.get(ps.pointers.general.getServiceTopology());
        var codeAppInfo = utils.createCodeAppInfo(serviceTopology.wixCloudEditorBaseUrl, gridAppId, clientSpec.signature, scari);

        var argsWithoutPrivateServices = _.rest(args);
        return [codeAppInfo].concat(argsWithoutPrivateServices);
    }

    function callFsFunction(funcName, ps, originalArgs) {
        return fileSystemService[funcName].apply(fileSystemService, createNewArguments(ps, originalArgs));
    }

    function proxyToFileSystemServiceFunction(funcName, isWriteOperation) {
        if (isWriteOperation) {
            return function ensureWriteableAndProxy(ps) {
                return wixCodeLifecycleService.ensureAppIsWriteable(ps)
                    .then(_.partial(saveService.save, ps))
                    .then(_.partial(wixCodeFileCacheService.reset, ps))
                    .then(_.partial(callFsFunction, funcName, ps, arguments));
            };
        }

        return function proxy(ps) {
            return callFsFunction(funcName, ps, arguments);
        };
    }

    return {
        getRoots: proxyToFileSystemServiceFunction('getRoots'),
        createFolder: proxyToFileSystemServiceFunction('createFolder', true),
        createFile: proxyToFileSystemServiceFunction('createFile', true),
        create: proxyToFileSystemServiceFunction('create', true),
        deleteItem: proxyToFileSystemServiceFunction('deleteItem', true),
        copy: proxyToFileSystemServiceFunction('copy', true),
        move: proxyToFileSystemServiceFunction('move', true),
        getChildren: proxyToFileSystemServiceFunction('getChildren'),
        getMetadata: proxyToFileSystemServiceFunction('getMetadata'),
        readFile: proxyToFileSystemServiceFunction('readFile'),
        writeFile: proxyToFileSystemServiceFunction('writeFile', true),
        read: proxyToFileSystemServiceFunction('read'),
        getVirtualDescriptor: proxyToFileSystemServiceFunction('getVirtualDescriptor')
    };
});
