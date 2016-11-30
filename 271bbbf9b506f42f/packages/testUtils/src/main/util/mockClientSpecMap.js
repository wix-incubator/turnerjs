define(['lodash'], function (_) {
    'use strict';

    return {
        hybridApp: function (baseApp, overrides) {
            var platformApp = _.assign({
                viewerUrl: 'http://platform.wix.com',
                editorUrl: 'http://platform.editor.wix.com',
                routerUrl: 'http://platform.router.wix.com',
                dependencies: []
            }, overrides);

            return _.defaults(baseApp, {platformApp: platformApp});
        },
        wixCode: function (overrides) {
            return _.defaults({}, overrides, {
                type: 'siteextension',
                applicationId: 22,
                extensionId: 'extension-id1',
                instanceId: 'instance-id1',
                instance: 'signed-instance1',
                signature: 'new-signed-instance',
                cloudNotProvisioned: true
            });
        },
        ecommerce: function (overrides) {
            return _.defaults({}, overrides, {
                type: 'ecommerce',
                applicationId: 21,
                appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10',
                magentoStoreId: '',
                state: false
            });
        },
        onboarding: function (overrides) {
            return _.defaults({}, overrides, {
                "type": "onboarding",
                "applicationId": 3,
                "storyId": "1cf2ac09-436f-4921-bd83-27d9d8323603",
                "inUse": false
            });
        },
        editor: function (overrides) {
            return _.defaults({}, overrides, {
                applicationId: 1450,
                type: 'editor',
                appDefinitionId: '19c33336-d950-41b9-906e-37ee33a7fa09'
            });
        },
        wixapps: function (overrides) {
            return _.defaults({}, overrides, {
                type: 'wixapps',
                applicationId: 15,
                appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad7',
                datastoreId: '138fd00e-ef2f-903d-d5e7-41c895e75d46',
                state: 'Template'
            });
        },
        tpa: function (overrides) {
            return _.defaults({}, overrides, {
                type: 'tpa',
                applicationId: 11,
                appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad9',
                instanceId: '1234',
                demoMode: true
            });
        }
    };
});
