define([
    'lodash',
    'utils',
    'documentServices/platform/core/messageFormatter',
    'documentServices/platform/common/constants'
], function (_, utils, messageFormatter, constants) {
    'use strict';

    describe('messageFormatter', function () {
        describe('viewerInfoChangedEvent', function () {
            it('should create a proper message w/ eventType and payload', function () {
                var payload = {
                    foo: 'bar'
                };
                expect(messageFormatter.viewerInfoChangedEvent(payload)).toEqual({
                    eventType: constants.MessageTypes.VIEWER_INFO_CHANGED,
                    eventPayload: payload
                });
            });
        });
        describe('triggerEvent', function () {
            it('should create a proper message w/ intent, type, application and args payload', function () {
                var applicationId = 1;
                var options = {
                    foo: 'bar'
                };
                expect(messageFormatter.triggerEvent(applicationId, options)).toEqual({
                    intent: constants.Intents.PLATFORM_WORKER,
                    type: constants.MessageTypes.TRIGGER_EVENT,
                    applicationId: applicationId,
                    args: options
                });
            });
        });
        describe('addApps', function () {
            it('should create a proper message w/ intent type and apps applicationId, editorUrl and appDefinitionId', function () {
                var apps = [{
                    applicationId: 1,
                    editorUrl: 'http://www.hxs0r.1',
                    appDefinitionId: 'foo1',
                    instance: 'fearless'
                }, {
                    applicationId: 2,
                    editorUrl: 'http://www.hxs0r.2',
                    appDefinitionId: 'foo2',
                    instance: ''
                }];
                expect(messageFormatter.addApps(apps)).toEqual({
                    intent: constants.Intents.PLATFORM_WORKER,
                    type: constants.MessageTypes.ADD_APPS,
                    apps: [
                        {applicationId: 1, editorUrl: 'http://www.hxs0r.1', appDefinitionId: 'foo1'},
                        {applicationId: 2, editorUrl: 'http://www.hxs0r.2', appDefinitionId: 'foo2'}
                    ]
                });
            });
        });
        describe('addApp', function () {
            it('should create a proper message w/ intent type and apps applicationId, editorUrl and appDefinitionId', function () {
                var app = {
                    applicationId: 1,
                    editorUrl: 'http://www.hxs0r.1',
                    appDefinitionId: 'foo1',
                    instance: 'fearless'
                };
                expect(messageFormatter.addApp(app)).toEqual({
                    intent: constants.Intents.PLATFORM_WORKER,
                    type: constants.MessageTypes.ADD_APPS,
                    apps: [
                        {applicationId: 1, editorUrl: 'http://www.hxs0r.1', appDefinitionId: 'foo1'}
                    ]
                });
            });
        });
    });
});
