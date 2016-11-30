define(['lodash', 'RemoteModelInterface', 'utils', 'siteUtils'], function(_, RemoteModelInterface, utils, siteUtils) {
    'use strict';

    var generateRemoteModelInterface = function (runtimeDal, compIds, pagesData, onUpdateCallback, contextId) {

         var remoteModelInterface = new RemoteModelInterface(undefined, onUpdateCallback);

        //TODO - add unit test for addition of data
        _.forEach(compIds, function(compId) {
            remoteModelInterface.addComponent(compId, utils.widgetModel.getCompModel(runtimeDal, compId));
        }, this);

        remoteModelInterface.addPagesData(pagesData);

        remoteModelInterface.addConnections(utils.widgetModel.getConnectionsModel(runtimeDal, compIds, contextId));

        remoteModelInterface.addEventTypes(siteUtils.constants.ACTION_TYPES);

        return remoteModelInterface;
    };

    var createRemoteModelInterface = function(model, onUpdateCallback) {
        return new RemoteModelInterface(model, onUpdateCallback);
    };

    return {
        generateRemoteModelInterface: generateRemoteModelInterface,
        createRemoteModelInterface: createRemoteModelInterface
    };
});
