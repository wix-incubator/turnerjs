describe("logger", function () {
    beforeEach(function () {
        // Create an error and event maps
        this.eventsMap = {
            BI_LIMIT_MAIN_EVENT:{
                'desc':'bi with call limit and main timer id',
                'type':wixLogLegend.type.funnel,
                'category':wixLogLegend.category.editor,
                'biEventId':'fake-id',
                'timerId':'main',
                'callLimit':1
            },
            BI_MAIN_EVENT:{
                'desc':'bi with no call limit and main timer id',
                'type':wixLogLegend.type.funnel,
                'category':wixLogLegend.category.editor,
                'biEventId':'fake-id',
                'timerId':'main'
            },
            EVENT1:{
                'desc':'no limit no bi and main timer id',
                'type':wixLogLegend.type.funnel,
                'category':wixLogLegend.category.editor,
                'timerId':'main'
            },
            THRESHOLD_EVENT:{
                'desc':'event with threshold',
                'type':wixLogLegend.type.funnel,
                'category':wixLogLegend.category.editor,
                'thresholdTime':1000,
                'thresholdError':'ERROR1'
            }
        };
        this.errorsMap = {
            ERROR1:{
                'errorCode':1,
                'desc':'error 1',
                'type':wixLogLegend.type.error,
                'category':wixLogLegend.category.server,
                'issue':wixLogLegend.issue.defaultVal,
                'severity':wixLogLegend.severity.error
            },
            ERROR2:{
                'errorCode':2,
                'desc':'error 2',
                'type':wixLogLegend.type.error,
                'category':wixLogLegend.category.server,
                'issue':wixLogLegend.issue.defaultVal,
                'severity':wixLogLegend.severity.error
            }
        };
        // Initiate a new logger
        LOG.init({
            'errors':this.errorsMap,
            'events':this.eventsMap,
            'wixAnalytics':[],
            'userAnalytics':"",
            'floggerServerURL':'http://someAddress.com',
            'version':'UNITEST_VERSION',
            'siteId':'',
            'userId':'00000000-0000-0000-0000-000000000000',
            'userType':'',
            'userLanguage':'unknown',
            'session':'00000000-0000-0000-0000-000000000000',
            'computerId':"00000000-0000-0000-0000-000000000000",
            'creationSource':"creationSource",
            'wixAppId':3, /* 3 for Wix Mobile */
            'onEvent':function (event, params) {
            },
            'onError':function (err, className, methodName, params) {
            }
        });
        // Spy on analytics & BI
        spyOn(LOG._analytics, 'sendEvent');
        spyOn(LOG._analytics, 'sendError');
        spyOn(LOG._wixBI, 'sendEvent');
        spyOn(LOG._wixBI, 'sendError');
    });

    describe('log features', function () {
        describe('timers', function () {
            it('should report time deltas between logs with same timer id', function () {
                runs(function () {
                    LOG.reportEvent(this.eventsMap.EVENT1);
                }.bind(this));
                runs(function () {
                    LOG.reportEvent(this.eventsMap.BI_MAIN_EVENT);
                }.bind(this));
                runs(function () {
                    LOG.reportEvent(this.eventsMap.BI_LIMIT_MAIN_EVENT);
                }.bind(this));
                runs(function () {
                    var log = LOG.getLog();
                    expect(log.length).toBe(4); // should be 4 as logger constructor fires an extra event
                }.bind(this))
                //,'failed to output 3 log messages after 1 second',1000);
            });

            it('should report delta from init time in logs with no delta timer id or with id "initTime"', function () {
                // ToDo: this test. Not sure how to manage times.
            });
        });

        describe('report limit', function () {
            it('should stop sending events after the limited amount of reports', function () {
                LOG.reportEvent(this.eventsMap.BI_LIMIT_MAIN_EVENT);
                LOG.reportEvent(this.eventsMap.BI_LIMIT_MAIN_EVENT);
                expect(LOG._analytics.sendEvent).toHaveBeenCalledXTimes(1);
                expect(LOG._wixBI.sendEvent).toHaveBeenCalledXTimes(1);
            });

            it('should report the event as many times as reported if no callLimit is indicated', function () {
                LOG.reportEvent(this.eventsMap.BI_MAIN_EVENT);
                LOG.reportEvent(this.eventsMap.BI_MAIN_EVENT);
                LOG.reportEvent(this.eventsMap.BI_MAIN_EVENT);
                expect(LOG._analytics.sendEvent).toHaveBeenCalledXTimes(3);
                expect(LOG._wixBI.sendEvent).toHaveBeenCalledXTimes(3);
            });
        });

        describe('threshold', function () {
            it('should call an error log from the error map when the threshold time is passed and an error is indicated', function () {
                this.eventsMap.THRESHOLD_EVENT.thresholdTime = 0;
                LOG.reportEvent(this.eventsMap.THRESHOLD_EVENT);
                var log = LOG.getLog();
                expect(log.length).toBe(3); // should be 3 as logger constructor fires an extra event
                expect(log[1][1]).toBe(this.eventsMap.THRESHOLD_EVENT);
                expect(log[2][1]).toBe(this.errorsMap.ERROR1);
            });
        });
    });

    describe('EVENTS', function () {
        it('should not send events to BI when no biEventId is available (always send to analytics)', function () {
            LOG.reportEvent(this.eventsMap.EVENT1);
            expect(LOG._analytics.sendEvent).toHaveBeenCalledXTimes(1);
            expect(LOG._wixBI.sendEvent).not.toHaveBeenCalled();
        });

        it('should call the onEvent function argument after every event report', function () {
            spyOn(LOG._settings, 'onEvent');
            LOG.reportEvent(this.eventsMap.EVENT1);
            expect(LOG._settings.onEvent).toHaveBeenCalledXTimes(1);
            LOG.reportEvent(this.eventsMap.EVENT1);
            expect(LOG._settings.onEvent).toHaveBeenCalledXTimes(2);
        });
    });

    describe('ERRORS', function () {
        it('should call the onError function argument after every error report', function () {
            spyOn(LOG._settings, 'onError');
            LOG.reportError(this.errorsMap.ERROR1);
            expect(LOG._settings.onError).toHaveBeenCalledXTimes(1);
            LOG.reportError(this.errorsMap.ERROR1);
            expect(LOG._settings.onError).toHaveBeenCalledXTimes(2);
        });

        it('should return null value in debug mode or and empty function in production', function () {
            LOG.setDebugMode(true);
            var reportResult = LOG.reportError(this.errorsMap.ERROR1);
            expect(reportResult).toBeNull();
            LOG.setDebugMode(false);
            reportResult = LOG.reportError(this.errorsMap.ERROR1);
            expect(reportResult).toBeInstanceOf(Function);
        });
    });

    describe('Change BI application Id', function () {
        it(' should have default BI src of 3', function () {
            expect(LOG._wixBI._common.src).toBe(3);
        });
        it(' should set BI src to 42', function () {
            LOG.updateSetting('wixAppId', 42);
            expect(LOG._wixBI._common.src).toBe(42);
        });
    });

    describe('Analytics', function () {
        // W.Config references were extracted from the specs in favor of the standalone bootstrap
        var WConfig = W.Config;

        beforeEach(function () {
            W.Config = {};
            W.Config.getDebugMode = function () {
                return 'nodebug';
            };
            this.oldViewMode = window.viewMode;
        });

        afterEach(function () {
            W.Config = WConfig;
            window.viewMode = this.oldViewMode;
        });

        it('should report page events', function () {
            LOG._dontSendReports = false;
            spyOn(LOG._analytics, 'sendPageEvent');

            window.viewMode = 'site';
            LOG.reportPageEvent(window.location.href);

            expect(LOG._analytics.sendPageEvent).toHaveBeenCalledWith(window.location.href);
            LOG._dontSendReports = true;
        });

        it('should sanitize reported URLs', function () {
            LOG._dontSendReports = false;
            spyOn(LOG, '_sanitizePageUrl');

            window.viewMode = 'site';
            LOG.reportPageEvent(window.location.href);

            expect(LOG._sanitizePageUrl).toHaveBeenCalledWith(window.location.href, window.viewMode);
            LOG._dontSendReports = true;
        });

        it('should FURTHER sanitize URLs for BI reports', function () {
            spyOn(LOG, '_sanitizeUrlForWixBI');

            LOG._sanitizePageUrl(window.location.href, 'editor');

            expect(LOG._sanitizeUrlForWixBI).toHaveBeenCalledWith(window.location.href);
        });
    });

    //till we migrate the user cookies module, we can skip these tests. it wasn't deployed yet anyway, so i'll get the rest of the logger to work first
    describe('Check sampleRatio property in logger.reportError', function () {
        beforeEach(function () {
            //if there already is a persistent cookie here, let's save it, so we can play with it and then return it to what it was before our tests
            if (window.siteHeader) {
                this.prevUserId = siteHeader.userId;
            }
            else {
                window.siteHeader = {userId:null};
                this.prevUserId = undefined;
            }
            this.prevSiteId = typeof(siteId) != 'undefined' ? siteId : undefined;
            this.FAKE_ERROR_FOR_TESTING = {
                'desc':"We don't really use this error anywhere but in our testing scripts, to check the reporting mechanism",
                'errorCode':10,
//                'type':l.type.error,
//                'category':l.category.viewer,
//                'issue':l.issue.defaultVal,
//                'severity':l.severity.error,
                "sampleRatio":10
            };
        });
        afterEach(function () {
            siteHeader.userId = this.prevUserId;
            window.siteId = this.prevSiteId;
        });

        it('sendError should be called since the USER id should fall within the sample ratio', function () {
            //set the cookie to an example user id that SHOULD pass the factor:
            siteHeader.userId = "6653aefc-2d6b-3d00-f6eb-e96c3852209e";
            LOG.reportError(this.FAKE_ERROR_FOR_TESTING, '', '', '');
            expect(LOG._wixBI.sendError).toHaveBeenCalledXTimes(1);
        });
        it('sendError should NOT be called since the USER id should NOT fall within the sample ratio', function () {
            //set the cookie to an example user id that should NOT pass the factor:
            siteHeader.userId = "6653aefc-2d6b-3d00-f6eb-e96c38522095";
            LOG.reportError(this.FAKE_ERROR_FOR_TESTING, '', '', '');
            expect(LOG._wixBI.sendError).toHaveBeenCalledXTimes(0);
        });

        it("sendError should be called since there's no USER id and the siteId should fall within the sample ratio", function () {
            //remove the persistent user cookie so that the factor mechanism falls back to the siteId var
            delete siteHeader.userId;
            //set the variable to an example site id that SHOULD pass the factor:
            window.siteId = "b1b3473c-8124-4de4-a074-0f650b1b3e28";

            LOG.reportError(this.FAKE_ERROR_FOR_TESTING, '', '', '');
            //expect(LOG._wixBI.sendError).toHaveBeenCalledXTimes(1);
        });
        it("sendError should NOT be called since there's no USER id and the siteId should NOT fall within the sample ratio", function () {
            //remove the persistent user cookie so that the factor mechanism falls back to the siteId var
            delete siteHeader.userId;
            //set the variable to an example site id that SHOULD pass the factor:
            window.siteId = "b1b3473c-8124-4de4-a074-0f650b1b3ee4";

            LOG.reportError(this.FAKE_ERROR_FOR_TESTING, '', '', '');
            //expect(LOG._wixBI.sendError).toHaveBeenCalledXTimes(0);
        });

        it("sendError should be called since there's no USER id or siteId so it should fall back to a random call, which is rigged to within the sample ratio", function () {
            //remove the persistent user cookie as well as the global siteId, so that the sample ratio mechanism falls back to a random num (rigged in this case)
            delete siteHeader.userId;
            window.siteId = undefined;
            spyOn(Math, 'random').andReturn(0);

            LOG.reportError(this.FAKE_ERROR_FOR_TESTING, '', '', '');
            expect(LOG._wixBI.sendError).toHaveBeenCalledXTimes(1);
        });
        it("sendError should NOT be called since there's no USER id or siteId so it should fall back to a random call, which is rigged to fail the sample ratio", function () {
            //remove the persistent user cookie as well as the global siteId, so that the sample ratio mechanism falls back to a random num (rigged in this case)
            delete siteHeader.userId;
            window.siteId = undefined;
            spyOn(Math, 'random').andReturn(0.5);

            LOG.reportError(this.FAKE_ERROR_FOR_TESTING, '', '', '');
            expect(LOG._wixBI.sendError).toHaveBeenCalledXTimes(0);
        });
    });

    describe('Check sampleRatio property in logger.reportEvent', function () {
        beforeEach(function () {
            //if there already is a persistent cookie here, let's save it, so we can play with it and then return it to what it was before our tests
            if (window.siteHeader) {
                this.prevUserId = siteHeader.userId;
            }
            else {
                window.siteHeader = {userId:null};
                this.prevUserId = undefined;
            }
            this.prevSiteId = typeof(siteId) != 'undefined' ? siteId : undefined;
            this.FAKE_EVENT_FOR_TESTING = {
                'desc':"We don't really use this event anywhere but in our testing scripts, to check the events mechanism",
//                'type':l.type.funnel,
//                'category':l.category.editor,
                'biEventId':10,
                'timerId':'main',
                //'callLimit':1, //this limit is not good for the tests!
                "sampleRatio":10
            };
        });
        afterEach(function () {
            siteHeader.userId = this.prevUserId;
            window.siteId = this.prevSiteId;
        });

        it('sendEvent should be called since the USER id should fall within the sample ratio', function () {
            //set the userId to an example user id that SHOULD pass the factor:
            siteHeader.userId = "6653aefc-2d6b-3d00-f6eb-e96c38522014";
            LOG.reportEvent(this.FAKE_EVENT_FOR_TESTING, '', '', '');
            //expect(LOG._wixBI.sendEvent).toHaveBeenCalledXTimes(1);
        });
        it('sendEvent should NOT be called since the USER id should NOT fall within the sample ratio', function () {
            //set the cookie to an example user id that should NOT pass the factor:
            siteHeader.userId = "6653aefc-2d6b-3d00-f6eb-e96c3852209";
            LOG.reportEvent(this.FAKE_EVENT_FOR_TESTING, '', '', '');
            expect(LOG._wixBI.sendEvent).toHaveBeenCalledXTimes(0);
        });

        it("sendEvent should be called since there's no USER id and the siteId should fall within the sample ratio", function () {
            //set the variable to an example site id that SHOULD pass the factor:
            delete siteHeader.userId;
            window.siteId = "b1b3473c-8124-4de4-a074-0f650b1b3e28";

            LOG.reportEvent(this.FAKE_EVENT_FOR_TESTING, '', '', '');
            //expect(LOG._wixBI.sendEvent).toHaveBeenCalledXTimes(1);
        });
        it("sendEvent should NOT be called since there's no USER id and the siteId should NOT fall within the sample ratio", function () {
            delete siteHeader.userId;
            //set the variable to an example site id that SHOULD pass the factor:
            window.siteId = "b1b3473c-8124-4de4-a074-0f650b1b3ee4";

            LOG.reportEvent(this.FAKE_EVENT_FOR_TESTING, '', '', '');
            //expect(LOG._wixBI.sendEvent).toHaveBeenCalledXTimes(0);
        });

        it("sendEvent should be called since there's no USER id or siteId so it should fall back to a random call, which is rigged to within the sample ratio", function () {
            window.siteId = undefined;
            spyOn(Math, 'random').andReturn(0);

            LOG.reportEvent(this.FAKE_EVENT_FOR_TESTING, '', '', '');
            expect(LOG._wixBI.sendEvent).toHaveBeenCalledXTimes(1);
        });
        it("sendEvent should NOT be called since there's no USER id or siteId so it should fall back to a random call, which is rigged to fail the sample ratio", function () {
            window.siteId = undefined;
            spyOn(Math, 'random').andReturn(0.5);

            LOG.reportEvent(this.FAKE_EVENT_FOR_TESTING, '', '', '');
            expect(LOG._wixBI.sendEvent).toHaveBeenCalledXTimes(0);
        });
    });

    describe('events', function(){
        it('The loading stages events should all be with a sampleRatio of 10', function(){
            for (var eventId in wixEvents) {
                if (wixEvents[eventId].biEventId>=331 && wixEvents[eventId].biEventId<=339) {
                    expect(wixEvents[eventId].sampleRatio).toBe(10);
                }
            }
        });
    });

//    describe('Check UserCookies module', function () {
//        //if there are already user cookies here, let's save them, so we can play with them and then return them to what they were before our tests
//        var prevPersistentCookie = LOG.UserCookies.getUserPersistentGUID();
//        var prevSessionCookie = W.Utils.cookies.readCookie(LOG.UserCookies.SESSION_COOKIE);
//
//        it(' delete cookies and run init', function () {
//            W.Utils.cookies.deleteCookie(LOG.UserCookies.PERSISTENT_COOKIE);
//            W.Utils.cookies.deleteCookie(LOG.UserCookies.SESSION_COOKIE);
//            //spyon generateGUID - return "FAKE_GENERATED....GUID"
//            LOG.UserCookies.init();
//
//            //how do i expect something to be a string, or a GUID?
//            var per = W.Utils.cookies.readCookie(LOG.UserCookies.PERSISTENT_COOKIE);
//            var ses = W.Utils.cookies.readCookie(LOG.UserCookies.SESSION_COOKIE);
//        });
//        it(' return the persistent user cookie and siteId var to what they were', function () {
//            //return the persistent user cookie to what it was
//            if (prevPersistentCookie) {
//                W.Utils.cookies.createCookie(LOG.UserCookies.PERSISTENT_COOKIE, prevPersistentCookie, false);
//            }
//            else {
//                W.Utils.cookies.deleteCookie(LOG.UserCookies.PERSISTENT_COOKIE);
//            }
//            if (prevSessionCookie) {
//                W.Utils.cookies.createCookie(LOG.UserCookies.SESSION_COOKIE, prevSessionCookie, false);
//            }
//            else {
//                W.Utils.cookies.deleteCookie(LOG.UserCookies.SESSION_COOKIE);
//            }
//        });
//    });

    describe('Check that the vsi param is working properly', function(){
        var oldViewMode;
        beforeEach(function(){
            oldViewMode = window.viewMode;
        });
        afterEach(function(){
            window.viewMode = oldViewMode;
        });
        it('vsi should be null when viewMode=="editor"', function(){
            window.viewMode = 'editor';
            LOG.init({'errors':this.errorsMap,'events':this.eventsMap,'wixAnalytics':[],'userAnalytics':"",'floggerServerURL':'http://someAddress.com','version':'UNITEST_VERSION','siteId':'','userId':'00000000-0000-0000-0000-000000000000','userType':'','userLanguage':'unknown','session':'00000000-0000-0000-0000-000000000000','computerId':"00000000-0000-0000-0000-000000000000",'creationSource':"creationSource",'wixAppId':3, /* 3 for Wix Mobile */
                'onEvent':function (event, params) {},
                'onError':function (err, className, methodName, params) {}
            });
            expect(LOG._wixBI._common.vsi).toBe(null);
        })
        it('vsi should be a string (guid) when viewMode=="site" (which is the viewer)', function(){
            window.viewMode = 'site';
            LOG.init({'errors':this.errorsMap,'events':this.eventsMap,'wixAnalytics':[],'userAnalytics':"",'floggerServerURL':'http://someAddress.com','version':'UNITEST_VERSION','siteId':'','userId':'00000000-0000-0000-0000-000000000000','userType':'','userLanguage':'unknown','session':'00000000-0000-0000-0000-000000000000','computerId':"00000000-0000-0000-0000-000000000000",'creationSource':"creationSource",'wixAppId':3, /* 3 for Wix Mobile */
                'onEvent':function (event, params) {},
                'onError':function (err, className, methodName, params) {}
            });
            expect(typeof LOG._wixBI._common.vsi).toBe('string');
        })
    })
//     var error = wixErrors.SERVER_NAME_VALIDATION_FAILED;
//     var theClass = "someClass";
//     var theMethod = "someMethod";
//     var params = {};
//     var serverError = "";
//
//    beforeEach(function() {
//        var viewMode = 'preview';
//        var client_version = "00";
//        LOGInstance = new WixLogger();
//        LOGInstance.loggerBI.init({
//            'errors': {},
//            'events': {},
//            'defaultAnalytics': [],
//            'optionalAnalytics': {'user':null},
//            'floggerServerURL': 'http://someAddress.com',
//            'version': 'TEST_VERSION',
//            'siteId': '',
//            'userId': '00000000-0000-0000-0000-000000000000',
//            'userType': '',
//            'userLangauge': 'unknown',
//            'session': '00000000-0000-0000-0000-000000000000',
//            'computerId': getCookieInfo("_wixCIDX") || "00000000-0000-0000-0000-000000000000",
//            'creationSource': creationSource,
//            'onEvent': function(event, params) {},
//            'onError': function(err, className, methodName, params) {}
//        });
//    });
//    it('common values should be set', function(){
//        /* GUID check */
//        expect(LOGInstance._wixBI._common.uid.test(/^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/)).toBeTruthy();
//        expect(LOGInstance._wixBI._common.gsi.test(/^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/)).toBeTruthy();
//        expect(LOGInstance._wixBI._common.cid.test(/^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/)).toBeTruthy();
//    });
//     it('send error values should be set', function(){
//        LOGInstance.reportError(error, theClass, theMethod, params, serverError);
//         expect(LOGInstance._wixBI._common.evid).toBeEquivalentTo(error['eventId']);
//         expect(LOGInstance._wixBI._common.cat).toBeEquivalentTo(error['category']);
//         expect(LOGInstance._wixBI._common.ts).toBeLessThan(LOGInstance.settings.loadTime);
//    });
//    it('should call commonArr with correct string and value order', function(){
//        var queryMap = {"src":"la"};
//        var prms, item, key, value;
//        spyOn(LOGInstance._wixBI, '_createReport').andCallThrough()
//        spyOn(LOGInstance._wixBI, '_createHit').andCallFake(function(params){
//            prms = params;
//         });
//        LOGInstance.reportError(error, theClass, theMethod, params, serverError);
//         expect(LOGInstance._wixBI._createReport).toHaveBeenCalled();
//         expect(LOGInstance._wixBI._createHit).toHaveBeenCalled();
//        /* check that the length of logger.common is the same as logger.keyArray.globalKeys */
////        var i = 0;
////        for(item in LOG.loggerBI.common){i++};
////        expect(i).toBeEquivalentTo(LOG.loggerBI.keyArray.globalKeys.length);
////        /* split string to get and query*/
////        var querySplit = prms.split("?");
////        /* get query */
////        var query = querySplit[1];
////        /* split to the only first items in logger.common */
////        var queryArray = query.split("&",LOG.loggerBI.keyArray.globalKeys.length);
//        /* running on each common in the final query */
////        for (var i = 0; i < queryArray.length; i++) {
////            /* splitting key and val and stringing it */
////            item = queryArray[i].split("=");
////            key = LOG.loggerBI.common[item[0]].toString();
////            value = item[1].toString();
////            expect(key).toBeEquivalentTo(value);
////            expect(item[0]).toBeEquivalentTo(logger.keyArray.globalKeys[i]);
////        }
//    });
});