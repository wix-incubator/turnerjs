define(['fake!loggingUtils/bi/bi', 'lodash', 'coreUtils', 'definition!loggingUtils/logger/beat', 'fake!loggingUtils/logger/performance'],
    function (bi, _, coreUtils, BeatDef, performance) {
    'use strict';

    var mockUtils, beat, cookieValues;

    function queryStringToObject(s) {
        return _.reduce(s.split('&'), function (result, pair) {
            pair = pair.split('=');
            result[pair[0]] = typeof pair[1] !== 'undefined' ? pair[1] : '';
            return result;
        }, {});
    }

    function uriEncodeValues(obj) {
        return _.mapValues(obj, function (value) {
            return encodeURIComponent(value);
        });
    }

    function getLastReportParams() {
        var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
        return queryStringToObject(recentOptionsArg.queryString);
    }

    describe('bibeat Tests', function () {
        var mockSiteData;

        beforeEach(function () {
            bi.wixBI.report = jasmine.createSpy('report');
            bi.googleAnalytics.reportPageEvent = jasmine.createSpy('reportPageEvent');
            cookieValues = {
                _wixUIDX: '_wixUIDX',
                svSession: 'svSession'
            };

            mockUtils = {
                stringUtils: coreUtils.stringUtils,
                cookieUtils: {
                    getCookie: function (name) {
                        if (typeof cookieValues[name] !== 'undefined') {
                            return cookieValues[name];
                        }
                        return name;
                    }
                },
                guidUtils: {
                    getGUID: function () {
                        return 1234;
                    }
                },
                urlUtils: {
                    toQueryString: coreUtils.urlUtils.toQueryString,
                    toQueryParam: coreUtils.urlUtils.toQueryParam
                }
            };

            beat = new BeatDef(_, bi, mockUtils, performance);

            mockSiteData = {
                santaBase: 'https://static.parastorage.com/services/santa/1.1254.12',
                baseVersion: '1.1254.12',
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
                    }
                },
                publicModel: {
                    timeSincePublish: 1100
                },
                siteId: 'siteID',
                googleAnalytics: 'UA-12345-AC130',
                isDebugMode: function(){
                    return false;
                },
                getMetaSiteId: function(){
                    return 'metaSiteID';
                },
                getCurrentUrlPageId: function(){
                    return 'page id';
                },
                isPremiumDomain: function() {
                    return true;
                },
                isPremiumUser: function() {
                    return true;
                },
                getServiceTopologyProperty: function(){
                    return null;
                },
                wixBiSession: {
                    viewerSessionId: 1234,
                    initialTimeStamp: 1000
                },
                subSvSession: jasmine.createSpy('siteData.subSvSession').and.callFake(function (cb) {
                    if (cookieValues.svSession) {
                        cb(cookieValues.svSession);
                    }
                })
            };
        });

        describe("reportBeatEvent", function(){
            var reportDestinationOptions, eventSpecificParams, baseParams, sessionParams;

            beforeEach(function () {
                reportDestinationOptions = {
                    adapter: 'bt',
                    biUrl: "http://frog.wix.com/"
                };

                baseParams = {
                    src: 29,
                    evid: 3
                };

                sessionParams = {
                    vuuid: '_wixUIDX',
                    vid: 'svSession',
                    dc: 'server.name',
                    vsi: 1234,
                    uuid: 'userId',
                    sid: 'siteID',
                    msid: 'metaSiteID'
                };

                eventSpecificParams = {
                    pn: 2,
                    pid: 'page id',
//                    sr: '', //no way to test this yet
//                    wr: '',  //no way to test this yet
                    st: 2, //site_type, (1-WixSite, 2-UGC, 3-Template)
                    isjp: 0, //always empty...
                    isp: 1, //is premium
                    ts: 0,
                    et: 1, //(1-start, 2-reset, 3-finish)
//                    ref: '', commenting out, since cannot test
                    url: 'someFullUrl.com/asdasdasd',
                    v: '1.1254.12'

                };
            });

            describe('general', function () {
                it("should be defined", function(){
                    expect(beat.reportBeatEvent).toBeDefined();
                });
                it("should call the Wix BI to send the events", function(){
                    beat.reportBeatEvent(mockSiteData, 'start');
                    expect(bi.wixBI.report).toHaveBeenCalled();
                });
                it("should call report to frog with wixBeat as the adaptor", function(){
                    beat.reportBeatEvent(mockSiteData, 'start');
                    var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                    expect(recentOptionsArg).toContain(reportDestinationOptions);
                });
                it("should call report with a query string", function(){
                    beat.reportBeatEvent(mockSiteData, 'start');
                    var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                    expect(typeof recentOptionsArg.queryString).toBe('string');
                });
            });

            describe('beat health events', function () {
                it("should report health event when event type is numeric and > 3", function(){
                    var eventType = 4;

                    beat.reportBeatEvent(mockSiteData, eventType);

                    var params = getLastReportParams();
                    expect(params.et).toBe('4');
                });

                it("should report each health event only once", function(){
                    var eventType = 4;

                    beat.reportBeatEvent(mockSiteData, eventType);
                    beat.reportBeatEvent(mockSiteData, eventType);

                    expect(bi.wixBI.report.calls.count()).toBe(1);
                });

                it("should not report imvalid event types", function(){
                    var eventType = 3;

                    beat.reportBeatEvent(mockSiteData, eventType);

                    expect(bi.wixBI.report).not.toHaveBeenCalled();
                });
            });

            describe('beat page view events', function () {
                it("should report 'start' event with correct et param", function(){
                    var eventType = 'start';

                    beat.reportBeatEvent(mockSiteData, eventType);

                    var params = getLastReportParams();
                    expect(params.et).toBe('1');
                });

                it("should report 'finish' event with correct et param", function(){
                    var eventType = 'finish';

                    beat.reportBeatEvent(mockSiteData, eventType);

                    var params = getLastReportParams();
                    expect(params.et).toBe('3');
                });

                it("should not report imvalid event types", function(){
                    var eventType = 'invalid type';

                    beat.reportBeatEvent(mockSiteData, eventType);

                    expect(bi.wixBI.report).not.toHaveBeenCalled();
                });
            });

            describe('site type', function () {
                it('should send 1 for WixSite', function(){
                    mockSiteData.rendererModel.siteInfo.documentType = 'WixSite';
                    beat.reportBeatEvent(mockSiteData, 'start');

                    var params = getLastReportParams();
                    expect(params.st).toBe('1');
                });

                it('should send 2 for UGC', function(){
                    mockSiteData.rendererModel.siteInfo.documentType = 'UGC';
                    beat.reportBeatEvent(mockSiteData, 'start');

                    var params = getLastReportParams();
                    expect(params.st).toBe('2');
                });

                it('should send 3 for Template', function(){
                    mockSiteData.rendererModel.siteInfo.documentType = 'Template';
                    beat.reportBeatEvent(mockSiteData, 'start');

                    var params = getLastReportParams();
                    expect(params.st).toBe('3');
                });

                it('should send the actual value (instead of -1) if site type is not supported', function(){
                    mockSiteData.rendererModel.siteInfo.documentType = 'unsupported';
                    beat.reportBeatEvent(mockSiteData, 'start');

                    var params = getLastReportParams();
                    expect(params.st).toBe('unsupported');
                });
            });

            describe('visitor id', function () {
                var saveSvSession;
                beforeEach(function () {
                    saveSvSession = cookieValues.svSession;
                    jasmine.clock().install();
                });
                afterEach(function () {
                    cookieValues.svSession = saveSvSession;
                    jasmine.clock().uninstall();
                });

                it("should wait for svSession if cookie is not set and use the DEFAULT value if svSession WAS NOT obtained before timeout", function(){
                    cookieValues.svSession = '';
                    beat.reportBeatEvent(mockSiteData, 'start');

                    jasmine.clock().tick(2001);

                    var params = getLastReportParams();

                    expect(bi.wixBI.report.calls.count()).toBe(1);
                    expect(params.vid).toBe('NO_SV');
                });

                it("should not wait for svSession if cookie is set", function(){
                    cookieValues.svSession = '12345';
                    beat.reportBeatEvent(mockSiteData, 'start');

                    var params = getLastReportParams();

                    expect(bi.wixBI.report.calls.count()).toBe(1);
                    expect(params.vid).toBe('12345');
                });
            });

            it("should report start and finish events with the given pageId", function(){
                beat.reportBeatEvent(mockSiteData, 'start', 'startId');
                var params = getLastReportParams();

                expect(params.pid).toBe('startId');

                beat.reportBeatEvent(mockSiteData, 'finish', 'finishId');
                params = getLastReportParams();

                expect(params.pid).toBe('finishId');
            });
            it("should report with the required basic params", function(){
                beat.reportBeatEvent(mockSiteData, 'start', mockSiteData.getCurrentUrlPageId());
                var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                expect(queryStringToObject(recentOptionsArg.queryString)).toContain(uriEncodeValues(baseParams));
            });
            it("should report with all the required session specific params", function(){
                beat.reportBeatEvent(mockSiteData, 'start', mockSiteData.getCurrentUrlPageId());
                var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                var expectedParams = _.merge({}, baseParams, sessionParams);
                expect(queryStringToObject(recentOptionsArg.queryString)).toContain(uriEncodeValues(expectedParams));
            });
            it("should report with all the required event specific params", function(){
                beat.reportBeatEvent(mockSiteData, 'start', mockSiteData.getCurrentUrlPageId());
                var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                var expectedParams = _.merge({}, baseParams, eventSpecificParams);
                expect(queryStringToObject(recentOptionsArg.queryString)).toContain(uriEncodeValues(expectedParams));
            });
            it("should report with with a timestamp = 0 for start events", function(){
                beat.reportBeatEvent(mockSiteData, 'start', mockSiteData.getCurrentUrlPageId());
                var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                var expectedParams = _.merge({}, baseParams, eventSpecificParams);
                expect(queryStringToObject(recentOptionsArg.queryString)).toContain(uriEncodeValues(expectedParams));
            });
            it("should report with with a (0 < timestamp < reasonableDeltaUpperBoundary) for finish events", function(done){
                beat.reportBeatEvent(mockSiteData, 'start', mockSiteData.getCurrentUrlPageId());
                setTimeout(function(){
                    beat.reportBeatEvent(mockSiteData, 'finish', mockSiteData.getCurrentUrlPageId());
                    var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                    delete eventSpecificParams.ts;
                    eventSpecificParams.et = 3; //finish event;
                    var expectedParams = _.merge({}, baseParams, eventSpecificParams);
                    var params = queryStringToObject(recentOptionsArg.queryString);
                    expect(queryStringToObject(recentOptionsArg.queryString)).toContain(uriEncodeValues(expectedParams));
                    expect(params.ts).toBeGreaterThan(0);
                    //no way to really test  timestamp < reasonableDeltaUpperBoundary..
                    done();
                }, 1);
            });

            it("should report the document referrer", function(){
                beat.reportBeatEvent(mockSiteData, 'start');
                var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                var params = queryStringToObject(recentOptionsArg.queryString);
                expect(params.ref).toBeDefined(); // no way to really test this, just making sure no one removes this parameter
            });

            it("should report valid vuuid as given", function(){
                cookieValues._wixUIDX = 'ff584723-177f-4fcc-9ccd-5c784de314fb';
                beat.reportBeatEvent(mockSiteData, 'start');
                var params = getLastReportParams();
                expect(params.vuuid).toBe('ff584723-177f-4fcc-9ccd-5c784de314fb');
            });
            it("should replace vuuid of null-user-id and null with empty string", function(){
                cookieValues._wixUIDX = 'null-user-id';
                beat.reportBeatEvent(mockSiteData, 'start');
                var params = getLastReportParams();
                expect(params.vuuid).toBe('');

                cookieValues._wixUIDX = 'null';
                beat.reportBeatEvent(mockSiteData, 'start');
                params = getLastReportParams();
                expect(params.vuuid).toBe('');
            });

            it("should default to empty string for vuuid if no cookie is present", function(){
                cookieValues._wixUIDX = null;
                beat.reportBeatEvent(mockSiteData, 'start');
                var params = getLastReportParams();
                expect(params.vuuid).toBe('');
            });

            it("should position 'url' and 'ref' params last", function(){
                beat.reportBeatEvent(mockSiteData, 'start');
                var recentOptionsArg = bi.wixBI.report.calls.mostRecent().args[1];
                expect(/url=[^&]*&ref(=[^&]*)?$/.test(recentOptionsArg.queryString)).toBe(true);
            });
        });
    });

});
