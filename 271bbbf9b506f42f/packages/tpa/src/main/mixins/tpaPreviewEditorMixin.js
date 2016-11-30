define(['tpa/services/tpaPreviewEditorCommunicationService'], function (tpaPreviewEditorCommunicationService) {
    'use strict';

    var openHelp = function(appDefinitionId) {
        tpaPreviewEditorCommunicationService.doPostMessage('openHelp', appDefinitionId);
    };

    return {
        openHelp: openHelp
    };
});
