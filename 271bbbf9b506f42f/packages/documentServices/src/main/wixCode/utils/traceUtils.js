define(['wixCode'], function (wixCode) {
    'use strict';

    function getClientSpecMap(snapshot){
        return snapshot.getIn(['rendererModel', 'clientSpecMap']).toJS();
    }

    function getUserId(snapshot){
        return snapshot.getIn(['rendererModel', 'userId']);
    }

    function getParams(snapshot, actionName) {
        var clientSpecMap = getClientSpecMap(snapshot);
        var wixCodeApp = wixCode.wixCodeWidgetService.getWixCodeSpec(clientSpecMap);
        var wixCodeAppId = wixCodeApp ? wixCodeApp.extensionId : '';
        var userId = getUserId(snapshot);

        return {
            action: actionName,
            appId: wixCodeAppId,
            userId: userId
        };
    }

    function getBaseDomain(snapshot) {
        return snapshot.getIn(['serviceTopology', 'baseDomain']);
    }

    return {
        getParams: getParams,
        getBaseDomain: getBaseDomain
    };
});
