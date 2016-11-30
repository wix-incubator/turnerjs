define(['lodash', 'testUtils', 'tpa/components/tpaWidget'], function (_, testUtils, tpaWidget) {
    'use strict';

    var mock = testUtils.mockFactory;
    var widgetUrl = "http://wix-dropbox.elasticbeanstalk.com/file-list";
    var instance = "lomDbcMnzz94w5UerKxJIsUlgDci8HwpAvuzD15ym-4.eyJpbnN0YW5jZUlkIjoiMTM2ZTFlYjQtMTE0NC1mNTcwLWJhMWItZjE4OWE4OTkwOGVkIiwic2lnbkRhdGUiOiIyMDE0LTA3LTE0VDE1OjI3OjIxLjE4MVoiLCJpcEFuZFBvcnQiOiI5MS4xOTkuMTE5LjI1NC8zODU5OCIsImRlbW9Nb2RlIjpmYWxzZX0";
    var mockRendererModel = {
        clientSpecMap: {
            16: {
                "type": "editor",
                "applicationId": 16,
                "appDefinitionId": "129acb44-2c8a-8314-fbc8-73d5b973a88f",
                "appDefinitionName": "Google Event Calendar",
                "instance": instance,
                "sectionUrl": null,
                "sectionMobileUrl": null,
                "sectionPublished": true,
                "sectionMobilePublished": false,
                "sectionSeoEnabled": true,
                "sectionDefaultPage": null,
                "sectionRefreshOnWidthChange": null,
                "widgets": {
                    "129acb44-2c60-3020-5989-0f5aea90b16f": {
                        "widgetUrl": widgetUrl,
                        "widgetId": "129acb44-2c60-3020-5989-0f5aea90b16f",
                        "refreshOnWidthChange": true,
                        "gluedOptions": null,
                        "mobileUrl": null,
                        "appPage": null,
                        "published": true,
                        "mobilePublished": false,
                        "seoEnabled": true,
                        "defaultWidth": 800,
                        "defaultHeight": 660,
                        "defaultShowOnAllPages": false,
                        "settings": {
                            "height": 630,
                            "width": 600,
                            "url": "http://google-calendar.galil.wixapps.net/settings"
                        }
                    }
                },
                "gluedWidgets": null,
                "pixelUrl": null,
                "embeddedScriptUrl": null,
                "appRequirements": {
                    "requireSiteMembers": false
                },
                "installedAtDashboard": true,
                "instanceId": "13832a86-1fa9-6da9-4542-b03f98557096",
                "settingsUrl": "http://google-calendar.galil.wixapps.net/settings",
                "dashboardUrl": null,
                "dashboardDefaultHeight": null,
                "settingsDialogBanner": null,
                "settingsCompanyName": "WixLabs",
                "settingsWidth": 600,
                "settingsHeight": 630,
                "demoMode": false,
                "sectionSettings": {
                    "height": 630,
                    "width": 600,
                    "url": "http://google-calendar.galil.wixapps.net/settings"
                },
                "vendorProductId": null,
                "vendorProducts": [],
                "permissions": {
                    "revoked": false
                },
                "panelInfo": {},
                "isTPAExtension": false,
                "name": "Google Event Calendar",
                "marketData": {}
            },
            13: {
                "type": "editor",
                "applicationId": 13,
                "appDefinitionId": "12c24951-bdcf-7df7-2a68-eab0902635fe",
                "appDefinitionName": "Store",
                "instance": "0LzQyMzA1IiwiZGVtb01vZGUiOmZhbHNlfQ",
                "sectionUrl": widgetUrl,
                "sectionMobileUrl": widgetUrl + "/mobile",
                "sectionPublished": true,
                "sectionMobilePublished": false,
                "sectionSeoEnabled": true,
                "sectionDefaultPage": "",
                "sectionRefreshOnWidthChange": true,
                "widgets": {
                    "13810ef4-6c66-9158-20ba-c87d08cd4ddd": {
                        "widgetUrl": "http://shopify-wix.herokuapp.com/store/sections",
                        "widgetId": "13810ef4-6c66-9158-20ba-c87d08cd4ddd",
                        "refreshOnWidthChange": true,
                        "mobileUrl": "http://shopify-wix.herokuapp.com/store/sections",
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
        },
		languageCode: 'en',
        siteInfo: {
        }
    };
    var appData = {
        applicationId: "16",
        id: "cqhi",
        widgetId: "129acb44-2c60-3020-5989-0f5aea90b16f",
        referenceId: "129acb44-2c60-x020-5989-xf5aea90b16f"
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
    var givenCompWith = function (rendererModel, compAppData, compStyle, id, siteProtocol, query) {
        siteProtocol = siteProtocol || 'http';
        var compProps = mock.mockProps()
            .addSiteData(rendererModel, 'rendererModel')
            .addSiteData({
                protocol: siteProtocol,
                query: query || {appDefinitionId: '123'}
            }, 'currentUrl')
            .addSiteData(jasmine.createSpy().and.returnValue(true), 'isViewerMode')
            .setCompData(compAppData)
            .setSkin("wysiwyg.viewer.skins.TPAWidgetSkin");
        compProps.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAWidget';
        compProps.style = compStyle;
        compProps.id = id;
        return getComponent(compProps);
    };

    describe('tpaUrlBuilderMixin', function () {
        describe('initial viewMode', function(){
            var comp;

            beforeEach(function(){
                comp = givenCompWith(mockRendererModel, appData, style, compId);
                comp.setState = jasmine.createSpy();
            });

            it('should return the correct initial view mode when in viewer', function() {
                comp.props.siteData.isViewerMode.and.returnValue(true);
                comp.getInitialState();
                var url = comp.buildUrl();

                expect(url).toContain('viewMode=site');
            });

            it('should return the correct initial view mode when not in viewer', function() {
                comp.props.siteData.isViewerMode.and.returnValue(false);
                comp.getInitialState();
                var url = comp.buildUrl();

                expect(url).toContain('viewMode=preview');
            });

            it('should set state to preview view mode when in preview mode with no editor', function(){
                comp.props.siteData.isViewerMode.and.returnValue(false);
                comp.getInitialState();
                var url = comp.buildUrl();
                expect(url).toContain('viewMode=preview');
            });

            it('should set state to editor view mode when in editor', function(){
                comp.props.siteData.isViewerMode.and.returnValue(false);
                comp.props.siteData.renderFlags.componentViewMode = 'editor';
                comp.getInitialState();
                var url = comp.buildUrl();
                expect(url).toContain('viewMode=editor');
            });

            it('should set state to preview view mode when in preview', function(){
                comp.props.siteData.isViewerMode.and.returnValue(false);
                comp.props.siteData.renderFlags.componentViewMode = 'preview';
                comp.getInitialState();
                var url = comp.buildUrl();
                expect(url).toContain('viewMode=preview');
            });

            it('should set state to editor and not change it till iframe is refreshed', function(){
                comp.props.siteData.isViewerMode.and.returnValue(false);
                comp.props.siteData.renderFlags.componentViewMode = 'editor';
                comp.getInitialState();
                var url = comp.buildUrl();
                expect(url).toContain('viewMode=editor');
                url = comp.buildUrl();
                expect(url).toContain('viewMode=editor');
            });
        });

        it("should build widget's iframe url", function () {
            var comp = givenCompWith(mockRendererModel, appData, style, compId);
            var iframeSrc = comp.buildUrl(widgetUrl);

            expect(iframeSrc).toBeDefined();
            expect(iframeSrc).toContain(widgetUrl);
            expect(iframeSrc).toContain('?cacheKiller=');
            expect(iframeSrc).toContain('&compId=' + compId);
            expect(iframeSrc).toContain('&deviceType=desktop');
            expect(iframeSrc).toContain('&instance=' + instance);
            expect(iframeSrc).toContain('&locale=' + mockRendererModel.languageCode);
            expect(iframeSrc).toContain('&viewMode=site');
            expect(iframeSrc).toContain('&externalId=' + appData.referenceId);
            expect(iframeSrc).toContain('&width=' + style.width);
        });

        it("should get device type", function () {
            var comp = givenCompWith(mockRendererModel, appData, style, compId);
            var device = comp.getDeviceType();

            expect(device).toBe('desktop');
        });

        it("should get if is under mobile view", function () {
            var comp = givenCompWith(mockRendererModel, appData, style, compId);
            var isUnderMobileView = comp.isUnderMobileView();

            expect(isUnderMobileView).toBeFalsy();
        });

        it('should add state queryParams if has any', function () {
            var comp = givenCompWith(mockRendererModel, appData, style, compId);
            var queryParams = {
                foo: 'bar'
            };
            var iframeSrc = comp.buildUrl(widgetUrl);
            expect(iframeSrc).not.toContain('&foo=bar');
            comp.setState({
                queryParams: queryParams
            }, function () {
                iframeSrc = comp.buildUrl(widgetUrl);
                expect(iframeSrc).toContain('&foo=bar');
            });
        });

        it("should not have ecom query param by default", function () {
            var param = 'foo:bar';
            var comp = givenCompWith(mockRendererModel, appData, style, compId);

            var iframeSrc = comp.buildUrl(widgetUrl);

            expect(iframeSrc).toBeDefined();
            expect(iframeSrc).not.toContain('&ecom-tpa-params=' + param);
        });

        it("should have ecom query param when needed", function () {
            var param = 'foo:bar';
            var query = {};
            query['ecom-tpa-params'] = param;

            mockRendererModel = _.clone(mockRendererModel);
            mockRendererModel.clientSpecMap[15] = {
                "type": "public",
                "applicationId": 15,
                "appDefinitionId": "1380b703-ce81-ff05-f115-39571d94dfcd",
                "appDefinitionName": "Wix Stores",
                "instance": "6O1205lXAoFwxytL3vGHCRH9wrcnCcTAwFnEpNWpxqY.eyJpbnN0YW5jZUlkIjoiMTNhMGJhYmMtYzkwOS1kYmFmLWNiMDYtOWZjMzljNmEyNWVkIiwic2lnbkRhdGUiOiIyMDE0LTExLTEzVDA3OjMyOjIzLjc3MFoiLCJpcEFuZFBvcnQiOiI5MS4xOTkuMTE5LjI1NC82MzUzNyIsImRlbW9Nb2RlIjpmYWxzZX0",
                "sectionUrl": "http://ecom.wix.com/storefront/gallery",
                "sectionPublished": false,
                "sectionMobilePublished": false,
                "sectionSeoEnabled": true,
                "sectionDefaultPage": "",
                "sectionRefreshOnWidthChange": true,
                "widgets": {
                    "1380bbb4-8df0-fd38-a235-88821cf3f8a4": {
                        "widgetUrl": "http://ecom.wix.com/storefront/success",
                        "widgetId": "1380bbb4-8df0-fd38-a235-88821cf3f8a4",
                        "refreshOnWidthChange": true,
                        "appPage": {
                            "id": "thank_you_page",
                            "name": "THANK YOU PAGE",
                            "defaultPage": "",
                            "hidden": true
                        },
                        "published": false,
                        "mobilePublished": false,
                        "seoEnabled": true
                    },
                    "139a41fd-0b1d-975f-6f67-e8cbdf8ccc82": {
                        "widgetUrl": "http://ecom.wix.com/storefront/minigallery",
                        "widgetId": "139a41fd-0b1d-975f-6f67-e8cbdf8ccc82",
                        "refreshOnWidthChange": true,
                        "published": true,
                        "mobilePublished": false,
                        "seoEnabled": true
                    },
                    "1380bbc4-1485-9d44-4616-92e36b1ead6b": {
                        "widgetUrl": "http://ecom.wix.com/storefront/cartwidget",
                        "widgetId": "1380bbc4-1485-9d44-4616-92e36b1ead6b",
                        "refreshOnWidthChange": true,
                        "published": true,
                        "mobilePublished": false,
                        "seoEnabled": true
                    },
                    "1380bbab-4da3-36b0-efb4-2e0599971d14": {
                        "widgetUrl": "http://ecom.wix.com/storefront/cart",
                        "widgetId": "1380bbab-4da3-36b0-efb4-2e0599971d14",
                        "refreshOnWidthChange": true,
                        "appPage": {
                            "id": "shopping_cart",
                            "name": "SHOPPING CART",
                            "defaultPage": "",
                            "hidden": true
                        },
                        "published": false,
                        "mobilePublished": false,
                        "seoEnabled": true
                    },
                    "13a0b7ce-0068-54eb-afa1-bad795946dcc": {
                        "widgetUrl": "http://ecom.wix.com/storefront/product",
                        "widgetId": "13a0b7ce-0068-54eb-afa1-bad795946dcc",
                        "refreshOnWidthChange": true,
                        "appPage": {
                            "id": "product_page",
                            "name": "PRODUCT PAGE",
                            "defaultPage": "",
                            "hidden": true
                        },
                        "published": false,
                        "mobilePublished": false,
                        "seoEnabled": true
                    },
                    "1380bba0-253e-a800-a235-88821cf3f8a4": {
                        "widgetUrl": "http://ecom.wix.com/storefront/gallery",
                        "widgetId": "1380bba0-253e-a800-a235-88821cf3f8a4",
                        "refreshOnWidthChange": true,
                        "appPage": {
                            "id": "products_gallery",
                            "name": "PRODUCTS GALLERY",
                            "defaultPage": "",
                            "hidden": false
                        },
                        "published": false,
                        "mobilePublished": false,
                        "seoEnabled": true
                    }
                },
                "appRequirements": {
                    "requireSiteMembers": false
                },
                "installedAtDashboard": false,
                "permissions": {
                    "revoked": true
                }
            };

            appData = {
                applicationId: "15",
                id: "cqhi",
                widgetId: "1380bbb4-8df0-fd38-a235-88821cf3f8a4"
            };

            var comp = givenCompWith(mockRendererModel, appData, style, compId, 'http', query);

            var iframeSrc = comp.buildUrl(widgetUrl);

            expect(iframeSrc).toBeDefined();
            expect(iframeSrc).toContain('&ecom-tpa-params=foo%3Abar');
        });
    });
});
