define([
    'lodash',
    'utils',
    'wixappsClassics/core/timeout',
    'experiment'
], function (
    _,
    utils,
    TIMEOUT,
    experiment
) {
    'use strict';

    var urlUtils = utils.urlUtils;
    var BATCH_MEASUREMENT_NAME = 'batched blogAppPart BATCH';

    return {
        mergeBatchableListsRequestsIfAny: function (siteData, requests) {
            var batchablePartition = _.partition(requests, requestIsBatchable);
            var batchableRequests = batchablePartition[0];
            var mergedBatchableRequestsIfAny = _.isEmpty(batchableRequests) ? [] :
                mergeBatchableRequests(siteData, batchableRequests);

            return batchablePartition[1].concat(mergedBatchableRequestsIfAny);
        }
    };

    function requestIsBatchable(request) {
        return destinationIsInWixapps(request.destination) && urlIsBatchableOperationUrl(request.url);
    }

    function destinationIsInWixapps(destination) {
        return _.startsWith(destination, getWixappsDestination());
    }

    function urlIsBatchableOperationUrl(url) {
        var pathname = getPathnameFromUrl(url);
        var pathnameRegExp = getRegExpForMatchingBatchableOperationNameInPathname();
        return pathnameRegExp.test(pathname);
    }

    function mergeBatchableRequests(siteData, batchableRequests) {
        if (experiment.isOpen('wixappsPerformanceMeasuring')) {
            utils.performance.startOnce(BATCH_MEASUREMENT_NAME);
        }

        return {
            destination: getWixappsDestination(),
            url: urlUtils.baseUrl(siteData.getExternalBaseUrl()) + '/apps/lists/1/Batch?consistentRead=false',
            data: {operations: getOperationsForBatchableRequests(batchableRequests)},
            transformFunc: _.partial(delegateTransformationToBatchableRequests, batchableRequests),
            force: true,
            timeout: TIMEOUT
        };
    }

    function getOperationsForBatchableRequests(batchableRequests) {
        return _.map(batchableRequests, function (batchableRequest) {
            return {
                name: getBatchableOperationNameFromUrl(batchableRequest.url),
                params: batchableRequest.data
            };
        });
    }

    function getBatchableOperationNameFromUrl(url) {
        var pathname = getPathnameFromUrl(url);
        var operationNameInPathnameRegExp = getRegExpForMatchingBatchableOperationNameInPathname();
        var matches = pathname.match(operationNameInPathnameRegExp);
        return _.get(matches, 1);
    }

    function getPathnameFromUrl(url) {
        return urlUtils.parseUrl(url).path;
    }

    function getRegExpForMatchingBatchableOperationNameInPathname() {
        return /^\/apps\/lists\/1\/(GroupByAndCount|Query|ReadItem)$/;
    }

    function delegateTransformationToBatchableRequests(batchableRequests, batchResponseData, wixappsInSiteData) {
        _.forEach(batchableRequests, function (batchableRequest, index) {
            var responseData = batchResponseData.payload.results[index];
            var transformValue = _.partial(batchableRequest.transformFunc, responseData);
            var destinationInWixapps = _.difference(batchableRequest.destination, getWixappsDestination());
            transformObjectAtPath(wixappsInSiteData, destinationInWixapps, transformValue);
        });

        if (experiment.isOpen('wixappsPerformanceMeasuring')) {
            utils.performance.finish(BATCH_MEASUREMENT_NAME, true, {
                count: batchableRequests.length
            });
        }
        return wixappsInSiteData;
    }

    function getWixappsDestination() {
        return ['wixapps'];
    }

    function transformObjectAtPath(object, path, transformValue) {
        var currentValue = _.get(object, path);
        var transformedValue = transformValue(currentValue);
        _.set(object, path, transformedValue);
    }
});
