define([
    'lodash',
    'immutable',
    'immutableDiff'
], function (_, Immutable, immutableDiff) {
    'use strict';

    function mergeOverrideDataForRuntimeComponents(displayedSiteData, viewMode, displayedDAL, pointers) {
        var runtimeComps = _.get(displayedSiteData.runtime, 'components', {});

        _.forEach(runtimeComps, function (compRuntime, compId) {
            //TODO Add other overrides from the runtime
            var dataOverride = _.get(compRuntime, 'overrides.data', null);
            if (!dataOverride) {
                return;
            }

            var dataQuery = displayedDAL.get(
                pointers.getInnerPointer({type: viewMode, id: compId}, 'dataQuery'));
            var dataPointer = pointers.data.getDataItem(dataQuery.replace("#", ""));

            displayedDAL.merge(dataPointer, dataOverride);
        });
    }

    function extractPagesData(renderedRoots, displayedDAL, pointers) {
        return _.reduce(renderedRoots, function (acc, pageId) {
            acc[pageId] = Immutable.fromJS(displayedDAL.get(pointers.page.getPagePointer(pageId)));
            return acc;
        }, {});
    }

    function createDiffs(original, updated) {
        return _.mapValues(original, function (data, pageId) {
            var updatedPageData = updated[pageId];
            return updatedPageData ? immutableDiff(data, updatedPageData).toJS() : data;
        });
    }

    function extractSiteData(viewerPrivateServices, displayedSiteData, viewMode, renderedRoots) {
        var pointers = viewerPrivateServices.pointers;
        var displayedDAL = viewerPrivateServices.displayedDAL;

        var originalPagesData = extractPagesData(renderedRoots, displayedDAL, pointers);

        mergeOverrideDataForRuntimeComponents(displayedSiteData, viewMode, displayedDAL, pointers);

        var mergedPagesData = extractPagesData(renderedRoots, displayedDAL, pointers);

        return createDiffs(originalPagesData, mergedPagesData);
    }

    return {
        extractSiteData: extractSiteData
    };
});
