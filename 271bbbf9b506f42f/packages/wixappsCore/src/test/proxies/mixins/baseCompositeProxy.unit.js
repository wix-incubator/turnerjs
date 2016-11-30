define(['react',
        'lodash',
        'testUtils',
        'wixappsCore/core/proxyFactory',
        'wixappsCore/proxies/mixins/baseCompositeProxy'
    ],
    function (React,
              _,
              /** testUtils */testUtils,
              /** wixappsCore.proxyFactory */proxyFactory,
              /** proxies.mixins.baseComposite */baseCompositeProxy
    ) {
        'use strict';

        describe('Box Composite Proxy', function () {

            function mockSpacerViewDef(type, size) {
                return {
                    comp: {
                        name: type,
                        size: size
                    }
                };
            }

            var mockProxy;
            beforeEach(function() {
                proxyFactory.register('MockProxy', {
                    mixins: [baseCompositeProxy],
                    renderProxy: function() {
                        return null;
                    }
                });
                var props = testUtils.proxyPropsBuilder({});
                mockProxy = testUtils.proxyBuilder('MockProxy', props);
            });

            afterEach(function () {
                proxyFactory.invalidate('MockProxy');
            });

            describe('spacer rendering', function() {

                it('should render HSpacer as a React.DOM.div element with correct width', function() {
                    var spacerSize = 10;
                    var spacerViewDef = mockSpacerViewDef("HSpacer", spacerSize);
                    var renderedElement = mockProxy.renderChildProxy(spacerViewDef);
                    expect(React.addons.TestUtils.isElementOfType(renderedElement, 'div')).toBeTruthy();
                    expect(renderedElement.props.style.width).toEqual(10);
                    expect(renderedElement.props.style.minHeight).toBeUndefined();
                    expect(renderedElement.props.style.flex).toBeUndefined();
                });

                it('should render VSpacer as a React.DOM.div element with correct height', function() {
                    var spacerSize = 10;
                    var spacerViewDef = mockSpacerViewDef("VSpacer", spacerSize);
                    var renderedElement = mockProxy.renderChildProxy(spacerViewDef);
                    expect(React.addons.TestUtils.isElementOfType(renderedElement, 'div')).toBeTruthy();
                    expect(renderedElement.props.style.minHeight).toEqual(10);
                    expect(renderedElement.props.style.width).toBeUndefined();
                    expect(renderedElement.props.style.flex).toBeUndefined();
                });

                it('should render size "*" spacer with flex 1', function() {
                    var spacerSize = "*";
                    var spacerViewDef = mockSpacerViewDef("VSpacer", spacerSize);
                    var renderedElement = mockProxy.renderChildProxy(spacerViewDef);
                    expect(React.addons.TestUtils.isElementOfType(renderedElement, 'div')).toBeTruthy();
                    expect(renderedElement.props.style.flex).toEqual(1);
                    expect(renderedElement.props.style.minHeight).toBeUndefined();
                    expect(renderedElement.props.style.width).toBeUndefined();
                });

                it('should render a hidden spacer with display none', function() {
                    var spacerSize = 10;
                    var spacerViewDef = mockSpacerViewDef("HSpacer", spacerSize);
                    spacerViewDef.comp.hidden = true;
                    var renderedElement = mockProxy.renderChildProxy(spacerViewDef);
                    expect(renderedElement ? renderedElement.props.style.display : 'none').toEqual("none");
                });

                it('should render an element with an ID', function() {
                    var spacerSize = 10;
                    var spacerViewDef = mockSpacerViewDef("HSpacer", spacerSize);
                    var renderedElement = mockProxy.renderChildProxy(spacerViewDef);
                    expect(renderedElement.props.id).toBeDefined();
                    expect(renderedElement.props.id.length).toBeGreaterThan(0);
                });

            });


        });
    });
