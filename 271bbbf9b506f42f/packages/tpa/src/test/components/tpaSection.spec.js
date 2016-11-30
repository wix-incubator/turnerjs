define(['lodash', 'testUtils', 'tpa/components/tpaSection', 'reactDOM', 'utils'], function(_, testUtils, tpaSection, ReactDOM, utils) {
    'use strict';

    var openExperiments = testUtils.experimentHelper.openExperiments;

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
        },
        14: {
            "type": "editor",
            "applicationId": 14,
            "appDefinitionId": "12c24777-bdcf-7df7-2a68-eab0902635fe",
            "appDefinitionName": "My App",
            "instance": instance,
            "sectionUrl": widgetUrl,
            "sectionMobileUrl": widgetMobileUrl,
            "sectionPublished": true,
            "sectionMobilePublished": true,
            "sectionSeoEnabled": true,
            "sectionDefaultPage": "Wix",
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

    var appDataMultiWidget = {
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
        return testUtils.getComponentFromDefinition(tpaSection, props);
    };

    var givenCompWith = function (clientSpcMap, publicMdl, compAppData, compStyle, id, isMobile, viewMode, state, forceStateUpdate) {
        utils.log.verbose(forceStateUpdate);
        return getComponent(getProps.apply(null, arguments));
    };

    var getProps = function(clientSpcMap, publicMdl, compAppData, compStyle, id, isMobile, viewMode, state, forceStateUpdate){
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
        compProps.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPASection';

        return compProps;
    };

    describe('tpa section', function(){

        beforeAll(function(){
            openExperiments('deepLinking');
        });

        describe('tpaSection component dom', function () {
            it('should get iframe URL with TPASection specific query params', function () {
                var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, null, null, '#!testHash');
                var iframeSrc = comp.buildUrl(widgetUrl);

                expect(iframeSrc).toBeDefined();
                expect(iframeSrc).toContain(widgetUrl);
                expect(iframeSrc).toContain('&section-url=' + encodeURIComponent('http://haxs0r.com'));
                expect(iframeSrc).toContain('&target=_top');
            });


            it('should get TPASection mobile iframe URL', function () {
                var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId, true);
                var iframeSrc = comp.buildUrl(widgetMobileUrl);

                expect(iframeSrc).toBeDefined();
                expect(iframeSrc).toContain(widgetMobileUrl);
            });

            it('should add default page to url when exists', function() {
                var mockAppData = {
                    applicationId: "14",
                    id: "ccci",
                    type: "TPA"
                };
                var comp = givenCompWith(clientSpecMap, publicModel, mockAppData, style, compId, true);

                var iframeSrc = comp.getBaseUrl();
                var expectedUrl = widgetMobileUrl + '/Wix';

                expect(iframeSrc).toEqual(expectedUrl);
            });

            describe('tpaSection with tpaWidget data', function() {
                it('should render the iframe with widget url', function() {
                    var copyOfClientSpecMap = _.clone(clientSpecMap);
                    var comp = givenCompWith(copyOfClientSpecMap, publicModel, appDataMultiWidget, style, compId, false);
                    var iframeElement = ReactDOM.findDOMNode(comp).querySelector('iframe');
                    expect(iframeElement.src).toContain(widgetUrl + '/multi');
                });

                it('should render the iframe with the mobile url', function() {
                    var copyOfClientSpecMap = _.clone(clientSpecMap);
                    copyOfClientSpecMap[13].widgets[widgetId].mobilePublished = true;
                    var comp = givenCompWith(copyOfClientSpecMap, publicModel, appDataMultiWidget, style, compId, true);
                    var iframeElement = ReactDOM.findDOMNode(comp).querySelector('iframe');
                    expect(iframeElement.src).toContain(widgetMobileUrl + '/multi');

                    var iframeSrc = comp.getBaseUrl();
                    var expectedUrl = widgetMobileUrl + '/multi';

                    expect(iframeSrc).toEqual(expectedUrl);
                });

                it('should add default page to widget section url', function() {
                    var copyOfClientSpecMap = _.clone(clientSpecMap);
                    var mockAppDataMultiWidget = {
                        applicationId: "13",
                        id: "cqhi",
                        widgetId: '1234',
                        type: "TPAWidget"
                    };

                    var comp = givenCompWith(copyOfClientSpecMap, publicModel, mockAppDataMultiWidget, style, compId, true);

                    var iframeSrc = comp.getBaseUrl();
                    var expectedUrl = widgetUrl + '/Wix';

                    expect(iframeSrc).toEqual(expectedUrl);
                });
            });
        });

        describe('deep linking', function(){
            var mockAppData = {
                applicationId: "14",
                id: "ccci",
                type: "TPA"
            };

            xit('should set iframe url path according to site page url state', function(){
                var comp = givenCompWith(clientSpecMap, publicModel, mockAppData, style, compId, false, 'site');
                var sectionSrc = ReactDOM.findDOMNode(comp).firstChild.src;

                var nextProps = getProps(clientSpecMap, publicModel, appData, style, compId, false, 'site', 'newState');
                comp.componentWillReceiveProps(nextProps);

                var expectedUrl = sectionSrc.slice(0, sectionSrc.indexOf('?')) + '/newState' + sectionSrc.slice(sectionSrc.indexOf('?'));
                expect(ReactDOM.findDOMNode(comp).firstChild.src).toBe(expectedUrl);
            });

            describe('ajax rendering = client side rendering', function(){

                it('should not reload iframe after calling push state', function(){
                    var comp = givenCompWith(clientSpecMap, publicModel, mockAppData, style, compId, false, 'site', 'initialState');

                    var srcBeforePushState = ReactDOM.findDOMNode(comp).firstChild.src;
                    comp.setState({
                        pushState: "newState"
                    });
                    expect(ReactDOM.findDOMNode(comp).firstChild.src).toBe(srcBeforePushState);
                });

                it('should ', function(){
                    var comp = givenCompWith(clientSpecMap, publicModel, mockAppData, style, compId, false, 'site', 'initialState');

                    var srcBeforePushState = ReactDOM.findDOMNode(comp).firstChild.src;
                    comp.setState({
                        pushState: "newState"
                    });

                    var nextProps = getProps(clientSpecMap, publicModel, appData, style, compId, false, 'site', 'initialState');
                    comp.componentWillReceiveProps(nextProps);
                    expect(ReactDOM.findDOMNode(comp).firstChild.src).toBe(srcBeforePushState);
                });

            });

        });
    });
});
