define(['lodash', 'testUtils', 'tpa/components/tpaWidget', 'reactDOM'], function(_, testUtils, tpaWidget, ReactDOM) {
    'use strict';

    describe('tpaCompBaseMixin', function () {
        var mock = testUtils.mockFactory;
        var widgetUrl = "http://wix-dropbox.elasticbeanstalk.com/file-list";
        var instance = "lomDbcMnzz94w5UerKxJIsUlgDci8HwpAvuzD15ym-4.eyJpbnN0YW5jZUlkIjoiMTM2ZTFlYjQtMTE0NC1mNTcwLWJhMWItZjE4OWE4OTkwOGVkIiwic2lnbkRhdGUiOiIyMDE0LTA3LTE0VDE1OjI3OjIxLjE4MVoiLCJpcEFuZFBvcnQiOiI5MS4xOTkuMTE5LjI1NC8zODU5OCIsImRlbW9Nb2RlIjpmYWxzZX0";
        var publicModel = {
            language: 'en'
        };
        var clientSpecMap = {
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
                "sectionMobilePublished": true,
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
        };
        var appData = {
            applicationId: "16",
            id: "cqhi",
            widgetId: "129acb44-2c60-3020-5989-0f5aea90b16f"
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
        var isMobileView;
        var givenCompWith = function (clientSpcMap, publicMdl, compAppData, compStyle, id, siteProtocol) {
            siteProtocol = siteProtocol || 'http';
            var compProps = mock.mockProps()
                .addSiteData({clientSpecMap: clientSpcMap, siteInfo: {}}, 'rendererModel')
                .addSiteData(publicMdl, 'publicModel')
                .addSiteData({
                    protocol: siteProtocol,
                    query: {
                        appDefinitionId: '123'
                    }
                }, 'currentUrl')
                .addSiteData(_.constant(isMobileView), 'isMobileView')
                .setCompData(compAppData)
                .setSkin("wysiwyg.viewer.skins.TPAWidgetSkin");
            compProps.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAWidget';
            compProps.style = compStyle;
            compProps.id = id;
            return getComponent(compProps);
        };

        beforeEach(function() {
            isMobileView = false;
        });

        describe('API', function () {
            it("should get if is under mobile view", function () {
                var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId);
                var isUnderMobileView = comp.isUnderMobileView();

                expect(isUnderMobileView).toBeFalsy();
            });
        });

        describe('state changes', function() {
            var comp;

            beforeEach(function() {
                jasmine.clock().install();
                comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId);
            });

            afterEach(function() {
                jasmine.clock().uninstall();
            });

            xdescribe('initial state', function() {
                describe('when the site url is http', function() {
                    it('should have a preloader overlay', function() {
                        expect(comp).toContainComponentOfType('wysiwyg.viewer.components.tpapps.TPAPreloaderOverlay');
                    });
                });

                describe('when the site protocol is https', function() {
                    beforeEach(function() {
                        comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, 'https');
                    });

                    it('should have an "unavailable" overlay', function() {
                        expect(comp).toContainComponentOfType('wysiwyg.viewer.components.tpapps.TPAUnavailableMessageOverlay');
                    });
                });
            });

            describe('initial state', function() {
                it('should have a visibility hidden', function() {
                    expect(comp.state.visibility).toBe('hidden');
                });
            });

            describe('after setAppIsAlive is called', function() {
                beforeEach(function(done) {
                    comp.setAppIsAlive(done);
                });

                it('should have a null overlay', function() {
                    expect(comp.state.overlay).toBeFalsy();
                    expect(comp).not.toContainComponentOfType('wysiwyg.viewer.components.tpapps.TPAPreloaderOverlay');
                    expect(comp).not.toContainComponentOfType('wysiwyg.viewer.components.tpapps.TPAUnavailableMessageOverlay');
                });

                it('should have a visibility visible', function() {
                    expect(comp.state.visibility).toBe('visible');
                });
            });

            describe('when setAppIsAlive is not called in the timeout period', function() {
                beforeEach(function() {
                    spyOn(comp, 'setState');
                    jasmine.clock().tick(comp.ALIVE_TIMEOUT + 1);
                });

                it('should set the overlay state to unresponsive and visibility to visible', function() {
                    expect(comp.setState).toHaveBeenCalledWith({
                            overlay: 'unresponsive',
                            visibility : 'visible'
                        }, jasmine.any(Function)
                    );
                });
            });

            describe('when overlay state is changed', function () {
                beforeEach(function(done) {
                    comp.setState({overlay: 'unresponsive'}, function(){
                        done();
                    });
                });


                it('should remove the iframe', function () {
                    var iframeElement = ReactDOM.findDOMNode(comp).querySelector('iframe');
                    expect(iframeElement).toBe(null);
                });
            });
        });

        describe('when an iframe with a non-secured url should be loaded in a site with a secured url', function() {
            var comp;

            beforeEach(function() {
                var copyOfClientSpecMap = _.clone(clientSpecMap, true);
                var widgetAppData = copyOfClientSpecMap[appData.applicationId].widgets[appData.widgetId];
                var url = widgetAppData.widgetUrl;
                widgetAppData.widgetUrl = url.replace(/^http:/, 'https:');

                comp = givenCompWith(copyOfClientSpecMap, publicModel, appData, style, compId, 'https');
            });

            it('should not have an "unavailable" overlay', function() {
                expect(comp).not.toContainComponentOfType('wysiwyg.viewer.components.tpapps.TPAUnavailableMessageOverlay');
            });

            it('should render the iframe', function() {
                var iframeElement = ReactDOM.findDOMNode(comp).querySelector('iframe');
                expect(iframeElement).not.toBeNull();
            });
        });

        //server has regax to switch iframe to the site protocol
        xdescribe('when an iframe with a secured url should be loaded in a site with a secured url', function() {
            var comp;
            beforeEach(function() {
                comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, 'https');
            });

            it('should have an "unavailable" overlay', function() {
                expect(comp).toContainComponentOfType('wysiwyg.viewer.components.tpapps.TPAUnavailableMessageOverlay');
            });

            it('should have an appropriate message', function() {
                expect(ReactDOM.findDOMNode(comp).innerHTML).toContain('We\'re sorry, this content cannot be displayed');
            });

            it('should render the iframe', function() {
                var iframeElement = ReactDOM.findDOMNode(comp).querySelector('iframe');
                expect(iframeElement).toBeDefined();
            });
        });
    });
});
