define(['lodash', 'testUtils', 'tpa/components/tpaPopup'], function (_, testUtils, tpaPopup) {
    'use strict';

    var mock = testUtils.mockFactory;

    var compId = 'compId';
    var instance = "8zODU5OCIsImRlbW9Nb2RlIjpmYWxzZX0";
    var compData = {
        applicationId: 1,
        url: 'http://hx0r.com',
        origCompStyle: {},
        windowSize: {},
        origCompId: 1,
        position: {}
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
        return testUtils.getComponentFromDefinition(tpaPopup, props);
    };

    var givenCompWith = function (data, style, id, callback, isMobileView) {
        var compProps = mock.mockProps()
            .setSkin("wysiwyg.viewer.skins.TPAPopupSkin")
            .addSiteData(isMobileView || function () {
                return false;
            }, 'isMobileView')
            .addSiteData(rendererModel, 'rendererModel');

        compProps.style = style;
        compProps.id = id;
        compProps.compData = data;
        compProps.onCloseCallback = callback;
        compProps.siteAPI.registerMockSiteAspect('tpaModalAspect', {
            getReactComponents: jasmine.createSpy().and.returnValue(null)
        });
        compProps.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAPopup';

        return getComponent(compProps);
    };

    describe('tpaPopup component', function () {
        it('should show popup by default', function () {
            compData.position = {
                origin: 'RELATIVE',
                placement: 'CENTER'
            };
            var comp = givenCompWith(compData, {}, compId);
            var refData = comp.getSkinProperties();
            expect(refData[""].style.display).toBe('block');
        });

        it('should hide popup if showComponent state is false', function () {
            var comp = givenCompWith(compData, {}, compId);
            comp.setState({showComponent: false}, function(){
                var refData = comp.getSkinProperties();

                expect(refData[""]).toBeDefined();
                expect(refData[""].style.display).toBe('none');
            });
        });

        it('should set custom style and attributes', function () {
            var comp = givenCompWith(compData, {}, compId);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData.closeButton).toBeDefined();
            expect(refData.iframe).toBeDefined();
            expect(refData.iframe.scrolling).toBe('no');
        });

        it('should handle xButton click', function () {

            var comp = givenCompWith(compData, {}, compId);

            comp.props.siteAPI.getSiteAspect = function() {
                return {removePopup: jasmine.createSpy('removePopup')};
            };
            expect(comp.state.showComponent).toBe(true);
            comp.hide({}, function(){
                expect(comp.state.showComponent).toBe(false);
            });
        });

        it('should set the iframe style', function () {
            var comp = givenCompWith(compData, {}, compId);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData.iframe).toBeDefined();
        });

        it('should set height and width per state if has one', function () {
            var data = {
                width: 400, height: 387
            };

            var comp = givenCompWith(_.assign(_.clone(compData), data), {}, compId);

            var refData = comp.getSkinProperties();

            expect(refData[""].style.width).toBe(400);
            expect(refData[""].style.height).toBe(387);

            comp.setState({
                width: 100,
                height: 98
            }, function(){
                refData = comp.getSkinProperties();

                expect(refData[""].style.width).toBe(100);
                expect(refData[""].style.height).toBe(98);
            });
        });

        it('should call component callback when popup is closed and data has message', function () {
            var callbackFn = jasmine.createSpy('callback');

            var comp = givenCompWith(compData, {}, compId, callbackFn);
            comp.props.siteAPI.getSiteAspect = function() {
                return {removePopup: jasmine.createSpy('removePopup')};
            };

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

        describe('tpaPopup positions fixed', function () {
            it('should position popup in middle of the screen', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'FIXED',
                    placement: 'CENTER'
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe(data.width + '');
                expect(style.height).toBe(data.height + '');
                expect(style.left).toBe('50%');
                expect(style.top).toBe('50%');
                expect( style.marginLeft ).toBe(-data.width / 2 + '');
                expect( style.marginTop ).toBe(-data.height / 2 + '');
            });

            it('should position popup in middle of the screen with percentage sizes', function () {
                var data = _.clone(compData);

                data.width = '100%';
                data.height = '70%';

                data.position = {
                    origin: 'FIXED',
                    placement: 'CENTER'
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.left).toBe('50%');
                expect(style.top).toBe(0);
                expect( style.marginLeft ).toBe('-50%');
                expect( style.marginTop ).toBe(0);
            });

            it('should position popup in middle of the screen if one of edges are smaller than 10', function () {
                var data = _.clone(compData);

                data.width = 9;
                data.height = 19;

                data.position = {
                    origin: 'FIXED',
                    placement: 'TOP_RIGHT'
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe(data.width + '');
                expect(style.height).toBe(data.height + '');
                expect(style.left).toBe('50%');
                expect(style.top).toBe('50%');
                expect(style.marginLeft).toBe(-data.width / 2 + '');
                expect(style.marginTop).toBe(-data.height / 2 + '');
            });

            it('should not be bigger then window size', function () {
                var data = _.clone(compData);

                data.width = 20000;
                data.height = 20000;

                data.position = {
                    origin: 'FIXED',
                    placement: 'TOP_LEFT'
                };
                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe( '10000' );
                expect(style.height).toBe( '10000' );
                expect(style.left).toBe('0px');
                expect(style.top).toBe('0px');
            });

            it('should not be bigger then window size using percentage size', function () {
                var data = _.clone(compData);

                data.width = '150%';
                data.height = '200%';

                data.position = {
                    origin: 'FIXED',
                    placement: 'TOP_LEFT'
                };
                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe( '100%' );
                expect(style.height).toBe( '100%' );
                expect(style.left).toBe('0px');
                expect(style.top).toBe('0px');
            });

            it('should position popup in middle of the screen', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'FIXED',
                    placement: 'CENTER'
                };
                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.marginLeft).toBe(-data.width / 2 + '');
                expect(style.marginTop).toBe(-data.height / 2 + '');
            });

            it('should calculate center based on the smaller size between given size and window size', function () {
                var data = _.clone(compData);

                data.width = 20000;
                data.height = 40000;

                data.position = {
                    origin: 'FIXED',
                    placement: 'CENTER'
                };
                data.windowSize = {
                    width: 10000,
                    height: 10000
                };
                data.origCompStyle = {
                    top: 0,
                    left: 0,
                    width: 800,
                    height: 800
                };
                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.width).toBe( '10000' );
                expect(style.height).toBe( '10000' );
                expect(style.marginLeft).toBe( '-5000' );
                expect(style.marginTop).toBe( '-5000' );
            });

            it('should calculate center based on the smaller size between percentage given size and 100%', function () {
                var data = _.clone(compData);

                data.width = '200%';
                data.height = '40000%';

                data.position = {
                    origin: 'FIXED',
                    placement: 'CENTER'
                };
                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.width).toBe( '100%' );
                expect(style.height).toBe( '100%' );
            });

            it('should position popup in top left of the screen', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'FIXED',
                    placement: 'TOP_LEFT'
                };
                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe(data.width + '');
                expect(style.height).toBe(data.height + '');
                expect(style.left).toBe('0px');
                expect(style.top).toBe('0px');
            });

            it('should position popup in top center of the screen', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'FIXED',
                    placement: 'TOP_CENTER'
                };
                data.windowSize = {
                    width: 10000,
                    height: 10000
                };
                data.origCompStyle = {
                    top: 0,
                    left: 0,
                    width: 800,
                    height: 800
                };
                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe(data.width + '');
                expect(style.height).toBe(data.height + '');
                expect(style.left).toBe('50%');
                expect(style.top).toBe('0px');
                expect(style.marginLeft).toBe(-data.width / 2 + '');
            });

            it('should position popup in top right of the screen', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'FIXED',
                    placement: 'TOP_RIGHT'
                };
                data.windowSize = {
                    width: 10000,
                    height: 10000
                };
                data.origCompStyle = {
                    top: 0,
                    left: 0,
                    width: 800,
                    height: 800
                };
                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe(data.width + '');
                expect(style.height).toBe(data.height + '');
                expect(style.right).toBe('0px');
                expect(style.top).toBe('0px');
            });

            it('should position popup in bottom left of the screen', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'FIXED',
                    placement: 'BOTTOM_LEFT'
                };
                data.windowSize = {
                    width: 10000,
                    height: 10000
                };
                data.origCompStyle = {
                    top: 0,
                    left: 0,
                    width: 800,
                    height: 800
                };
                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe(data.width + '');
                expect(style.height).toBe(data.height + '');
                expect(style.left).toBe('0px');
                expect(style.bottom).toBe('0px');
            });

            it('should position popup in bottom center of the screen', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'FIXED',
                    placement: 'BOTTOM_CENTER'
                };
                data.windowSize = {
                    width: 10000,
                    height: 10000
                };
                data.origCompStyle = {
                    top: 0,
                    left: 0,
                    width: 800,
                    height: 800
                };
                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe(data.width + '');
                expect(style.height).toBe(data.height + '');
                expect(style.marginLeft).toBe(-data.width / 2 + '');
                expect(style.left).toBe('50%');
                expect(style.bottom).toBe('0px');
            });

            it('should position popup in bottom right of the screen', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'FIXED',
                    placement: 'BOTTOM_RIGHT'
                };
                data.windowSize = {
                    width: 10000,
                    height: 10000
                };
                data.origCompStyle = {
                    top: 0,
                    left: 0,
                    width: 800,
                    height: 800
                };
                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe(data.width + '');
                expect(style.height).toBe(data.height + '');
                expect(style.right).toBe('0px');
                expect(style.bottom).toBe('0px');
            });

            it('should position popup in center left of the screen', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'FIXED',
                    placement: 'CENTER_LEFT'
                };
                data.windowSize = {
                    width: 10000,
                    height: 10000
                };
                data.origCompStyle = {
                    top: 0,
                    left: 0,
                    width: 800,
                    height: 800
                };
                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe(data.width + '');
                expect(style.height).toBe(data.height + '');
                expect(style.left).toBe('0px');
                expect(style.top).toBe('50%');
            });

            it('should position popup in center right of the screen', function () {
                var data = _.clone(compData);

                data.width = '200';
                data.height = '400';

                data.position = {
                    origin: 'FIXED',
                    placement: 'CENTER_RIGHT'
                };
                data.windowSize = {
                    width: 10000,
                    height: 10000
                };
                data.origCompStyle = {
                    top: 0,
                    left: 0,
                    width: 800,
                    height: 800
                };
                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.right).toBe('0px');
                expect(style.top).toBe('50%');
            });
        });

        describe('tpaPopup positions default', function() {
            it('should position popup in top left of the screen', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'FIXED',
                    placement: 'TOP_LEFT'
                };
                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe(data.width + '');
                expect(style.height).toBe(data.height + '');
                expect(style.left).toBe('0px');
                expect(style.top).toBe('0px');
            });

            it('should position popup in top center of the screen', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'DEFAULT',
                    placement: 'TOP_CENTER'
                };
                data.windowSize = {
                    width: 10000,
                    height: 10000
                };
                data.origCompStyle = {
                    top: 0,
                    left: 0,
                    width: 800,
                    height: 800
                };
                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe(data.width + '');
                expect(style.height).toBe(data.height + '');
                expect(style.left).toBe('50%');
                expect(style.top).toBe('0px');
                expect(style.marginLeft).toBe(-data.width / 2 + '');
            });
        });

        describe('tpaPopup positions relative', function () {
            it('should position a small popup in middle of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'RELATIVE',
                    placement: 'CENTER'
                };

                data.origCompStyle = {
                    top: 1,
                    left: 2,
                    width: 800,
                    height: 800
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.top).toBe(1 + 800 / 2 - 400 / 2);
                expect(style.left).toBe(2 + 800 / 2 - 200 / 2);
            });

            it('should position popup in middle of the screen if one of edges are smaller than 10', function () {
                var data = _.clone(compData);

                data.width = 9;
                data.height = 19;

                data.position = {
                    origin: 'RELATIVE',
                    placement: 'TOP_RIGHT'
                };

                data.origCompStyle = {
                    top: 1,
                    left: 2,
                    width: 100,
                    height: 100
                };

                data.windowSize = {
                    width: 1000,
                    height: 1000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe(data.width + '');
                expect(style.height).toBe(data.height + '');
                expect(style.left).toBe('50%');
                expect(style.top).toBe('50%');
                expect(style.marginLeft).toBe(-data.width / 2 + '');
                expect(style.marginTop).toBe(-data.height / 2 + '');
            });


            it('should position a large popup in middle of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 1200;
                data.height = 1400;

                data.position = {
                    origin: 'RELATIVE',
                    placement: 'CENTER'
                };

                data.origCompStyle = {
                    top: 1,
                    left: 2,
                    width: 100,
                    height: 100
                };

                data.windowSize = {
                    width: 1000,
                    height: 1000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(1000);
                expect(style.height).toBe(1000);
                expect(style.top).toBe(0);
                expect(style.left).toBe(0);
            });

            it('should position a small popup in top left corner of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'RELATIVE',
                    placement: 'TOP_LEFT'
                };

                data.origCompStyle = {
                    top: 500,
                    left: 500,
                    width: 800,
                    height: 800
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.top).toBe(100);
                expect(style.left).toBe(300);
            });

            it('should position a small popup in top right corner of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'RELATIVE',
                    placement: 'TOP_RIGHT'
                };

                data.origCompStyle = {
                    top: 500,
                    left: 500,
                    width: 800,
                    height: 800
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.top).toBe(100);
                expect(style.left).toBe(data.origCompStyle.width + data.origCompStyle.left);
            });

            it('should position a small popup in top center of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'RELATIVE',
                    placement: 'TOP_CENTER'
                };

                data.origCompStyle = {
                    top: 500,
                    left: 500,
                    width: 800,
                    height: 800
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.top).toBe(100);
                expect(style.left).toBe(data.origCompStyle.width);
            });

            it('should position a small popup in center right of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'RELATIVE',
                    placement: 'CENTER_RIGHT'
                };

                data.origCompStyle = {
                    top: 500,
                    left: 500,
                    width: 800,
                    height: 800
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.top).toBe(700);
                expect(style.left).toBe(data.origCompStyle.width + data.origCompStyle.left);
            });

            it('should position a small popup in center left of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'RELATIVE',
                    placement: 'CENTER_LEFT'
                };

                data.origCompStyle = {
                    top: 500,
                    left: 500,
                    width: 800,
                    height: 800
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.top).toBe(700);
                expect(style.left).toBe(data.origCompStyle.left - data.width);
            });

            it('should position a small popup in bottom left of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'RELATIVE',
                    placement: 'BOTTOM_LEFT'
                };

                data.origCompStyle = {
                    top: 500,
                    left: 500,
                    width: 800,
                    height: 800
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.top).toBe(data.origCompStyle.top + data.origCompStyle.height);
                expect(style.left).toBe(data.origCompStyle.left - data.width);
            });

            it('should position a small popup in bottom right of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'RELATIVE',
                    placement: 'BOTTOM_RIGHT'
                };

                data.origCompStyle = {
                    top: 500,
                    left: 500,
                    width: 800,
                    height: 800
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.top).toBe(data.origCompStyle.top + data.origCompStyle.height);
                expect(style.left).toBe(data.origCompStyle.left + data.origCompStyle.width);
            });

            it('should position a small popup in bottom center of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'RELATIVE',
                    placement: 'BOTTOM_CENTER'
                };

                data.origCompStyle = {
                    top: 500,
                    left: 500,
                    width: 800,
                    height: 800
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.top).toBe(data.origCompStyle.top + data.origCompStyle.height);
                expect(style.left).toBe(data.origCompStyle.width);
            });
        });

        describe('tpaPopup position absolute', function () {
            it('should position popup in the center of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'ABSOLUTE',
                    placement: 'CENTER'
                };

                data.origCompStyle = {
                    top: 200,
                    left: 200,
                    width: 800,
                    height: 800
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.top).toBe(0);
                expect(style.left).toBe(100);
            });

            it('should position popup in the top left of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'ABSOLUTE',
                    placement: 'TOP_LEFT'
                };

                data.origCompStyle = {
                    top: 100,
                    left: 200,
                    width: 800,
                    height: 800,
                    actualTop: 200,
                    actualLeft: 200
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.origCompStyle.actualTop);
                expect(style.top).toBe(0);
                expect(style.left).toBe(0);
            });

            it('should position popup in the top right of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'ABSOLUTE',
                    placement: 'TOP_RIGHT'
                };

                data.origCompStyle = {
                    top: 100,
                    left: 200,
                    width: 800,
                    height: 800,
                    actualTop: 200,
                    actualLeft: 200
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.origCompStyle.actualTop);
                expect(style.top).toBe(0);
                expect(style.left).toBe(200);
            });

            it('should position popup in middle of the screen if one of edges are smaller than 10', function () {
                var data = _.clone(compData);

                data.width = 9;
                data.height = 19;

                data.position = {
                    origin: 'ABSOLUTE',
                    placement: 'TOP_RIGHT'
                };

                data.origCompStyle = {
                    top: 200,
                    left: 200,
                    width: 800,
                    height: 800,
                    actualTop: 200,
                    actualLeft: 200
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('fixed');
                expect(style.width).toBe(data.width + '');
                expect(style.height).toBe(data.height + '');
                expect(style.left).toBe('50%');
                expect(style.top).toBe('50%');
                expect(style.marginLeft).toBe(-data.width / 2 + '');
                expect(style.marginTop).toBe(-data.height / 2 + '');
            });

            it('should position popup in the top center of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'ABSOLUTE',
                    placement: 'TOP_CENTER'
                };

                data.origCompStyle = {
                    top: 200,
                    left: 200,
                    width: 800,
                    height: 800,
                    actualTop: 200,
                    actualLeft: 200
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.origCompStyle.actualTop);
                expect(style.top).toBe(0);
                expect(style.left).toBe(100);
            });

            it('should position popup in the center right of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'ABSOLUTE',
                    placement: 'CENTER_RIGHT'
                };

                data.origCompStyle = {
                    top: 200,
                    left: 200,
                    width: 800,
                    height: 800,
                    actualLeft: 200,
                    actualTop: 200
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.top).toBe(0);
                expect(style.left).toBe(data.origCompStyle.left);
            });

            it('should position popup in the center left of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'ABSOLUTE',
                    placement: 'CENTER_LEFT'
                };

                data.origCompStyle = {
                    top: 200,
                    left: 200,
                    width: 800,
                    height: 800
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.top).toBe(0);
                expect(style.left).toBe(data.origCompStyle.left - data.width);
            });

            it('should position popup in the bottom left of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'ABSOLUTE',
                    placement: 'BOTTOM_LEFT'
                };

                data.origCompStyle = {
                    top: 200,
                    left: 200,
                    width: 800,
                    height: 800
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.top).toBe(200);
                expect(style.left).toBe(data.origCompStyle.left - data.width);
            });

            it('should position popup in the bottom right of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'ABSOLUTE',
                    placement: 'BOTTOM_RIGHT'
                };

                data.origCompStyle = {
                    top: 200,
                    left: 200,
                    width: 800,
                    height: 800
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.top).toBe(200);
                expect(style.left).toBe(data.origCompStyle.left);
            });

            it('should position popup in the bottom center of the orig comp', function () {
                var data = _.clone(compData);

                data.width = 200;
                data.height = 400;

                data.position = {
                    origin: 'ABSOLUTE',
                    placement: 'BOTTOM_CENTER'
                };

                data.origCompStyle = {
                    top: 200,
                    left: 200,
                    width: 800,
                    height: 800
                };

                data.windowSize = {
                    width: 10000,
                    height: 10000
                };

                var comp = givenCompWith(data, {}, compId);
                var refData = comp.getSkinProperties();
                var style = refData[""].style;

                expect(style.display).toBe('block');
                expect(style.position).toBe('absolute');
                expect(style.width).toBe(data.width);
                expect(style.height).toBe(data.height);
                expect(style.top).toBe(200);
                expect(style.left).toBe(data.origCompStyle.left - data.width / 2);
            });

        });

        describe('resizeWindow', function() {
            var comp;
            beforeEach(function() {
                var data = {
                    width: 400, height: 387
                };

                comp = givenCompWith(_.assign(_.clone(compData), data), {}, compId);

                spyOn(comp, 'registerReLayout').and.callThrough();
            });

            it('should change the state according to the width and height specified in the message', function(done) {
                comp.resizeWindow(100, 200, function () {
                    var refData = comp.getSkinProperties();
                    var style = refData[""].style;
                    expect(style.width).toBe(100);
                    expect(style.height).toBe(200);
                    expect(comp.state.width).toBe(100);
                    expect(comp.state.height).toBe(200);
                    done();
                });
            });

            it('should change the state when width and height are 0', function(done) {
                comp.resizeWindow(0, 0, function () {
                    var refData = comp.getSkinProperties();
                    var style = refData[""].style;
                    expect(style.width).toBe(0 + '');
                    expect(style.height).toBe(0 + '');
                    done();
                });
            });

            it('should call the specified callback if specified', function(done) {
                comp.resizeWindow(100, 200, done);
            });
        });

        describe('tpaPopup z-index value', function () {
            var comp;

            beforeEach(function () {
                comp = givenCompWith(compData, {}, compId);
            });

            it('should have normal z-index if modal is NOT opened', function () {
                var style = comp.getSelfStyle();

                expect(style.zIndex).toBeFalsy();
            });

            it('should have higher z-index if modal is opened', function () {
                comp.props.siteAPI.getSiteAspect = function() {
                    return {
                        getReactComponents: jasmine.createSpy().and.returnValue([{id: 'modal'}])
                    };
                };
                var style = comp.getSelfStyle();

                expect(style.zIndex).toEqual(1001);
            });
        });
    });
});
