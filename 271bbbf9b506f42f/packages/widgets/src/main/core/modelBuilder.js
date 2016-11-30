define([
    'lodash',
    'coreUtils',
    'widgets/utils/wixCodeRemoteModelService',
    'widgets/core/modelBuilderDataHelper'
], function(_, utils, wixCodeRemoteModelService, modelBuilderDataHelper){
    'use strict';

    var siteConstants = utils.siteConstants;

    function generateRMIs(runtimeDal, contextIdToCompIds, onModelUpdateCallback, fetchPagesData) {
        return _.mapValues(contextIdToCompIds, function(contextCompIds, contextId){
            return wixCodeRemoteModelService.generateRemoteModelInterface(runtimeDal, contextCompIds, fetchPagesData(), onModelUpdateCallback, contextId);
        }, this);
    }

    function getRootComponentIds(rootId, componentsFetcher) {
        var compIdsToExclude = [siteConstants.PAGES_CONTAINER_ID, siteConstants.SITE_PAGES_ID];
        var pageComponents = componentsFetcher(rootId, rootId);
        return _(pageComponents)
            .omit([siteConstants.SITE_STRUCTURE_ID])
            .keys()
            .difference(compIdsToExclude)
            .value();
    }

    function isPageContext(rootId, fetchData) {
        var widgetData = fetchData(rootId, rootId);
        var widgetType = modelBuilderDataHelper.getWidgetType(widgetData);
        return widgetType === modelBuilderDataHelper.WIDGET_TYPES.PAGE;
    }

    function collectComponents(rootIds, componentsFetcher, fetchData) {
        var masterPageId = utils.siteConstants.MASTER_PAGE_ID;
        var masterPageComponents = getRootComponentIds(masterPageId, componentsFetcher);
        var appsRootIds = _.without(rootIds, masterPageId);

        return _.transform(appsRootIds, function(acc, rootId){
            acc[rootId] = getRootComponentIds(rootId, componentsFetcher);
            if (isPageContext(rootId, fetchData)) {
                acc[rootId] = acc[rootId].concat(masterPageComponents);
            }
        }, {});
    }

    function buildModel(runtimeDal, siteData, contextIds, onModelUpdateCallback, componentsFetcher){
        var dataAPI = modelBuilderDataHelper.getApi(siteData);
        var contextComponents = collectComponents(contextIds, componentsFetcher, dataAPI.fetchData);
        return generateRMIs(runtimeDal, contextComponents, onModelUpdateCallback, dataAPI.fetchPagesData);
    }

    return {
        build: buildModel
    };
});
