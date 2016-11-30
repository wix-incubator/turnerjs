define([
    'lodash',
    'documentServices/wixCode/wixCode',
    'documentServices/wixCode/services/filesDAL',
    'documentServices/wixCode/services/saveService',
    'documentServices/wixCode/services/kibanaReporterWrapper',
    'documentServices/wixCode/services/fileSystemServiceWrapper'
], function (
    _,
    wixCode,
    filesDAL,
    saveService,
    kibanaReporterWrapper,
    fileSystemServiceWrapper
) {
    'use strict';

    return {
        methods: {
            wixCode: {
                provision: {dataManipulation: wixCode.provision, isAsyncOperation: true},
                isProvisioned: wixCode.isProvisioned,
                getClientSpec: wixCode.getClientSpec,
                generateRemoteModelInterface: wixCode.generateRemoteModelInterface,
                getWidgetRef: wixCode.getWidgetRef,
                saveAPI: saveService,
                log: {
                    levels: kibanaReporterWrapper.levels,
                    trace: kibanaReporterWrapper.trace
                },
                fileSystem: {
                    flush: saveService.save,
                    updateFileContent: filesDAL.updateFileContent,
                    read: fileSystemServiceWrapper.read,
                    readFile: fileSystemServiceWrapper.readFile,
                    create: fileSystemServiceWrapper.create,
                    createFolder: fileSystemServiceWrapper.createFolder,
                    createFile: fileSystemServiceWrapper.createFile,
                    writeFile: fileSystemServiceWrapper.writeFile,
                    getChildren: fileSystemServiceWrapper.getChildren,
                    deleteItem: fileSystemServiceWrapper.deleteItem,
                    move: fileSystemServiceWrapper.move,
                    getRoots: fileSystemServiceWrapper.getRoots,
                    getVirtualDescriptor: fileSystemServiceWrapper.getVirtualDescriptor
                }
            }
        },
        initMethod: wixCode.initializeWixCode.bind(wixCode)
    };
});
