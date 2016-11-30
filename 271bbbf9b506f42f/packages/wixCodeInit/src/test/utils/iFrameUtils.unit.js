define(['wixCodeInit/utils/iFrameUtils'], function(iFrameUtils) {
    'use strict';

    describe('iFrameUtils', function() {
        
        describe('getIFrameForApp', function() {
            it('should return a non-displayed iframe element with the application properties', function() {
                var testUrl = 'http://www.test.com/path';
                var testAppDef = {
                    applicationId: '554',
                    appDefinitionId: 'appDefinitionIdValue'
                };
                var iFrame = iFrameUtils.getIFrameForApp(testUrl, testAppDef);

                expect(iFrame.style.display).toEqual('none');
                expect(iFrame.src).toEqual(testUrl);
                expect(iFrame.className).toEqual('wix-code-app');
                expect(iFrame.getAttribute('data-app-id')).toEqual(testAppDef.applicationId);
                expect(iFrame.getAttribute('data-app-definition-id')).toEqual(testAppDef.appDefinitionId);
            });
        });

        describe('isIFrameEvent', function() {

            it('should return true for an event that originates in the iframe', function() {
                var mockEventSource = {};
                var mockMessageEvent = {
                    type: 'message',
                    source: mockEventSource
                };
                var mockIframe = {
                    contentWindow: mockEventSource
                };

                var result = iFrameUtils.isIFrameEvent(mockIframe, mockMessageEvent);
                expect(result).toEqual(true);
            });

            it('should return false for an event that does not originates in the iframe', function() {
                var mockMessageEvent = {
                    type: 'message',
                    source: {}
                };
                var mockIframe = {
                    contentWindow: {}
                };

                var result = iFrameUtils.isIFrameEvent(mockIframe, mockMessageEvent);
                expect(result).toEqual(false);
            });
        });

    });
});
