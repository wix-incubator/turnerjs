define([
    'lodash',
    'siteUtils/customDataResolvers/imageDataResolver',
    'siteUtils/customDataResolvers/pageLinkDataResolver',
    'siteUtils/customDataResolvers/connectionListDataResolver',
    'siteUtils/customDataResolvers/appControllerDataResolver',
    'siteUtils/customDataResolvers/behaviorsListDataResolver'
], function (_, imageDataResolver, pageLinkDataResolver, connectionListDataResolver, appControllerDataResolver, behaviorsListDataResolver) {
    'use strict';
    return {
        Image: imageDataResolver,
        PageLink: pageLinkDataResolver,
        ConnectionList: connectionListDataResolver,
        AppController: appControllerDataResolver,
        ObsoleteBehaviorsList: behaviorsListDataResolver
    };
});
