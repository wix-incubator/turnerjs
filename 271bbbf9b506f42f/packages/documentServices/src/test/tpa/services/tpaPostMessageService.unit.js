define([
    'tpa',
    'testUtils',
    'documentServices/tpa/services/tpaPostMessageService',
    'documentServices/tpa/handlers/tpaHandlers',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/tpa/services/clientSpecMapService'
], function(
    tpa,
    testUtils,
    tpaPostMessageService,
    tpaHandlers,
    privateServicesHelper,
    clientSpecMapService
) {

    'use strict';

    describe("tpa PostMessageService tests", function() {
        var mockSiteAPI = {
            getComponentById: function() {
                return {
                    props: {
                        compData: 'compData'
                    }
                };
            }
        };

        beforeEach(function() {
            this.mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL();
            spyOn(clientSpecMapService, 'isSuperAppByCompId').and.returnValue(true);
        });

        it("should call document services handler when message was called from the settings (origin is editor)", function() {
            var msg = {
                callId: 5,
                compId: "i52ie6gb",
                deviceType: "desktop",
                intent: "TPA2",
                type: "siteInfo",
                originFrame: "editor"
            };
            spyOn(tpaHandlers, "siteInfo");
            tpaPostMessageService.callHandler(this.mockPs, mockSiteAPI, msg);
            expect(tpaHandlers.siteInfo).toHaveBeenCalled();
        });

        it("should call handler if it is a relevant event in preview mode", function() {
            var msg = {
                callId: 5,
                compId: "i52ie6gb",
                deviceType: "desktop",
                intent: "TPA2",
                data: {
                    eventKey: "THEME_CHANGE"
                },
                type: "registerEventListener"
            };
            spyOn(tpaHandlers, "registerEventListener");
            tpaPostMessageService.callHandler(this.mockPs, mockSiteAPI, msg);
            expect(tpaHandlers.registerEventListener).toHaveBeenCalled();
        });

        it("should not call document services handler if the sdk method was called from the app iframe and it is a settings-only handler ", function(){
            var msg = {
                    callId: 5,
                    compId: "i52ie6gb",
                    deviceType: "desktop",
                    intent: "TPA2",
                    type: "refreshApp"
                };
            spyOn(tpaHandlers, "refreshApp");
            tpaPostMessageService.callHandler(this.mockPs, mockSiteAPI, msg);
            expect(tpaHandlers.refreshApp).not.toHaveBeenCalled();
        });

        it("should call document services handler if the sdk method was called from the app iframe and it has a viewer handler", function(){
            var msg = {
                callId: 5,
                compId: "i52ie6gb",
                deviceType: "desktop",
                intent: "TPA2",
                type: "getSitePages"
            };
            spyOn(tpaHandlers, "getSitePages");
            tpaPostMessageService.callHandler(this.mockPs, mockSiteAPI, msg);
            expect(tpaHandlers.getSitePages).toHaveBeenCalled();
        });

        it("should call document services handler that overrides viewer handler", function(){
            var msg = {
                    callId: 5,
                    compId: "i52ie6gb",
                    deviceType: "desktop",
                    intent: "TPA2",
                    data: {
                    },
                    type: "getSectionUrl"
                };
            spyOn(tpaHandlers, "getSectionUrl");
            tpaPostMessageService.callHandler(this.mockPs, mockSiteAPI, msg);
            expect(tpaHandlers.getSectionUrl).toHaveBeenCalled();
        });

        it("should call document services handler that can be called from settings and from the app", function(){
            var msg = {
                callId: 5,
                compId: "i52ie6gb",
                deviceType: "desktop",
                intent: "TPA2",
                data: {
                    appDefinitionId: '123'
                },
                type: "getInstalledInstance"
            };
            spyOn(tpaHandlers, "getInstalledInstance");
            tpaPostMessageService.callHandler(this.mockPs, mockSiteAPI, msg);
            expect(tpaHandlers.getInstalledInstance).toHaveBeenCalled();
        });

        it("should not call document services handler if it is not one", function(){
            var msg = {
                callId: 5,
                compId: "i52ie6gb",
                deviceType: "desktop",
                intent: "TPA2",
                type: "openModal"
            };
            tpaHandlers.openModal = jasmine.createSpy();
            tpaPostMessageService.callHandler(this.mockPs, mockSiteAPI, msg);
            expect(tpaHandlers.openModal).not.toHaveBeenCalled();
        });

        it('should not call handler if it is a superApps handler and the app is not a superApp', function () {
            clientSpecMapService.isSuperAppByCompId.and.returnValue(false);
            var msg = {
                callId: 5,
                compId: "i52ie6gb",
                deviceType: "desktop",
                intent: "TPA2",
                data: {
                    appDefinitionId: '123'
                },
                type: "getInstalledInstance"
            };
            spyOn(tpaHandlers, 'getInstalledInstance');
            tpaPostMessageService.callHandler(this.mockPs, mockSiteAPI, msg);
            expect(tpaHandlers.getInstalledInstance).not.toHaveBeenCalled();
        });

        it('should call handler if it is a superApps handler and the app *is* a superApp', function () {
            var msg = {
                callId: 5,
                compId: "i52ie6gb",
                deviceType: "desktop",
                intent: "TPA2",
                data: {
                    appDefinitionId: '123'
                },
                type: "getInstalledInstance"
            };
            spyOn(tpaHandlers, 'getInstalledInstance');
            tpaPostMessageService.callHandler(this.mockPs, mockSiteAPI, msg);
            expect(tpaHandlers.getInstalledInstance).toHaveBeenCalled();
        });

        describe('tpaHandlers.setValue', function() {
            var msg = {
                callId: 5,
                compId: 'i52ie6gb',
                deviceType: 'desktop',
                intent: 'TPA2',
                type: 'setValue'
            };

            it('should call document service handlers that can be called only from editor only in editor mode', function() {
                spyOn(this.mockPs.dal, 'get').and.returnValue('editor');
                tpaHandlers.setValue = jasmine.createSpy();
                tpaPostMessageService.callHandler(this.mockPs, mockSiteAPI, msg);
                expect(tpaHandlers.setValue).toHaveBeenCalled();
            });

            it('should not call document service handlers that can be called only from editor only in preview mode', function() {
                spyOn(this.mockPs.dal, 'get').and.returnValue('preview');
                tpaHandlers.setValue = jasmine.createSpy();
                tpaPostMessageService.callHandler(this.mockPs, mockSiteAPI, msg);
                expect(tpaHandlers.setValue).not.toHaveBeenCalled();
            });
        });

        describe('bi', function () {
            var msg;

            beforeEach(function(){
                testUtils.experimentHelper.openExperiments('sv_SendSdkMethodBI');
                msg = {
                    callId: 5,
                    compId: "i52ie6gb",
                    deviceType: "desktop",
                    intent: "TPA2",
                    type: "siteInfo"
                };
                spyOn(tpaHandlers, "siteInfo");
                spyOn(tpa.common.bi, 'sendBIEvent');
            });

            it('should send a BI event when handling a message successfully', function () {
                tpaPostMessageService.callHandler(this.mockPs, mockSiteAPI, msg);

                expect(tpa.common.bi.sendBIEvent).toHaveBeenCalledWith(msg, mockSiteAPI, 'preview');
            });

            it('should send a BI event with origin=editor when coming from Settings panel', function () {
                msg.originFrame = 'editor';

                tpaPostMessageService.callHandler(this.mockPs, mockSiteAPI, msg);

                expect(tpa.common.bi.sendBIEvent).toHaveBeenCalledWith(msg, mockSiteAPI, 'editor');
            });
        });


    });
});
