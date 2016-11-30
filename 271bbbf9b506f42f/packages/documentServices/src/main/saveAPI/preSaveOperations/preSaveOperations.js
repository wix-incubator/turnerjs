define([
        'utils',
        'documentServices/saveAPI/preSaveOperations/plugins/mobilePreSaveOperation',
        'documentServices/saveAPI/preSaveOperations/plugins/markDataAsPresetOperation',
        'documentServices/saveAPI/preSaveOperations/plugins/disallowDuplicatePageUriSeoOperation',
        'documentServices/saveAPI/preSaveOperations/plugins/disallowForbiddenPageUriSeoOperation'
    ],
    function (utils, mobilePreSaveOperation, markDataAsPresetOperation, disallowDuplicatePageUriSeoOperation, disallowForbiddenPageUriSeoOperation) {
        'use strict';

        var save = [disallowDuplicatePageUriSeoOperation, disallowForbiddenPageUriSeoOperation, mobilePreSaveOperation];
        var saveAsTemplate = [disallowDuplicatePageUriSeoOperation, disallowForbiddenPageUriSeoOperation, markDataAsPresetOperation];

        return {
            save: utils.functionUtils.runMultiple(save),
            saveAsTemplate: utils.functionUtils.runMultiple(saveAsTemplate)
        };
    });
