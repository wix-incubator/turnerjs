define(['lodash', 'testUtils', 'tpa/components/tpaMultiSection', 'reactDOM'], function(_, testUtils, tpaMultiSection, ReactDOM) {
    'use strict';

    var mock = testUtils.mockFactory;

    var widgetUrl = "http://wix-dropbox.elasticbeanstalk.com/file-list";
    var widgetMobileUrl = widgetUrl + "/mobile";
    var instance = "8zODU5OCIsImRlbW9Nb2RlIjpmYWxzZX0";
    var publicModel = {
        language: 'en'
    };
    var widgetId = '23810ef4-6c66-9158-20ba-c87d08cd4ddd';
    var clientSpecMap = {
        13: {
            "type": "editor",
            "applicationId": 13,
            "appDefinitionId": "12c24951-bdcf-7df7-2a68-eab0902635fe",
            "appDefinitionName": "Store",
            "instance": instance,
            "sectionUrl": widgetUrl + '/section',
            "sectionMobileUrl": widgetMobileUrl,
            "sectionPublished": true,
            "sectionMobilePublished": true,
            "sectionSeoEnabled": true,
            "sectionDefaultPage": "",
            "sectionRefreshOnWidthChange": true,
            "widgets": {
                "23810ef4-6c66-9158-20ba-c87d08cd4ddd": {
                    "widgetUrl": widgetUrl,
                    "widgetId": "23810ef4-6c66-9158-20ba-c87d08cd4ddd",
                    "refreshOnWidthChange": true,
                    "mobileUrl": widgetMobileUrl,
                    "appPage": {
                        "id": "Store",
                        "name": "Store",
                        "defaultPage": "",
                        "hidden": false
                    },
                    "published": true,
                    "mobilePublished": false,
                    "seoEnabled": true,
                    "settings": {
                        "height": 900,
                        "width": 600,
                        "url": "http://shopify-wix.herokuapp.com/admin/settings/dashboard"
                    }
                },
                "1234": {
                    "widgetUrl": widgetUrl,
                    "widgetId": "1234",
                    "refreshOnWidthChange": true,
                    "mobileUrl": widgetMobileUrl,
                    "appPage": {
                        "id": "Store",
                        "name": "Store",
                        "defaultPage": "Wix",
                        "hidden": false
                    },
                    "published": true,
                    "mobilePublished": false,
                    "seoEnabled": true,
                    "settings": {
                        "height": 900,
                        "width": 600,
                        "url": "http://shopify-wix.herokuapp.com/admin/settings/dashboard"
                    }
                }
            },
            "appRequirements": {
                "requireSiteMembers": false
            },
            "installedAtDashboard": true,
            "instanceId": "13829c30-42ca-a53a-e4a6-4a99d603b6d8",
            "settingsUrl": "http://shopify-wix.herokuapp.com/admin/settings/dashboard",
            "settingsCompanyName": "Shopify",
            "settingsWidth": 600,
            "settingsHeight": 900,
            "demoMode": false,
            "sectionSettings": {
                "height": 900,
                "width": 600,
                "url": "http://shopify-wix.herokuapp.com/admin/settings/dashboard"
            },
            "vendorProducts": ["Wix_Basic"],
            "permissions": {
                "revoked": false
            }
        }
    };
    var appData = {
        applicationId: "13",
        id: "cqhi",
        widgetId: widgetId,
        type: "TPAMultiSection"
    };

    var style = {
        height: 261,
        left: 0,
        position: "absolute",
        top: 65,
        width: 270
    };
    var compId = 'compId';

    var getComponent = function (props) {
        return testUtils.getComponentFromDefinition(tpaMultiSection, props);
    };

    var givenCompWith = function (clientSpcMap, publicMdl, compAppData, compStyle, id, isMobile, viewMode, state, forceStateUpdate) {
        var tpaRootNavInfo = {
            pageId: 'fakePageId',
            forceStateUpdate: forceStateUpdate || false,
            pageAdditionalData: state
        };

        var compProps = mock.mockProps()
            .addSiteData({clientSpecMap: clientSpcMap, siteInfo: {}}, 'rendererModel')
            .addSiteData(publicMdl, 'publicModel')
            .addSiteData(function () { return isMobile; }, 'isMobileView')
            .addSiteData(viewMode || 'site', 'viewMode')
            .setCompData(compAppData)
            .setSkin("wysiwyg.viewer.skins.TPASectionSkin");

        compProps.siteData.setCurrentPage(tpaRootNavInfo.pageId, tpaRootNavInfo);
        compProps.style = compStyle;
        compProps.id = id;
        compProps.siteAPI.getPageUrl = jasmine.createSpy().and.returnValue('http://haxs0r.com');
        compProps.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAMultiSection';

        return getComponent(compProps);
    };

    describe('tpaSection component dom', function () {
        it('should get iframe URL with TPAMultiSection specific query params', function () {

            var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, false, null, '#!testHash');

            var iframeElement = ReactDOM.findDOMNode(comp).querySelector('iframe');

            expect(iframeElement).toBeDefined();

            expect(iframeElement.src.indexOf(widgetUrl)).toBe(0);
            expect(iframeElement.src).toContain(widgetUrl);

            var iframeSrc = comp.getBaseUrl();

            expect(iframeSrc).toEqual(widgetUrl);
        });

        it('should get the iframe url with default page', function() {
            var mockAppData = {
                applicationId: "13",
                id: "cqhi",
                widgetId: "1234",
                type: "TPAMultiSection"
            };

            var comp = givenCompWith(clientSpecMap, publicModel, mockAppData, style, compId, false, null, '#!testHash');
            var iframeSrc = comp.getBaseUrl();
            var expectedUrl = widgetUrl + '/Wix';

            expect(iframeSrc).toEqual(expectedUrl);
        });

        it('should render the iframe with the mobile url', function () {
            clientSpecMap = _.clone(clientSpecMap);
            clientSpecMap[13].widgets[widgetId].mobilePublished = true;
            var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, true);

            var iframeElement = ReactDOM.findDOMNode(comp).querySelector('iframe');

            expect(iframeElement).toBeDefined();
            expect(iframeElement.src.indexOf(widgetMobileUrl)).toBe(0);
            expect(iframeElement.src).toContain(widgetMobileUrl);
        });
    });
});
