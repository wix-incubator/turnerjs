define(['lodash', 'zepto', 'testUtils', 'tpa/components/tpaModal'], function (_, $, testUtils, tpaModal) {
    'use strict';

    var mock = testUtils.mockFactory;
    var mockTpaModalAspect;
    var compId = 'compId';
    var instance = "8zODU5OCIsImRlbW9Nb2RlIjpmYWxzZX0";
    var appData = {
        applicationId: 1,
        url: 'http://hx0r.com',
        windowSize: {
            height: 1000,
            width: 1000
        }
    };
    var rendererModel = {
        clientSpecMap: {
            1: {
                "type": "editor",
                "applicationId": 1,
                "appDefinitionId": "12c24951-bdcf-7df7-2a68-eab0902635fe",
                "appDefinitionName": "Store",
                "instance": instance,
                "sectionPublished": true,
                "sectionMobilePublished": true,
                "sectionSeoEnabled": true,
                "sectionDefaultPage": "",
                "sectionRefreshOnWidthChange": true,
                "instanceId": "13829c30-42ca-a53a-e4a6-4a99d603b6d8",
                "settingsUrl": "http://shopify-wix.herokuapp.com/admin/settings/dashboard",
                "settingsCompanyName": "Shopify",
                "settingsWidth": 600,
                "settingsHeight": 900
            }
        },
        siteInfo: {}
    };
    var getComponent = function (props) {
        return testUtils.getComponentFromDefinition(tpaModal, props);
    };
    var givenCompWith = function (data, style, id, callback, isMobileView) {
        var isMobileViewSpy = jasmine.createSpy().and.returnValue(isMobileView !== undefined);
        var compProps = mock.mockProps()
            .setSkin("wysiwyg.viewer.skins.TPAModalSkin")
            .addSiteData(rendererModel, 'rendererModel')
            .addSiteData(isMobileViewSpy, 'isMobileView');

        compProps.style = style;
        compProps.id = id;
        compProps.compData = data;
        compProps.onCloseCallback = callback;
        compProps.siteAPI.registerMockSiteAspect('tpaModalAspect', mockTpaModalAspect);
        compProps.siteAPI.enterFullScreenMode = jasmine.createSpy("enterFullScreenMode");
        compProps.siteAPI.exitFullScreenMode = jasmine.createSpy("exitFullScreenMode");
        compProps.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAModal';
        return getComponent(compProps);
    };

    describe('tpaModal component dom', function () {
        beforeEach(function () {
            mockTpaModalAspect = {
                removeModal: jasmine.createSpy('removeModal')
            };
        });

        it('should show modal by default', function () {
            var comp = givenCompWith(appData, {}, compId);
            var refData = comp.getSkinProperties();

            expect(refData[""]).toBeDefined();
            expect(refData[""].style.display).toBe('block');
        });

        it('should contain initial state properties', function () {
            var comp = givenCompWith(appData, {}, compId);
            var state = comp.getInitialState();

            expect(state.showComponent).toBe(true);
            expect(state.registeredEvents.length).toBe(0);
            expect(state.$displayDevice).toBe('desktop');
            expect(state.windowSize).toBe(appData.windowSize);
        });

        it('should hide modal if showComponent state is false', function (done) {
            var comp = givenCompWith(appData, {}, compId);
            comp.setState({showComponent: false}, function(){
                var refData = comp.getSkinProperties();
                expect(refData[""]).toBeDefined();
                expect(refData[""].style.display).toBe('none');
                done();
            });
        });

        it('should set custom style and attributes', function () {
            var comp = givenCompWith(appData, {}, compId);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData.blockingLayer).toBeDefined();
            expect(refData.dialog).toBeDefined();
            expect(refData.xButton).toBeDefined();
            expect(refData.iframe).toBeDefined();
        });

        it('should set the blockingLayer', function () {
            var comp = givenCompWith(appData, {}, compId);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData.blockingLayer).toBeDefined();
        });

        it('should set the dialog style according to props', function () {
            var compData = {
                width: 400,
                height: 387
            };
            var comp = givenCompWith(_.assign(appData, compData), {}, compId);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData.dialog).toBeDefined();
            expect(refData.dialog.style.width).toBe(400);
            expect(refData.dialog.style.height).toBe(387);
            expect(refData.dialog.style.marginTop).toBe(-compData.height / 2);
            expect(refData.dialog.style.marginLeft).toBe(-compData.width / 2);
        });

        it('should set the dialog style to max width of screen size', function () {
            var compData = {
                width: 400,
                height: 400,
                windowSize: {
                    height: 500,
                    width: 200
                }
            };
            var comp = givenCompWith(_.assign(appData, compData), {}, compId);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData.dialog).toBeDefined();
            expect(refData.dialog.style.width).toBe(200);
            expect(refData.dialog.style.height).toBe(400);
            expect(refData.dialog.style.marginTop).toBe(-200);
            expect(refData.dialog.style.marginLeft).toBe(-100);
        });

        it('should set the dialog style to max height of screen size', function () {
            var compData = {
                width: 400,
                height: 387,
                windowSize: {
                    height: 200,
                    width: 500
                }
            };
            var comp = givenCompWith(_.assign(appData, compData), {}, compId);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData.dialog).toBeDefined();
            expect(refData.dialog.style.width).toBe(400);
            expect(refData.dialog.style.height).toBe(200);
            expect(refData.dialog.style.marginTop).toBe(-100);
            expect(refData.dialog.style.marginLeft).toBe(-200);
        });

        it('should set the dialog style to max of screen size minus security margins only in case of non wix app', function () {
            var compData = {
                width: 400,
                height: 387,
                windowSize: {
                    height: 200,
                    width: 200
                }
            };
            var comp = givenCompWith(_.assign(appData, compData), {}, compId);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData.dialog).toBeDefined();
            expect(refData.dialog.style.width).toBe(150);
            expect(refData.dialog.style.height).toBe(150);
            expect(refData.dialog.style.marginTop).toBe(-75);
            expect(refData.dialog.style.marginLeft).toBe(-75);
        });

        it('should set the dialog style to max of screen size  in case of wix app', function () {
            var compData = {
                width: 400,
                height: 387,
                windowSize: {
                    height: 200,
                    width: 200
                }
            };
            rendererModel.clientSpecMap[1].isWixTPA = true;
            var comp = givenCompWith(_.assign(appData, compData), {}, compId);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData.dialog).toBeDefined();
            expect(refData.dialog.style.width).toBe(200);
            expect(refData.dialog.style.height).toBe(200);
            expect(refData.dialog.style.marginTop).toBe(-100);
            expect(refData.dialog.style.marginLeft).toBe(-100);
        });

        it('should set the dialog height and width per state if has one', function (done) {
            var compData = {
                width: 400,
                height: 387
            };
            var comp = givenCompWith(_.assign(appData, compData), {}, compId);

            comp.setState({
                width: 100,
                height: 98
            }, function() {
                var refData = comp.getSkinProperties();

                expect(refData.dialog.style.width).toBe(100);
                expect(refData.dialog.style.height).toBe(98);
                expect(refData.dialog.style.marginTop).toBe(-49);
                expect(refData.dialog.style.marginLeft).toBe(-50);
                done();
            });

        });

        it('should set the dialog height and width per state for 0,0', function (done) {
            var compData = {
                width: 400, height: 387
            };
            var comp = givenCompWith(_.assign(appData, compData), {}, compId);

            comp.setState({
                width: 0,
                height: 0
            }, function(){
                var refData = comp.getSkinProperties();

                expect(refData.dialog.style.width).toBe(0);
                expect(refData.dialog.style.height).toBe(0);
                expect(refData.dialog.style.marginTop).toBe(0);
                expect(refData.dialog.style.marginLeft).toBe(0);
                done();
            });
        });

        it('should set empty dialog style in mobile view', function () {
            var compData = {
                width: 400,
                height: 387
            };

            var comp = givenCompWith(_.assign(appData, compData), {}, compId, function() {}, true);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData.dialog.style).toEqual({});
        });

        it('should set xButton content', function () {
            var comp = givenCompWith(appData, {}, compId);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData.xButton).toBeDefined();
            expect(refData.xButton.children).toBe('×');
        });

        it('should handle xButton click', function (done) {
            var comp = givenCompWith(appData, {}, compId);

            expect(comp.state.showComponent).toBe(true);

            comp.hide({}, function() {
                expect(comp.state.showComponent).toBe(false);
                expect(mockTpaModalAspect.removeModal).toHaveBeenCalled();
                done();
            });
        });

        it('should handle xButton click in mobile view', function (done) {
            var comp = givenCompWith(appData, {}, compId);

            expect(comp.state.showComponent).toBe(true);

            comp.setState({$displayDevice: 'mobile'}, function() {
                comp.hide({}, function() {
                    expect(comp.state.showComponent).toBe(false);
                    expect(comp.props.siteAPI.exitFullScreenMode).toHaveBeenCalled();
                    expect(mockTpaModalAspect.removeModal).toHaveBeenCalled();
                    done();
                });
            });
        });

        it('should bind blockingLayer click', function () {
            var comp = givenCompWith(appData, {}, compId);
            expect(comp.state.showComponent).toBe(true);

            var refData = comp.getSkinProperties();
            expect(refData.blockingLayer.onClick).toBeDefined();

            refData.blockingLayer.onClick(function() {
                expect(comp.state.showComponent).toBe(false);
            });
        });

        it('should handle bare mode', function () {
            var compData = {
                theme: 'BARE'
            };
            var comp = givenCompWith(_.assign(compData, appData), {}, compId);
            var frameWrapStyle = comp.getSkinProperties().frameWrap.style;
            var xButtonStyle = comp.getSkinProperties().xButton.style;

            expect(frameWrapStyle.background).toBe('transparent');
            expect(frameWrapStyle.border).toBe('none');
            expect(xButtonStyle.display).toBe('none');
        });


        it('should handle LIGHT_BOX mode', function () {
            var compData = {
                theme: 'LIGHT_BOX'
            };
            var comp = givenCompWith(_.assign(compData, appData), {}, compId);
            var frameWrapStyle = comp.getSkinProperties().frameWrap.style;
            var xButtonStyle = comp.getSkinProperties().xButton.style;

            expect(comp.props.siteAPI.enterFullScreenMode).not.toHaveBeenCalled();
            expect(frameWrapStyle.background).toBe('transparent');
            expect(frameWrapStyle.border).toBe('none');
            expect(xButtonStyle.display).toBe('none');
        });


        it('should set the iframe style', function () {
            var comp = givenCompWith(appData, {}, compId);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData.iframe).toBeDefined();
        });

        it('should call component callback when modal is closed and data has message', function () {
            var callbackFn = jasmine.createSpy('callback');
            var comp = givenCompWith(appData, {}, compId, callbackFn);
            var data = {
                message: {
                    foo: "my-data"
                }
            };
            comp.hide(data, function() {
                expect(comp.state.showComponent).toBe(false);
                expect(callbackFn).toHaveBeenCalledWith(data);
            });
        });

        it('should not call component callback when modal is closed and data is missing message obj', function () {
            var callbackFn = jasmine.createSpy('callback');
            var comp = givenCompWith(appData, {}, compId, callbackFn);
            var data = {};
            comp.hide(data, function(){
                expect(comp.state.showComponent).toBe(false);
                expect(callbackFn).toHaveBeenCalledWith(undefined);
            });
        });

        it('should recalculate width and height of the modal in case of resize window', function(done){
            var compData = {
                width: 200, height: 387
            };
            var comp = givenCompWith(_.assign(appData, compData), {}, compId);

            comp.setState({
                    windowSize: {
                        width: 300,
                        height: 50
                    }
                },
                function() {
                    var refData = comp.getSkinProperties();

                    expect(refData.dialog.style.width).toBe(200);
                    expect(refData.dialog.style.height).toBe(50);
                    expect(refData.dialog.style.marginTop).toBe(-25);
                    expect(refData.dialog.style.marginLeft).toBe(-100);
                    done();
                }
            );
        });

        it('should add touch scroll style in mobile mode', function () {
            var comp = givenCompWith(appData, {}, compId, function () {}, true);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData.frameWrap).toBeDefined();
            expect(refData.frameWrap.style.WebkitOverflowScrolling).toBe('touch');
            expect(refData.frameWrap.style.overflowY).toBe('scroll');
        });

        it('should add touch scroll style in desktop view', function () {
            var comp = givenCompWith(appData, {}, compId, function () {}, false);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData.frameWrap).toBeDefined();
            expect(refData.frameWrap.style).toBeDefined();
        });
    });
});
