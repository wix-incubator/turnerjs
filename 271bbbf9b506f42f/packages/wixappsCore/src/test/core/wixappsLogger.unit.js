define(["lodash", "wixappsCore/core/wixappsLogger", "utils", "testUtils"], function (_, /** wixappsCore.wixappsLogger */ wixappsLogger, utils, testUtils) {
    "use strict";

    describe("wixappsLogger", function () {
        var logger, siteData, mockParams, errorDefaultValues, eventDefaultValues;

        beforeEach(function() {
            logger = utils.logger;
            spyOn(logger, 'reportBI');
            siteData = siteData || testUtils.mockFactory.mockSiteData();
            mockParams = {
                dataSelector: "mockData"
            };
            errorDefaultValues = {
                desc: "WixApps unspecified error",
                errorCode: -20000,
                type: 10,
                issue: 0,
                severity: 30,
                category: 2,
                src: 60
            };
            eventDefaultValues = {
                type: 40,
                adapter: 'lists',
                category: 2,
                src: 60
            };
        });

        it("should report default error values when no error given", function() {
            var emptyError = {};
            wixappsLogger.reportError(siteData, emptyError, mockParams);
            expect(logger.reportBI).toHaveBeenCalledWith(siteData, errorDefaultValues, mockParams);
        });

        it("should report default event values when no event given", function() {
            var emptyEvent = {};
            wixappsLogger.reportEvent(siteData, emptyEvent, mockParams);
            expect(logger.reportBI).toHaveBeenCalledWith(siteData, eventDefaultValues, mockParams);
        });

        it("should report an error with specific given values instead of the defaults", function() {
            var errorWithMissingSrcAndExtraParam = {
                desc: "Mock Error",
                errorCode: 12345,
                type: 55,
                issue: 3,
                severity: 57,
                category: 34,
                extraParam: "extra param"
            };
            var expectedError = _.cloneDeep(errorWithMissingSrcAndExtraParam);
            expectedError.src = 60;
            wixappsLogger.reportError(siteData, errorWithMissingSrcAndExtraParam, mockParams);
            expect(logger.reportBI).toHaveBeenCalledWith(siteData, expectedError, mockParams);
        });

        it("should report an event with specific given values instead of the defaults", function() {
            var eventWithMissingSrcAndExtraParam = {
                type: 53,
                adapter: 'non default adapter',
                category: 254,
                extraParam: "extra param"
            };
            var expectedEvent = _.cloneDeep(eventWithMissingSrcAndExtraParam);
            expectedEvent.src = 60;
            wixappsLogger.reportEvent(siteData, eventWithMissingSrcAndExtraParam, mockParams);
            expect(logger.reportBI).toHaveBeenCalledWith(siteData, expectedEvent, mockParams);
        });

    });

});
