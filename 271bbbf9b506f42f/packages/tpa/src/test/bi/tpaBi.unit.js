define(['tpa/aspects/TPAPostMessageAspect',
        'tpa/common/tpaPostMessageCommon',
        'tpa/handlers/tpaHandlers',
        'tpa/handlers/tpaPubSubHandlers',
        'tpa/bi/events',
        'tpa/common/tpaBi'
    ], function (TPAAspectCtor, tpaPostMessageCommon, tpaHandlers, tpaPubSubHandlers, events, tpaBi) {

    'use strict';

    describe('Send BI event', function(){

        var mockPostMsgForBi = {"intent": "TPA", "type": "getViewMode", "version": "100.0.0", "namespace": "Utils"};

        var mockPostMsgForBiNoNamespace = {"intent": "TPA", "type": "getViewMode", "version": "100.0.0"}
        ;

        var appInfo = {
            11: {
                appDefinitionId: '111',
                instance: 'hello.eyJpbnN0YW5jZUlkIjoiMTIzNCJ9',
                widgets: {
                    13: {
                        published: true
                    }
                }
            }
        };

        beforeEach(function() {
            spyOn(console, 'error');
            var getCurrentUrlPageId = jasmine.createSpy().and.returnValue('test-page');
            var siteData = {
                getClientSpecMap: function(){
                    return appInfo;
                }
            };
            var getSiteData = jasmine.createSpy().and.returnValue(siteData);
            this.siteAPI = {
                getCurrentUrlPageId: getCurrentUrlPageId,
                getSiteData: getSiteData,
                reportBI: jasmine.createSpy('reportBI'),
                getComponentById: jasmine.createSpy('getComponentById')
            };
        });

        describe('JS SDK call', function () {
            var jdkComp = {
                props: {
                    pageId: 'test-page',
                    compData: {
                        applicationId: 11,
                        type: 'getViewMode',
                        widgetId: 13
                    }
                }
            };

            beforeEach(function () {
                this.siteAPI.getComponentById.and.returnValue(jdkComp);
            });

            it('should send a jdk BI event with correct params', function(){
                tpaBi.sendBIEvent(mockPostMsgForBi, this.siteAPI, 'fakeOrigin');
                var eventParams = {
                    visitorUuid: '',
                    sdkVersion: '100.0.0',
                    origin: 'fakeOrigin',
                    fnName: 'getViewMode',
                    namespace: 'Utils',
                    appId: '111',
                    instanceId: '1234',
                    isPublished : 1
                };
                expect(this.siteAPI.reportBI).toHaveBeenCalledWith(events.JS_SDK_FUNCTION_CALL, eventParams);
            });

            it('should send the event with isPublished:1 when santaEditorPublished is true', function(){
                appInfo[11].widgets[13].published = false;
                appInfo[11].widgets[13].santaEditorPublished = true;

                tpaBi.sendBIEvent(mockPostMsgForBi, this.siteAPI, 'fakeOrigin');

                expect(this.siteAPI.reportBI).toHaveBeenCalledWith(events.JS_SDK_FUNCTION_CALL, jasmine.objectContaining({
                    isPublished : 1
                }));
            });

            it('should send the event with isPublished:0 when both published and santaEditorPublished are false', function(){
                appInfo[11].widgets[13].published = false;
                appInfo[11].widgets[13].santaEditorPublished = false;

                tpaBi.sendBIEvent(mockPostMsgForBi, this.siteAPI, 'fakeOrigin');

                expect(this.siteAPI.reportBI).toHaveBeenCalledWith(events.JS_SDK_FUNCTION_CALL, jasmine.objectContaining({
                    isPublished : 0
                }));
            });

            it('should not send a jdk BI event when there is no namespace', function(){
                tpaBi.sendBIEvent(mockPostMsgForBiNoNamespace, this.siteAPI, 'fakeOrigin');
                expect(this.siteAPI.reportBI).not.toHaveBeenCalled();
            });

        });

        it('should send a tpa gallery BI event when a gallery function is called', function(){
            var galleryComp = {
                props: {
                    pageId: 'test-page',
                    compData: {
                        type: 'getViewMode'
                    }
                }
            };
            this.siteAPI.getComponentById.and.returnValue(galleryComp);
            tpaBi.sendBIEvent(mockPostMsgForBi, this.siteAPI, 'fakeOrigin');

            var eventParams = {
                visitorUuid: '',
                sdkVersion: '100.0.0',
                origin: 'fakeOrigin',
                fnName: 'getViewMode',
                namespace: 'Utils'
            };

            expect(this.siteAPI.reportBI).toHaveBeenCalledWith(events.GALLERY_FUNCTION_CALL, eventParams);
        });
    });

});
