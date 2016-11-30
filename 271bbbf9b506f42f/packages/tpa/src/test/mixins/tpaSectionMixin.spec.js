define(['lodash', 'testUtils', 'tpa/components/tpaSection', 'reactDOM'], function(_, testUtils, tpaSection, ReactDOM) {
    'use strict';
    var openExperiments = testUtils.experimentHelper.openExperiments;
    var mock = testUtils.mockFactory;

    var widgetUrl = "http://wix-dropbox.elasticbeanstalk.com/file-list";
    var widgetMobileUrl = widgetUrl + "/mobile";
    var instance = "8zODU5OCIsImRlbW9Nb2RlIjpmYWxzZX0";
    var publicModel = {
        language: 'en',
        pageList: {
            pages: [{pageId: 'currentPage'}]
        }
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
        return testUtils.getComponentFromDefinition(tpaSection, props);
    };

    var givenCompWith = function (clientSpcMap, publicMdl, compAppData, compStyle, id, isMobile, viewMode, state, forceStateUpdate, pageId) {
        var fakeTpaPage = {
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

        compProps.siteData.setCurrentPage(fakeTpaPage.pageId, fakeTpaPage);
        compProps.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPASection';
        compProps.style = compStyle;
        compProps.id = id;
        compProps.siteAPI.getPageUrl = jasmine.createSpy().and.returnValue('http://haxs0r.com');

        if (pageId) {
            compProps.pageId = pageId;
        }

        return getComponent(compProps);
    };

    describe('tpaSection component dom', function () {
        it('should get iframe URL with TPASection specific query params', function () {
            var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, null, null, '#!testHash');
            var iframeSrc = comp.buildUrl(widgetUrl);

            expect(iframeSrc).toBeDefined();
            expect(iframeSrc).toContain(widgetUrl);
            expect(iframeSrc).toContain('&section-url=' + encodeURIComponent('http://haxs0r.com'));
            expect(iframeSrc).toContain('&target=_top');
        });

        it('should set iframe URL with right app state (hash state)', function () {
            var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, null, null, '#!testHash');
            var iframeSrc = comp.buildUrl(widgetUrl);

            expect(iframeSrc).toBeDefined();
            expect(iframeSrc).not.toContain(widgetUrl + '/#!testHash');
            expect(iframeSrc).toContain(widgetUrl);
            expect(iframeSrc).toContain('#!testHash');
            expect(_.endsWith(iframeSrc, '#!testHash')).toBeTruthy();


            expect(iframeSrc).toContain('&section-url=' + encodeURIComponent('http://haxs0r.com'));
            expect(iframeSrc).toContain('&target=_top');
        });

        it('should set iframe URL with right app state (path state)', function () {
            var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, null, null, 'test/state/path');
            var iframeSrc = comp.buildUrl(widgetUrl);

            expect(iframeSrc).toBeDefined();
            expect(iframeSrc).toContain(widgetUrl + '/test/state/path');
            expect(iframeSrc).toContain(widgetUrl);
            expect(_.endsWith(iframeSrc, 'test/state/path')).toBeFalsy();
        });

        it('should get TPASection mobile iframe URL', function () {
            var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, true);
            var iframeSrc = comp.buildUrl(widgetMobileUrl);

            expect(iframeSrc).toBeDefined();
            expect(iframeSrc).toContain(widgetMobileUrl);
        });

        describe('when rendering in mobile view', function() {
            var copyOfClientSpecMap, appDef, comp;

            beforeEach(function() {
                comp = null;
                copyOfClientSpecMap = _.clone(clientSpecMap, true);
                appDef = copyOfClientSpecMap[appData.applicationId];
            });

            describe('when both sectionMobileUrl and sectionMobilePublished are truthy', function() {
                beforeEach(function() {
                    comp = givenCompWith(copyOfClientSpecMap, publicModel, appData, style, compId, true);
                });

                it('should not have an "unavailable" overlay', function() {
                    expect(comp).not.toContainComponentOfType('wysiwyg.viewer.components.tpapps.TPAUnavailableMessageOverlay');
                });

                it('should render the iframe', function() {
                    var iframeElement = ReactDOM.findDOMNode(comp).querySelector('iframe');
                    expect(iframeElement).not.toBeNull();
                });

                it('should render the iframe with the mobile url', function() {
                    var iframeElement = ReactDOM.findDOMNode(comp).querySelector('iframe');
                    expect(iframeElement.src).toContain(appDef.sectionMobileUrl);
                });
            });
        });
    });

    describe('tpaSection state', function () {
        it('should not update state', function () {
            var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, false, null, 'new-state-1', false);
            var iframeSrc = comp.buildUrl(widgetUrl);

            expect(iframeSrc).toBeDefined();
            expect(iframeSrc).toContain(widgetUrl + '/new-state-1');

            comp.props.siteData.setCurrentPage('someId', {pageAdditionalData: 'new-state-2'});

            var skinProps = comp.getSkinProperties();
            iframeSrc = skinProps.iframe.src;

            expect(iframeSrc).toContain(widgetUrl + '/new-state-1');
            expect(iframeSrc).not.toContain(widgetUrl + '/new-state-2');
        });

        it('should update state', function () {
            var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, false, null, 'new-state-1', true);
            var iframeSrc = comp.buildUrl(widgetUrl);

            expect(iframeSrc).toBeDefined();
            expect(iframeSrc).toContain(widgetUrl + '/new-state-1');

            comp.props.siteData.setCurrentPage('someId', {pageAdditionalData: 'new-state-2'});

            var skinProps = comp.getSkinProperties();
            iframeSrc = skinProps.iframe.src;

            expect(iframeSrc).toContain(widgetUrl + '/new-state-1');
            expect(iframeSrc).not.toContain(widgetUrl + '/new-state-2');
        });

        describe('deepLinking experiment', function(){

            var comp;
            beforeEach(function(){
                openExperiments('deepLinking');
                comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, false, 'site', 'new-state-1', true, 'currentPage');
                spyOn(comp.props.siteData, 'isViewerMode').and.returnValue(true);
                spyOn(comp.props.siteData, 'getExistingRootNavigationInfo').and.returnValue({pageId: 'currentPage', pageAdditionalData: 'new-state-2', title: 'my-page'});
                spyOn(comp, 'isCompListensTo').and.returnValue(true);
                spyOn(comp, 'sendPostMessage');
            });

            it('should update section url state in viewer mode', function () {
                comp.componentWillReceiveProps(comp.props);

                expect(comp.state.sectionUrlState).toBe('new-state-2');
            });

            it('should not update section url state in preview mode', function () {
                comp.props.siteData.isViewerMode.and.returnValue(false);

                comp.componentWillReceiveProps(comp.props);

                expect(comp.state.sectionUrlState).toBe('new-state-1');
                expect(comp.sendPostMessage).toHaveBeenCalledWith({
                    intent: 'addEventListener',
                    eventType: 'STATE_CHANGED',
                    params: {
                        newState: 'new-state-2'
                    }
                });
            });

            it('should handle navigation when coming with push state (client side navigation)', function () {
                comp.state.pushState = 'new-state-2';

                comp.componentWillReceiveProps(comp.props);

                expect(comp.urlState).toBe('new-state-2');
                expect(comp.state.pushState).toBeUndefined();
                expect(comp.sendPostMessage).toHaveBeenCalledWith({
                    intent: 'addEventListener',
                    eventType: 'STATE_CHANGED',
                    params: {
                        newState: 'new-state-2'
                    }
                });
            });

            it('should handle navigation without push state when nextUrlState is new ', function () {
                comp.componentWillReceiveProps(comp.props);

                expect(comp.urlState).toEqual('new-state-2');
                expect(comp.state.sectionUrlState).toEqual('new-state-2');
                expect(comp.sendPostMessage).toHaveBeenCalledWith({
                    intent: 'addEventListener',
                    eventType: 'STATE_CHANGED',
                    params: {
                        newState: 'new-state-2'
                    }
                });
            });

            it('should not navigate (without push state) when nextUrlState is same as existing (resize scenario)', function () {
                comp.urlState = 'new-state-2';

                comp.componentWillReceiveProps(comp.props);

                expect(comp.state.sectionUrlState).toEqual('new-state-1');
                expect(comp.sendPostMessage).toHaveBeenCalledWith({
                    intent: 'addEventListener',
                    eventType: 'STATE_CHANGED',
                    params: {
                        newState: 'new-state-2'
                    }
                });
            });
        });
    });

    describe('isMobileReady', function() {
        describe('sectionMobilePublished is false', function() {
            var comp;
            beforeEach(function() {
                comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId);
                comp.props.compData.applicationId = 13;
            });
            it('should return false if app is in dev mode and no section mobile url', function() {
                comp.isInMobileDevMode = jasmine.createSpy().and.returnValue(true);
                comp.props.siteData.rendererModel.clientSpecMap = {
                    13: {
                    }
                };
                expect(comp.isMobileReady()).toBeFalsy();
            });

            it('should return true if app is in dev mode and there is section mobile url', function() {
                comp.isInMobileDevMode = jasmine.createSpy().and.returnValue(true);
                comp.props.siteData.rendererModel.clientSpecMap = {
                    13: {
                        sectionMobileUrl: 'mobileUrl'
                    }
                };
                expect(comp.isMobileReady()).toBeTruthy();
            });

            it('should return false if there is section mobile url but no function isInMobileDevMode', function() {
                comp.isInMobileDevMode = null;
                comp.props.siteData.rendererModel.clientSpecMap = {
                    13: {
                        sectionMobileUrl: 'mobileUrl'
                    }
                };
                expect(comp.isMobileReady()).toBeFalsy();
            });

            it('should return false if there is section mobile url but app is not in dev mode', function() {
                comp.isInMobileDevMode = jasmine.createSpy().and.returnValue(false);
                comp.props.siteData.rendererModel.clientSpecMap = {
                    13: {
                        sectionMobileUrl: 'mobileUrl'
                    }
                };
                expect(comp.isMobileReady()).toBeFalsy();
            });
        });

        describe('isInDevMode is false', function() {
            var comp;
            beforeEach(function() {
                comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId);
                comp.props.compData.applicationId = 13;
                comp.isInMobileDevMode = jasmine.createSpy().and.returnValue(false);
            });
            it('should return false if app section Mobile is Published and no section mobile url', function() {
                comp.props.siteData.rendererModel.clientSpecMap = {
                    13: {
                        sectionMobilePublished: true
                    }
                };
                expect(comp.isMobileReady()).toBeFalsy();
            });

            it('should return true if app section Mobile is Published and there is section mobile url', function() {
                comp.props.siteData.rendererModel.clientSpecMap = {
                    13: {
                        sectionMobilePublished: true,
                        sectionMobileUrl: 'mobileUrl'
                    }
                };
                expect(comp.isMobileReady()).toBeTruthy();
            });

            it('should return false if there is section mobile url but app section Mobile is not published', function() {
                comp.isInMobileDevMode = null;
                comp.props.siteData.rendererModel.clientSpecMap = {
                    13: {
                        sectionMobileUrl: 'mobileUrl'
                    }
                };
                expect(comp.isMobileReady()).toBeFalsy();
            });
        });

        describe('sub section', function() {
            var comp, mockClientSpecMap;
            beforeEach(function() {
                mockClientSpecMap = {
                    14: {
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
                            "1": {
                                "widgetUrl": widgetUrl + '/multi',
                                "widgetId": widgetId,
                                "refreshOnWidthChange": true,
                                "mobileUrl": undefined,
                                "appPage": {
                                    "id": "Store",
                                    "name": "Store",
                                    "defaultPage": "",
                                    "hidden": false
                                },
                                "published": true,
                                "mobilePublished": true,
                                "seoEnabled": true,
                                "settings": {
                                    "height": 900,
                                    "width": 600,
                                    "url": "http://shopify-wix.herokuapp.com/admin/settings/dashboard"
                                }
                            },
                            "2": {
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

                comp = givenCompWith(mockClientSpecMap, publicModel, appData, style, compId);
                comp.props.compData.applicationId = 14;
                comp.isInMobileDevMode = jasmine.createSpy().and.returnValue(true);
            });

            it('should return false if mobile url is not defined', function() {
                comp.props.compData.widgetId = 1;
                expect(comp.isMobileReady()).toBeFalsy();

            });

            it('should return false if mobile url is defined but not published and not in dev mode', function() {
                comp.props.compData.widgetId = 1;
                comp.isInMobileDevMode.and.returnValue(false);
                comp.props.siteData.rendererModel.clientSpecMap[14].widgets[1].mobileUrl = widgetMobileUrl + '/multi';
                comp.props.siteData.rendererModel.clientSpecMap[14].widgets[1].mobilePublished = false;

                expect(comp.isMobileReady()).toBeFalsy();
            });

            it('should return true if mobile url is defined and published', function() {
                comp.props.compData.widgetId = 1;
                comp.isInMobileDevMode.and.returnValue(false);
                comp.props.siteData.rendererModel.clientSpecMap[14].widgets[1].mobileUrl = widgetMobileUrl + '/multi';
                comp.props.siteData.rendererModel.clientSpecMap[14].widgets[1].mobilePublished = true;

                expect(comp.isMobileReady()).toBeTruthy();
            });

            it('should return true if mobile url is defined and not published but in dev mode', function() {
                comp.props.compData.widgetId = 1;
                comp.isInMobileDevMode.and.returnValue(true);
                comp.props.siteData.rendererModel.clientSpecMap[14].widgets[1].mobileUrl = widgetMobileUrl + '/multi';
                comp.props.siteData.rendererModel.clientSpecMap[14].widgets[1].mobilePublished = false;

                expect(comp.isMobileReady()).toBeTruthy();
            });
        });
    });
});
