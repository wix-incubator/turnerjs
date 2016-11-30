define([
    'lodash',
    'santa-harness',
    'generalUtils'
], function (_,
             santa,
             generalUtils) {
    'use strict';

    describe('Popup google analytics report', function () {
        var ds, iframeWindow;

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                console.log('Testing popup google analytics report');
                ds = harness.documentServices;
                iframeWindow = harness.window;
                done();
            });
        });

        function getNewRequestsNames(numOfRequestsBeforeTestStated){
            var allRequestsList = iframeWindow.performance.getEntries().map(function (entry) {
                return entry.name;
            });

            return allRequestsList.splice(numOfRequestsBeforeTestStated);
        }

        function isDesiredGoogleAnalyticsRequest(customUriSEO, request){
            var googleAnalyticsRequest = _.includes(request, "google-analytics.com");
            var hasCustomUriSEO = _.includes(request, customUriSEO);
            return googleAnalyticsRequest && hasCustomUriSEO;
        }

        it('should not report google analytics on navigation to popup', function (done) {
            var numOfRequestsBeforeTestStated = iframeWindow.performance.getEntries().length;
            var popup = ds.pages.popupPages.add('popup');
            ds.pages.popupPages.open(popup.id);
            ds.waitForChangesApplied(function () {
                _.delay(function () {
                    var popupData = generalUtils.getPopupDataById(ds, popup.id);
                    var testRequests = getNewRequestsNames(numOfRequestsBeforeTestStated);
                    var predicateToDetectPopupGAReport = _.partial(isDesiredGoogleAnalyticsRequest, popupData.pageUriSEO);
                    var googleAnalyticsReportOfPopup = _.find(testRequests, predicateToDetectPopupGAReport);
                    expect(googleAnalyticsReportOfPopup).toBeUndefined();
                    done();
                }, 500);
                // a word about delay usage:
                // google-analitics report is sent with delay of 200ms
                // half a  second is taken as a buffer in beaker tests
                // we need to wait to prevent google analytics report leakage to other tests
            });
        });

        it('should report google analytics on navigation to a page', function (done) {
            var numOfRequestsBeforeTestStated = iframeWindow.performance.getEntries().length;
            var newPagePointer = ds.pages.add('new page');
            ds.pages.navigateTo(newPagePointer.id);
            ds.waitForChangesApplied(function () {
                _.delay(function () {
                    var newPageData = generalUtils.getPageDataById(ds, newPagePointer.id);
                    var testRequests = getNewRequestsNames(numOfRequestsBeforeTestStated);
                    var predicateToDetectPageGAReport = _.partial(isDesiredGoogleAnalyticsRequest, newPageData.pageUriSEO);
                    var googleAnalyticsReportOfPage = _.find(testRequests, predicateToDetectPageGAReport);
                    expect(googleAnalyticsReportOfPage).toBeDefined();
                    done();
                }, 500);
            });
        });
    });
});
