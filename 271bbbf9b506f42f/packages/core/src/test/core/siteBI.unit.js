define(['definition!core/core/siteBI', 'utils', 'core/bi/events', 'lodash', 'zepto', 'fonts', 'testUtils'], function (siteBiDef, utils, events, _, $, fontsPkg, testUtils) {
    'use strict';
    var logger = utils.logger;

    describe('siteBI', function () {
        var siteBI = siteBiDef(_, $, utils, events, fontsPkg);

        it('should be a function', function () {
            expect(siteBI).toEqual(jasmine.any(Object));
            expect(siteBI.init).toEqual(jasmine.any(Function));
            expect(siteBI.send).toEqual(jasmine.any(Function));
        });

        function genMocSiteData() {
            return {
                forceBI: true,
                siteHeader: {
                    userId: 'userId'
                },
                serviceTopology: {
                    biServerUrl: 'http://frog.wixpress.com',
                    serverName: 'server.name'
                },
                santaBase: '//static.parastorage.com/services/santa/1.999.0/',
                viewMode: 'site',
                currentUrl: {
                    query: {

                    },
                    full: 'http://www.someFullUrl.com/asdasdasd'
                },
                rendererModel: {
                    siteInfo: {
                        documentType: 'UGC'
                    }
                },
                publicModel: {
                    timeSincePublish: 1100
                },
                siteId: 'siteID',
                googleAnalytics: 'UA-12345-AC130',
                isDebugMode: function () {
                    return false;
                },
                getMetaSiteId: function () {
                    return 'metaSiteID';
                },
                getCurrentUrlPageId: function () {
                    return 'page id';
                },
                isPremiumDomain: function () {
                    return true;
                },
                isPremiumUser: function () {
                    return true;
                },
                getServiceTopologyProperty: function () {
                    return null;
                },
                wixBiSession: {
                    viewerSessionId: 1234,
                    initialTimestamp: 1000
                }
            };
        }



        describe('siteBI performance', function () {
            var origGetEntriesByName;
            var origReportBI;
            var mockSiteData;

            beforeEach(function () {
                jasmine.clock().install();

                // Prevent load image data from executing
                if (window && window.performance) {
                    origGetEntriesByName = window.performance.getEntriesByName;
                    window.performance.getEntriesByName = null;
                }

                origReportBI = logger.reportBI;
                logger.reportBI = jasmine.createSpy('reportBI');

                mockSiteData = genMocSiteData();
                siteBI.init(mockSiteData);
            });

            afterEach(function () {
                if (origGetEntriesByName) {
                    window.performance.getEntriesByName = origGetEntriesByName;
                }
                logger.reportBI = origReportBI;
                jasmine.clock().uninstall();
            });

            it('should invoke performance BI up to 3 times, once every 10 seconds', function () {
                expect(logger.reportBI.calls.count()).toBe(0);
                jasmine.clock().tick(4999);
                expect(logger.reportBI.calls.count()).toBe(0);
                jasmine.clock().tick(1);
                expect(logger.reportBI.calls.count()).toBe(1);
                jasmine.clock().tick(10000);
                expect(logger.reportBI.calls.count()).toBe(2);
                jasmine.clock().tick(15000);
                expect(logger.reportBI.calls.count()).toBe(3);
                jasmine.clock().tick(10000);
                expect(logger.reportBI.calls.count()).toBe(3);
            });

            it('should invoke performance BI only until lastTimeStamp is set', function () {
                mockSiteData.wixBiSession.lastTimeStamp = 1;
                jasmine.clock().tick(10000);
                expect(logger.reportBI.calls.count()).toBe(1);
                jasmine.clock().tick(10000);
                expect(logger.reportBI.calls.count()).toBe(1);
            });

            it('should have valid BI performance args', function () {
                var args;
                var payload;

                jasmine.clock().tick(5000);
                args = logger.reportBI.calls.mostRecent().args;
                expect(args[0]).toBe(mockSiteData);
                expect(args[1]).toBe(events.PAGE_PERFORMANCE_DATA);

                payload = args[2];
                expect(payload.timeoutSeconds).toBe(5);
                expect(JSON.parse.bind(JSON, payload.preClient)).not.toThrow();
                expect(JSON.parse.bind(JSON, payload.client)).not.toThrow();
                expect(JSON.parse(payload.client).initialTimestamp).toBe(0);

                jasmine.clock().tick(10000);
                args = logger.reportBI.calls.mostRecent().args;
                expect(args[0]).toBe(mockSiteData);
                expect(args[1]).toBe(events.PAGE_PERFORMANCE_DATA);

                payload = args[2];
                expect(payload.timeoutSeconds).toBe(15);
                expect(JSON.parse.bind(JSON, payload.preClient)).not.toThrow();
                expect(JSON.parse.bind(JSON, payload.client)).not.toThrow();
                expect(JSON.parse(payload.client).initialTimestamp).toBe(0);

                jasmine.clock().tick(15000);
                args = logger.reportBI.calls.mostRecent().args;
                expect(args[0]).toBe(mockSiteData);
                expect(args[1]).toBe(events.PAGE_PERFORMANCE_DATA);

                payload = args[2];
                expect(payload.timeoutSeconds).toBe(30);
                expect(JSON.parse.bind(JSON, payload.preClient)).not.toThrow();
                expect(JSON.parse.bind(JSON, payload.client)).not.toThrow();
                expect(JSON.parse(payload.client).initialTimestamp).toBe(0);
            });
        });

        describe('siteBI images', function () {
            var canPerform = window.performance && window.performance.getEntriesByName;

            var origReportBI;
            var mockSiteData;

            beforeEach(function () {
                jasmine.clock().install();

                origReportBI = logger.reportBI;
                logger.reportBI = jasmine.createSpy('reportBI');

                mockSiteData = genMocSiteData();
                siteBI.init(mockSiteData);
            });

            afterEach(function () {
                logger.reportBI = origReportBI;
                jasmine.clock().uninstall();
            });

            it('should perform images BI once, after 10.5 seconds', function () {
                jasmine.clock().tick(10000);
                logger.reportBI = jasmine.createSpy('reportBI');
                jasmine.clock().tick(500);
                expect(logger.reportBI.calls.count()).toBe(canPerform ? 1 : 0);
            });

            it('should have valid BI images args', function () {
                if (canPerform) {
                    jasmine.clock().tick(10500);
                    var args = logger.reportBI.calls.mostRecent().args;
                    expect(args[0]).toBe(mockSiteData);
                    expect(args[1]).toBe(events.LOAD_IMAGES_DATA);
                    expect(JSON.parse.bind(JSON, args[2].imagePerf)).not.toThrow();
                }
            });
        });

        // Experiment fontsTrackingInViewer
        describe('Fonts tracking', function () {
            var fakeSiteData = genMocSiteData();
            var fontsTracker;

            beforeEach(function(){
                testUtils.experimentHelper.openExperiments(['fontsTrackingInViewer']);
                siteBI = siteBiDef(_, $, utils, events, fontsPkg);
                fontsTracker = fontsPkg.fontsTracker;
            });

            it('should query fontsTracker whether fonts should be tracked', function() {
                spyOn(fontsTracker, 'shouldTrackFonts').and.callFake(_.noop);

                siteBI.trackFontsIfNeeded(fakeSiteData, 'fakePageID');
                expect(fontsTracker.shouldTrackFonts).toHaveBeenCalledWith(fakeSiteData, 'fakePageID');
            });

            it('should report bi if "shouldTrackFonts()" returns true', function() {
                spyOn(fontsTracker, 'shouldTrackFonts').and.returnValue(true);
                spyOn(logger, 'reportBI');

                siteBI.trackFontsIfNeeded(fakeSiteData);
                expect(logger.reportBI).toHaveBeenCalled();
            });

            it('should NOT report bi if "shouldTrackFonts()" returns false', function() {
                spyOn(fontsTracker, 'shouldTrackFonts').and.returnValue(false);
                spyOn(logger, 'reportBI');

                siteBI.trackFontsIfNeeded(fakeSiteData);
                expect(logger.reportBI).not.toHaveBeenCalled();
            });

            it('should only report once if "shouldTrackFonts()" returns true', function() {
                spyOn(fontsTracker, 'shouldTrackFonts').and.returnValue(true);
                spyOn(logger, 'reportBI');

                siteBI.trackFontsIfNeeded(fakeSiteData);
                siteBI.trackFontsIfNeeded(fakeSiteData);
                expect(logger.reportBI.calls.count()).toBe(1);
            });
        });
    });
});
