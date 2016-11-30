define(['lodash', 'testUtils', 'tpa/components/tpaWidget'], function (_, testUtils, tpaWidget) {
    'use strict';

    var mock = testUtils.mockFactory;

    var widgetUrl = "http://wix-dropbox.elasticbeanstalk.com/file-list";
    var widgetMobileUrl = widgetUrl + "/mobile";
    var instance = "8zODU5OCIsImRlbW9Nb2RlIjpmYWxzZX0";
    var publicModel = {
        language: 'en'
    };
    var widgetId = '33310ef4-6c66-9158-20ba-c87d08cd4ddd';
    var clientSpecMap = {
        13: {
            "type": "editor",
            "applicationId": 13,
            "appDefinitionId": "12c24951-bdcf-7df7-2a68-eab0902635fe",
            "appDefinitionName": "Store",
            "instance": instance,
            "sectionUrl": widgetUrl,
            "sectionMobileUrl": widgetMobileUrl,
            "sectionPublished": true,
            "sectionMobilePublished": true,
            "sectionSeoEnabled": true,
            "sectionDefaultPage": "",
            "sectionRefreshOnWidthChange": true,
            "widgets": {
                "33310ef4-6c66-9158-20ba-c87d08cd4ddd": {
                    "widgetUrl": widgetUrl + '/multi',
                    "widgetId": widgetId,
                    "refreshOnWidthChange": true,
                    "mobileUrl": widgetMobileUrl + '/multi',
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
        type: "TPA"
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
        return testUtils.getComponentFromDefinition(tpaWidget, props);
    };

    var givenCompWith = function (clientSpcMap, publicMdl, compAppData, compStyle, id, isMobile, viewMode, state) {
        var tpaRootNavInfo = {
            pageId: 'fakePageId',
            pageAdditionalData: state
        };

        var compProps = mock.mockProps()
            .addSiteData({clientSpecMap: clientSpcMap, siteInfo: {}}, 'rendererModel')
            .addSiteData(publicMdl, 'publicModel')
            .addSiteData(function () { return isMobile; }, 'isMobileView')
            .addSiteData(viewMode || 'site', 'viewMode')
            .setCompData(compAppData)
            .setSkin("wysiwyg.viewer.skins.TPASectionSkin");
        compProps.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPASection';
        compProps.siteData.setCurrentPage(tpaRootNavInfo.pageId, tpaRootNavInfo);
        compProps.style = compStyle;
        compProps.id = id;
        compProps.siteAPI.getPageUrl = jasmine.createSpy().and.returnValue('http://haxs0r.com');

        return getComponent(compProps);
    };

    describe('tpaResizeWindowMixin tests', function () {
        var mockComp, callback = function () {};

        beforeEach(function () {
            mockComp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, null, null);
            spyOn(mockComp, 'registerReLayout');
            spyOn(mockComp, 'setState');
        });

        it('should register relayout', function () {
            mockComp.resizeWindow(100, 100);
            expect(mockComp.registerReLayout).toHaveBeenCalled();
        });

        it('should update state with no height', function () {
            mockComp.resizeWindow(200, null, callback);
            expect(mockComp.setState).toHaveBeenCalledWith({width: 200}, callback);
        });

        it('should update state with no width', function () {
            mockComp.resizeWindow(null, 100, callback);
            expect(mockComp.setState).toHaveBeenCalledWith({height: 100}, callback);
        });

        it('should update state with zero width', function () {
            mockComp.resizeWindow(0, 100, callback);
            expect(mockComp.setState).toHaveBeenCalledWith({width: 0, height: 100}, callback);
        });

        it('should update state with zero height', function () {
            mockComp.resizeWindow(100, 0, callback);
            expect(mockComp.setState).toHaveBeenCalledWith({width: 100, height: 0}, callback);
        });

        it('should ignore on negative width', function () {
            mockComp.resizeWindow(-100, 100, callback);
            expect(mockComp.setState).toHaveBeenCalledWith({height: 100}, callback);
        });

        it('should ignore on negative height', function () {
            mockComp.resizeWindow(100, -100, callback);
            expect(mockComp.setState).toHaveBeenCalledWith({width: 100}, callback);
        });
    });
});
