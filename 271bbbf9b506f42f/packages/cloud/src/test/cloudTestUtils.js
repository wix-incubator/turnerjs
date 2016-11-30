define(['testUtils', 'lodash'],
    function(testUtils, _) {
        'use strict';

        var mock = testUtils.mockFactory;

        var options = {
            serviceTopology: {
                wixCloudBaseDomain: 'cloud.wix.com/'
            },
            publicModel: {
            },
            renderedModel: {
                clientSpecMap: {
                    16: {
                        'applicationId': 16,
                        'extensionId': 'extension-id',
                        'instance': 'signed-instance'
                    }
                },
                cloudVersions: {
                    16: 'foo'
                },
                languageCode: 'en',
                siteInfo: {}
            },
            style: {
                width: 200
            },
            viewMode: 'site'
        };

        function getComponent(componentDefinition, overrides) {
            _.assign(options, overrides);

            var appData = {
                applicationId: '16',
                id: 'cqhi',
                widgetId: '129acb44-2c60-3020-5989-0f5aea90b16f',
                componentUrl: 'contact.html'
            };

            var compProps = mock.mockProps()
                .addSiteData(options.renderedModel, 'rendererModel')
                .addSiteData(options.publicModel, 'publicModel')
                .addSiteData(options.serviceTopology, 'serviceTopology')
                .addSiteData(options.viewMode, 'viewMode')
                .setCompData(appData)
                .setNodeStyle(options.style)
                .setSkin('wysiwyg.common.components.cloudwidget.viewer.skins.CloudWidgetSkin');
            compProps.structure.componentType = 'wysiwyg.viewer.components.cloud.CloudGluedWidget';

            return testUtils.getComponentFromDefinition(componentDefinition, compProps);
        }

        return {
            getComponent: getComponent
        };
    });
