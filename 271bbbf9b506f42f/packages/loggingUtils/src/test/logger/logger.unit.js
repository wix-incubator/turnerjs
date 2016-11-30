define(['definition!loggingUtils/logger/logger', 'fake!loggingUtils/bi/bi', 'lodash', 'coreUtils'
    ], function (LoggerDef, bi, _, coreUtils) {
    'use strict';

    var logger, beat;


    describe('biLogger Tests', function () {
        var mockSiteData, expectedSiteParams;

        beforeEach(function () {

            bi.wixBI.report = jasmine.createSpy('report');
            bi.googleAnalytics.reportPageEvent = jasmine.createSpy('reportPageEvent');
            bi.yandexMetrika.initialize = jasmine.createSpy('yandexMetrikaInitialize');
            bi.yandexMetrika.reportPageHit = jasmine.createSpy('yandexMetrikaReportPageHit');

            spyOn(coreUtils.cookieUtils, 'getCookie').and.callFake(function(name) {
                return name;
            });

            spyOn(coreUtils.guidUtils, 'getGUID').and.returnValue(1234);

            beat = {
                reportBeatEvent: _.noop,
                shouldIncludeInSampleRatio: function (siteData, sampleRatio) {
                    if (!sampleRatio) {
                        return true;
                    }
                    var sampleRatioState = siteData.currentUrl.query.sampleratio;
                    if (siteData.isDebugMode() && (sampleRatioState !== 'force') || sampleRatioState === 'none') {
                        return true;
                    }
                    return Math.floor(siteData.wixBiSession.random * sampleRatio) === 0;
                }
            };
            logger = new LoggerDef(_, bi, beat, coreUtils);

            mockSiteData = {
                siteHeader: {
                    userId: 'userId'
                },
                serviceTopology: {
                    biServerUrl: 'http://frog.wixpress.com',
                    serverName: 'server.name'
                },
                viewMode: 'site',
                currentUrl: {
                    query: {

                    },
                    full: 'http://www.someFullUrl.com/asdasdasd'
                },
                rendererModel: {
                    siteInfo: {
                        documentType: 'UGC'
                    },
                    premiumFeatures: []
                },
                publicModel: {
                    timeSincePublish: 1100
                },
                siteId: 'siteID',
                googleAnalytics: 'UA-12345-AC130',
                wixBiSession: {
                    viewerSessionId: 1234,
                    initialTimeStamp: 1000
                },
                santaBase: '//static.parastorage.com/services/santa/1.356.14/',
                isDebugMode: function(){
                    return false;
                },
                getMetaSiteId: function(){
                    return 'metaSiteID';
                },
                isPremiumDomain: function() {
                    return _.includes(this.rendererModel.premiumFeatures, 'HasDomain');
                },
                isPremiumUser: function() {
                    return true;
                },
                getServiceTopologyProperty: function(){
                    return null;
                },
                isWixSite: function () {
                    return false;
                }
            };
        });

        it('Should have a report function', function () {
            expect(logger.reportBI).toBeDefined();
        });

        it('Should have a reportPageEvent function', function() {
            expect(logger.reportPageEvent).toBeDefined();
        });

        describe('reportBI', function() {

            describe('report event to WixBI', function () {

                var event, error;

                beforeEach(function () {
                    event = {
                        reportType: 'event',
                        eventId: 1234,
                        adapter: 'someAdapter',
                        src: 42,
                        sampleRatio: 0
                    };

                    error = {
                        reportType: 'error',
                        errorCode: 10119,
                        errorName: 'SOME_ERROR_NAME',
                        adapter: 'someAdapter',
                        src: 42,
                        severity: 'error',
                        packageName: 'myPackage'
                    };

                    expectedSiteParams = {
                        src: 42,
                        did: 'siteID',
                        msid: 'metaSiteID',
                        majorVer: 4,
                        ver: '1.356.14',
                        server: 'server',
                        viewMode: 'site',
                        vsi: 1234
                    };
                });

                describe('reporting events', function () {

                    it('Should not report without site data', function () {
                        logger.reportBI();

                        expect(bi.wixBI.report).not.toHaveBeenCalled();
                    });

                    it('Should not report without report definition', function () {
                        var siteData = mockSiteData;

                        logger.reportBI(siteData);

                        expect(bi.wixBI.report).not.toHaveBeenCalled();
                    });

                    it('Should not report if "suppressbi" parameter is passed in the url', function () {
                        var siteData = mockSiteData;
                        _.merge(siteData.currentUrl.query, {suppressbi: 'true'});
                        logger.reportBI(siteData, event);

                        expect(bi.wixBI.report).not.toHaveBeenCalled();
                    });

                    it('Should report with 2 arguments- siteData and options', function () {
                        logger.reportBI(mockSiteData, event);

                        var mostRecentArgs = bi.wixBI.report.calls.mostRecent().args;
                        expect(mostRecentArgs.length).toEqual(2);
                    });

                    it('Should not report event that reaches its call count limit', function () {
                        var siteData = mockSiteData;
                        _.merge(event, {
                            callCount: 10,
                            callLimit: 10
                        });

                        logger.reportBI(siteData, event);

                        expect(bi.wixBI.report).not.toHaveBeenCalled();
                    });

                    it('Should count event reporting and prevent report when it reaches its call count limit', function () {
                        var siteData = mockSiteData;
                        _.merge(event, {
                            callLimit: 10
                        });

                        _.times(15, function () {
                            logger.reportBI(siteData, event);
                        });

                        expect(bi.wixBI.report.calls.count()).toEqual(10);
                    });

                    describe('sampleRatio', function () {

                        it('Should report event if no sampling', function () {
                            var siteData = mockSiteData;

                            logger.reportBI(siteData, event);

                            expect(bi.wixBI.report).toHaveBeenCalled();
                        });

                        it('Should report event in debug mode', function () {
                            var siteData = mockSiteData;
                            spyOn(siteData, 'isDebugMode').and.returnValue(true);
                            event.sampleRatio = 1000;

                            logger.reportBI(siteData, event);

                            expect(bi.wixBI.report).toHaveBeenCalled();
                        });

                        it('Should report event with sampleratio=none in the URL', function () {
                            var siteData = mockSiteData;
                            siteData.currentUrl.query = {
                                sampleratio: 'none'
                            };
                            event.sampleRatio = 1000;

                            logger.reportBI(siteData, event);

                            expect(bi.wixBI.report).toHaveBeenCalled();
                        });

                        it('Should not report event in debug mode if sampleratio=false in the url and the userId does not match the sampleRatio', function () {
                            var siteData = mockSiteData;
                            siteData.currentUrl.query = {
                                debug: 'all',
                                sampleratio: 'force'
                            };
                            event.sampleRatio = 1000;

                            logger.reportBI(siteData, event);

                            expect(bi.wixBI.report).not.toHaveBeenCalled();
                        });
                    });

                });

                describe('options argument', function () {

                    it('Should contain biUrl from siteData', function () {
                        var siteData = mockSiteData;

                        logger.reportBI(siteData, event);

                        var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                        expect(recentOptionsArg.biUrl).toEqual(siteData.serviceTopology.biServerUrl);
                    });

                    it('Should have params extracted from siteData', function () {
                        var siteData = mockSiteData;

                        logger.reportBI(siteData, {
                            sampleRatio: 0
                        });

                        var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                        expect(recentOptionsArg.params).toEqual(expectedSiteParams);
                    });

                    it('Should contain adapter from report definition', function () {
                        var siteData = mockSiteData;

                        logger.reportBI(siteData, event);

                        var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                        expect(recentOptionsArg.adapter).toEqual(event.adapter);
                    });

                    describe('event params', function () {

                        it('Should have params extracted from event definition', function () {
                            var siteData = mockSiteData;

                            logger.reportBI(siteData, event);

                            var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                            var expectedParams = _.merge(expectedSiteParams, {
                                evid: event.eventId,
                                src: event.src
                            });

                            expect(recentOptionsArg.params).toEqual(expectedParams);
                        });

                        it('Should include params that were defined in the event declaration', function () {
                            var siteData = mockSiteData;
                            var params = {a: 1, b: 2};
                            event.params = ['a', 'b'];

                            logger.reportBI(siteData, event, params);

                            var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                            var expectedParams = _.merge(
                                expectedSiteParams,
                                {
                                    evid: event.eventId,
                                    src: event.src
                                },
                                params
                            );

                            expect(recentOptionsArg.params).toEqual(expectedParams);
                        });

                        it('Should not include params that were not defined in the event declaration', function () {
                            var siteData = mockSiteData;
                            var params = {a: 1, b: 2, c: 3};
                            event.params = ['a', 'b'];

                            logger.reportBI(siteData, event, params);

                            var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                            var expectedParams = _.merge(
                                expectedSiteParams,
                                {
                                    evid: event.eventId,
                                    src: event.src
                                },
                                _.omit(params, ['c'])
                            );

                            expect(recentOptionsArg.params).toEqual(expectedParams);
                        });

                    });

                    describe('error params', function () {

                        function getErrorParams() {
                            return {
                                evid: 10,
                                errc: error.errorCode,
                                errn: error.errorName,
                                src: event.src,
                                sev: 30,
                                errscp: error.packageName,
                                cat: 2,
                                iss: 1,
                                ut: 'userType'
                            };
                        }

                        it('Should have params extracted from error definition', function () {
                            var siteData = mockSiteData;

                            logger.reportBI(siteData, error);

                            var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                            var expectedParams = _.merge(
                                expectedSiteParams,
                                getErrorParams()
                            );

                            expect(recentOptionsArg.params).toEqual(expectedParams);
                        });

                        it('Should include params that were defined in the error declaration', function () {
                            var siteData = mockSiteData;
                            var params = {
                                aaa: 'some description for p1',
                                bbb: 'some description for p2'
                            };
                            error.params = {
                                p1: 'aaa',
                                p2: 'bbb'
                            };

                            logger.reportBI(siteData, error, params);

                            var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                            var expectedParams = _.merge(
                                expectedSiteParams,
                                getErrorParams(),
                                {
                                    p1: encodeURIComponent('some description for p1'),
                                    p2: encodeURIComponent('some description for p2')
                                }
                            );

                            expect(recentOptionsArg.params).toEqual(expectedParams);
                        });

                        it('Should not include params that were not defined in the error declaration', function () {
                            var siteData = mockSiteData;
                            var params = {
                                aaa: 'some description for p1',
                                bbb: 'some description for p2',
                                ccc: 'some desc for p3'
                            };
                            error.params = {
                                p1: 'aaa',
                                p2: 'bbb'
                            };

                            logger.reportBI(siteData, error, params);

                            var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                            var expectedParams = _.merge(
                                expectedSiteParams,
                                getErrorParams(),
                                {
                                    p1: encodeURIComponent('some description for p1'),
                                    p2: encodeURIComponent('some description for p2')
                                }
                            );

                            expect(recentOptionsArg.params).toEqual(expectedParams);
                        });

                        it('Should convert the given severity according to severity map', function() {
                            var siteData = mockSiteData;
                            error.severity = 'fatal';

                            logger.reportBI(siteData, error, {});

                            var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                            expect(recentOptionsArg.params.sev).toEqual(40);
                        });

                        describe('default error params', function() {

                            it('Should set error name to "error_name_not_found" if not provided in reportDef', function(){
                                var siteData = mockSiteData;
                                error = _.omit(error, 'errorName');

                                logger.reportBI(siteData, error, {});

                                var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                                expect(recentOptionsArg.params.errn).toEqual('error_name_not_found');
                            });

                            it('Should have a default severity of 30', function() {
                                var siteData = mockSiteData;
                                error = _.omit(error, 'severity');

                                logger.reportBI(siteData, error, {});

                                var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                                expect(recentOptionsArg.params.sev).toEqual(30);
                            });

                            it('Should have a default src of 44', function() {
                                var siteData = mockSiteData;
                                error = _.omit(error, 'src');

                                logger.reportBI(siteData, error, {});

                                var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                                expect(recentOptionsArg.params.src).toEqual(44);
                            });

                        });

                        describe('built-in error params', function() {

                            it('Should have evid=10', function() {
                                var siteData = mockSiteData;

                                logger.reportBI(siteData, error, {});

                                var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                                expect(recentOptionsArg.params.evid).toEqual(10);
                            });

                            it('Should have cat=2', function() {
                                var siteData = mockSiteData;

                                logger.reportBI(siteData, error, {});

                                var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                                expect(recentOptionsArg.params.cat).toEqual(2);
                            });

                            it('Should have iss=1', function() {
                                var siteData = mockSiteData;

                                logger.reportBI(siteData, error, {});

                                var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                                expect(recentOptionsArg.params.iss).toEqual(1);
                            });

                        });


                        describe('description param', function() {

                            it('Should be converted to "desc" property', function() {
                                var siteData = mockSiteData;

                                logger.reportBI(siteData, error, {description: "Some short description"});

                                var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                                expect(recentOptionsArg.params.desc).toBeDefined();
                            });

                            it('Should be maximum 512 characters', function() {
                                var siteData = mockSiteData;
                                var desc = _.repeat('a', 513);
                                logger.reportBI(siteData, error, {description: desc});
                                var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                                expect(recentOptionsArg.params.desc.length).toEqual(512);
                            });
                        });
                    });
                });
            });

            describe("registering a set of events or errors", function () {
                it("should add the package name and report type to each definition", function () {
                    var mockEvents = {
                        "EVENT_1": {
                            "eventId": 123
                        },
                        "EVENT_2": {
                            "eventId": 456
                        }
                    };
                    var mockErrors = {
                        "ERROR_1": {
                            "errorCode": 1000
                        },
                        "ERROR_2": {
                            "errorCode": 2000
                        }
                    };

                    logger.register('fakePackageName', 'event', mockEvents);
                    logger.register('fakePackageName', 'error', mockErrors);

                    var areAllEventsRegistered = _.every(mockEvents, {packageName: 'fakePackageName'});
                    var areAllErrorsRegistered = _.every(mockErrors, {packageName: 'fakePackageName'});

                    expect(areAllErrorsRegistered && areAllEventsRegistered).toBe(true);
                });
            });

        });

        describe('reportPageEvent', function() {

            var wixAccountId = 'UA-2117194-61';
            var mockAccountId = 'UA-12345-AC130';

            beforeEach(function() {
                expectedSiteParams = {
                    accountIds: [wixAccountId, mockAccountId],
                    pageUrl: "http://shrage.wix.com/page2"
                };
            });

            it('Should not report if no siteData is passed as parameter', function() {
                logger.reportPageEvent();

                expect(bi.googleAnalytics.reportPageEvent).not.toHaveBeenCalled();
            });

            it('Should not report if no page is passed as parameter', function() {
                var siteData = mockSiteData;

                logger.reportPageEvent(siteData);

                expect(bi.googleAnalytics.reportPageEvent).not.toHaveBeenCalled();
            });

            it('Should not report if supressbi is in the URL ', function() {
                var siteData = mockSiteData;
                siteData.currentUrl.query.suppressbi = 'true';

                logger.reportPageEvent(siteData, expectedSiteParams.pageUrl);

                expect(bi.googleAnalytics.reportPageEvent).not.toHaveBeenCalled();
            });

            it('Should not report GA to Wix account if: is premium site with domain, connected to own GA account', function () {
                var siteData = mockSiteData;
                siteData.rendererModel.premiumFeatures.push('HasDomain');
                logger.reportPageEvent(siteData, expectedSiteParams.pageUrl);

                var reportedAccounts = bi.googleAnalytics.reportPageEvent.calls.mostRecent().args[1];
                expect(reportedAccounts).not.toContain(wixAccountId);
            });

            it('Should report GA to Wix account if: is premium site with domain, not connected to own GA account and tracking cookies are enabled', function () {
                var siteData = mockSiteData;
                siteData.googleAnalytics = wixAccountId;
                siteData.rendererModel.premiumFeatures.push('HasDomain');
                logger.reportPageEvent(siteData, expectedSiteParams.pageUrl);

                var reportedAccounts = bi.googleAnalytics.reportPageEvent.calls.mostRecent().args[2];
                expect(reportedAccounts).toContain(wixAccountId);
            });

            it('Should report with given pageUrl', function() {
                var siteData = mockSiteData;

                logger.reportPageEvent(siteData, expectedSiteParams.pageUrl);

                var recentArgs = bi.googleAnalytics.reportPageEvent.calls.mostRecent().args;
                expect(recentArgs[1]).toEqual(expectedSiteParams.pageUrl);
            });

            it('Should report with account ids', function() {
                var siteData = mockSiteData;

                logger.reportPageEvent(siteData, expectedSiteParams.pageUrl);

                var recentArgs = bi.googleAnalytics.reportPageEvent.calls.mostRecent().args;
                expect(expectedSiteParams.accountIds).toContain(recentArgs[2]);
            });
        });

        describe('YandexMetrika', function() {
            var tempSiteData;

            beforeEach(function () {
                tempSiteData = _.clone(mockSiteData);
                spyOn(tempSiteData, 'isPremiumDomain').and.callFake(function () {
                    return true;
                });
            });

            it('Should call bi.yandexMetrika.initialize from logger.initYandexMetrika', function () {
                var yandexMetrikaId = '12435';

                _.assign(tempSiteData, {
                    yandexMetrika: yandexMetrikaId
                });

                logger.initYandexMetrika(tempSiteData);

                expect(bi.yandexMetrika.initialize).toHaveBeenCalledWith([yandexMetrikaId]);
            });

            describe('ReportPageHit', function () {

                it('Should call bi.yandexMetrka.reportPageHit from logger.reportYandexPageHit', function () {
                    var fakeUrl = 'http://mockUrl.com/mockPath';

                    logger.reportYandexPageHit(fakeUrl);

                    expect(bi.yandexMetrika.reportPageHit).toHaveBeenCalledWith(fakeUrl);
                });

            });

        });

    });

});
