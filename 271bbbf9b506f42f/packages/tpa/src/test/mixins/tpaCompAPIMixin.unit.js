define(['lodash', 'testUtils', 'tpa/components/tpaWidget', 'definition!tpa/mixins/tpaCompApiMixin'], function (_, testUtils, tpaWidget, tpaCompAPIMixinDef) {
    'use strict';

    describe('tpaCompAPIMixin', function () {
        var mock = testUtils.mockFactory;

        var compId = 'compId';
        var widgetUrl = "http://wix-dropbox.elasticbeanstalk.com/file-list";
        var instance = "lomDbcMnzz94w5UerKxJIsUlgDci8HwpAvuzD15ym-4.eyJpbnN0YW5jZUlkIjoiMTM2ZTFlYjQtMTE0NC1mNTcwLWJhMWItZjE4OWE4OTkwOGVkIiwic2lnbkRhdGUiOiIyMDE0LTA3LTE0VDE1OjI3OjIxLjE4MVoiLCJpcEFuZFBvcnQiOiI5MS4xOTkuMTE5LjI1NC8zODU5OCIsImRlbW9Nb2RlIjpmYWxzZX0";
        var publicModel = {
            language: 'en'
        };
        var style = {
        };
        var mixin;
        var clientSpecMap = {
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
            siteInfo: {}
        };
        var appData = {
            applicationId: "16",
            id: "cqhi",
            widgetId: "129acb44-2c60-3020-5989-0f5aea90b16f"
        };

        var isMobileView = function (isMobile) {
            return function () {
                return isMobile;
            };
        };

        var getComponent = function (props) {
            return testUtils.getComponentFromDefinition(tpaWidget, props);
        };
        var givenCompWith = function (clientSpcMap, publicMdl, compAppData, compStyle, id, isMobile) {
            var compProps = mock.mockProps()
                .addSiteData(clientSpcMap, 'rendererModel')
                .addSiteData(publicMdl, 'publicModel')
                .addSiteData(isMobile, 'isMobileView')
                .setCompData(compAppData)
                .setSkin("wysiwyg.viewer.skins.TPAWidgetSkin");
            compProps.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAWidget';
            compProps.style = compStyle;
            compProps.id = id;
            return getComponent(compProps);
        };
        describe('tpaUrlBuilderMixin', function () {
            it('should get desktop device type', function () {
                var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, isMobileView(false));
                var device = comp.getDeviceType();

                expect(device).toBe('desktop');
            });

            it('should get mobile device type', function () {
                var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, isMobileView(true));
                var device = comp.getDeviceType();

                expect(device).toBe('mobile');
            });

            it("should get view mode", function () {
                var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, isMobileView(false));
                var view = comp.getViewMode();

                expect(view).toBe('site');
            });
        });

        describe('Site events listening logic', function () {
            var mockSupportedEvents = {
                nav: 'nav',
                scroll: 'scroll',
                PAGE_NAVIGATION_CHANGE: 'PAGE_NAVIGATION_CHANGE',
                PAGE_NAVIGATION: 'PAGE_NAVIGATION'
            };

            var mockRegisteredEvents = ['nav'];
            var getSiteAspectMock, registerToPageChangedMock;

            beforeEach(function() {
                registerToPageChangedMock = jasmine.createSpy();
                getSiteAspectMock = jasmine.createSpy().and.returnValue({
                    registerToPageChanged: registerToPageChangedMock
                });

                mixin = tpaCompAPIMixinDef(_);
                mixin.SUPPORTED_SITE_EVENTS = mockSupportedEvents;
                mixin.state = {registeredEvents: mockRegisteredEvents};
                mixin.setState = function (newState) { this.state = newState; };
                mixin.props = {
                    siteAPI: {
                        getSiteAspect: getSiteAspectMock
                    }
                };
            });

            it('should check if event supported and return true', function () {
                var isSupported = mixin.isEventSupported('nav');
                expect(isSupported).toBeTruthy();
            });

            it('should check if event supported and return false', function () {
                var isSupported = mixin.isEventSupported('state');
                expect(isSupported).toBeFalsy();
            });

            it('should add event to registered events', function () {
                var isListened = mixin.isCompListensTo('scroll');
                expect(isListened).toBeFalsy();

                mixin.startListen('scroll');

                isListened = mixin.isCompListensTo('scroll');
                expect(isListened).toBeTruthy();
            });

            it('should remove event from registered events', function () {
                var isListened = mixin.isCompListensTo('nav');
                expect(isListened).toBeTruthy();

                mixin.stopListen('nav');

                isListened = mixin.isCompListensTo('nav');
                expect(isListened).toBeFalsy();
            });

            it('should register to scroll event when startListen is called', function () {
                var event = 'PAGE_NAVIGATION_CHANGE';
                mixin.startListen(event);

                expect(registerToPageChangedMock).toHaveBeenCalledWith(mixin, event);
            });

            it('should register to page navigation change event when startListen is called', function () {
                var event = 'PAGE_NAVIGATION_CHANGE';
                mixin.startListen(event);

                expect(registerToPageChangedMock).toHaveBeenCalledWith(mixin, event);
            });

            it('should register to page navigation event when startListen is called', function () {
                var event = 'PAGE_NAVIGATION';
                mixin.startListen(event);

                expect(registerToPageChangedMock).toHaveBeenCalledWith(mixin, event);
            });
        });

        describe('Runtime comps should have origCompId', function () {
            it('should return has origCompId for runtime comps', function () {
                appData = _.clone(appData);
                appData.origCompId = 'hxs0r';

                var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, isMobileView(false));
                var hasOrigComponent = comp.hasOrigComponent();

                expect(hasOrigComponent).toBeTruthy();
            });

            it('should return has no origCompId  by default', function () {
                var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, isMobileView(false));
                var hasOrigComponent = comp.hasOrigComponent();

                expect(hasOrigComponent).toBeTruthy();
            });
        });

        describe('setQueryParams', function () {
            xit('should add the given query params', function () {
                var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, isMobileView(false));
                comp.setQueryParams({
                    foo: 'bar',
                    bar: 'foo'
                });
                var iframeSrc = comp.buildUrl(widgetUrl);

                expect(iframeSrc).toBeDefined();
                expect(iframeSrc).toContain('&foo=bar');
                expect(iframeSrc).toContain('&bar=foo');
            });

            it('should do nothing when given query params is not an object', function () {
                var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, isMobileView(false));
                var iframeSrc = comp.buildUrl(widgetUrl);

                comp.setQueryParams('foo');

                comp.buildUrl(widgetUrl);

                expect(iframeSrc).toBe(iframeSrc);
            });
        });
    });
});
