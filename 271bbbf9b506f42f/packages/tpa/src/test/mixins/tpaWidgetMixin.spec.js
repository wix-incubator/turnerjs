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
        widgetId: widgetId,
        type: "TPAWidget"
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

    var givenCompWith = function (clientSpcMap, publicMdl, compAppData, compStyle, id, isMobile, viewMode) {
        var compProps = mock.mockProps()
            .addSiteData({clientSpecMap: clientSpcMap, siteInfo: {}}, 'rendererModel')
            .addSiteData(publicMdl, 'publicModel')
            .addSiteData(function () { return isMobile; }, 'isMobileView')
            .addSiteData(viewMode || 'site', 'viewMode')
            .setCompData(compAppData)
            .setSkin("wysiwyg.viewer.skins.TPAWidgetSkin");
        compProps.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAWidget';
        compProps.style = compStyle;
        compProps.id = id;
        compProps.siteAPI.getPageUrl = jasmine.createSpy().and.returnValue('http://haxs0r.com');

        return getComponent(compProps);
    };

    describe('tpaWidget getBaseUrl', function () {
        it('should get iframe URL when app has data', function () {
            var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, false, false);
            var iframeSrc = comp.getBaseUrl();

            expect(iframeSrc).toBeDefined();
            expect(iframeSrc).toContain(widgetUrl);
        });

        it('should get blank URL when app has no data', function () {
            var comp = givenCompWith(clientSpecMap, publicModel, {}, style, compId, false, false);
            var iframeSrc = comp.getBaseUrl();

            expect(iframeSrc).toBeDefined();
            expect(iframeSrc).toEqual('');
        });

        describe('isMobileReady', function() {
            var comp;
            var mobileUrl = 'mobileUrl';

            beforeEach(function() {
                comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, false, false);
                comp.isUnderMobileView = jasmine.createSpy().and.returnValue(true);
                comp.props.compData.applicationId = 12;
                comp.props.compData.widgetId = '123';
                comp.props.siteData.rendererModel.clientSpecMap = {
                    12: {
                        widgets: {
                            '123':{
                                widgetUrl: widgetUrl
                            }
                        }
                    }
                };
            });

            describe('mobilePublished is false', function() {
                it('should return widget url if app is in dev mode and no widget mobile url', function() {
                    comp.isInMobileDevMode = jasmine.createSpy().and.returnValue(true);
                    expect(comp.getBaseUrl()).toEqual(widgetUrl);
                });

                it('should return mobile url if app is in dev mode and there is mobile url', function() {
                    comp.isInMobileDevMode = jasmine.createSpy().and.returnValue(true);
                    comp.props.siteData.rendererModel.clientSpecMap[12].widgets[123].mobileUrl = mobileUrl;
                    expect(comp.getBaseUrl()).toEqual(mobileUrl);
                });

                it('should return widget url if there is mobile mobile url but no function isInMobileDevMode', function() {
                    comp.isInMobileDevMode = null;
                    expect(comp.getBaseUrl()).toEqual(widgetUrl);
                });

                it('should return widget url if there is mobile url but app is not in dev mode', function() {
                    comp.isInMobileDevMode = jasmine.createSpy().and.returnValue(false);
                    expect(comp.getBaseUrl()).toEqual(widgetUrl);
                });
            });

            describe('isInDevMode is false', function() {
                beforeEach(function() {
                    comp.isInMobileDevMode = jasmine.createSpy().and.returnValue(false);
                });
                it('should return widget url if mobile url is Published and no mobile url', function() {
                    comp.props.siteData.rendererModel.clientSpecMap[12].widgets[123].mobileUrl = null;
                    comp.props.siteData.rendererModel.clientSpecMap[12].widgets[123].mobilePublished = true;
                    expect(comp.getBaseUrl()).toEqual(widgetUrl);
                });

                it('should return mobile url mobile url is Published and there is mobile url', function() {
                    comp.props.siteData.rendererModel.clientSpecMap[12].widgets[123].mobileUrl = mobileUrl;
                    comp.props.siteData.rendererModel.clientSpecMap[12].widgets[123].mobilePublished = true;
                    expect(comp.getBaseUrl()).toEqual(mobileUrl);
                });

                it('should return widget url if there is mobile url but mobile url is not published', function() {
                    comp.props.siteData.rendererModel.clientSpecMap[12].widgets[123].mobileUrl = mobileUrl;
                    comp.props.siteData.rendererModel.clientSpecMap[12].widgets[123].mobilePublished = false;
                    expect(comp.getBaseUrl()).toEqual(widgetUrl);
                });
            });
        });
    });
});
