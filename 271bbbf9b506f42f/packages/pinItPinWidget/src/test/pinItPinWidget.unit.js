define(['lodash', 'testUtils', 'utils', 'pinItPinWidget'], function (_, /** testUtils */ testUtils, utils, pinItPinWidget) {
    'use strict';

    describe('PinItPinWidget tests', function () {

        var DEFAULT_PROPS = {
            id: 'PinItPinWidgetId',
            santaBase: 'http://santaBase.com',
            structure: {
                componentType: 'wysiwyg.common.components.pinitpinwidget.viewer.PinItPinWidget'
            }
        };

        var DEFAULT_DATA = {
            pinId: 'pinId'
        };

        var DEFAULT_SIZES = {
            height: 274, width: 225
        };

        function createPinItPinWidgetComponent(partialProps, targetNode) {
            var props = testUtils.santaTypesBuilder.getComponentProps(pinItPinWidget, _.merge({
                compData: _.clone(DEFAULT_DATA),
                compProp: _.clone(DEFAULT_PROPS),
                skin: 'wysiwyg.common.components.pinitpinwidget.viewer.skins.PinItPinWidgetSkin'
            }, partialProps));

            return testUtils.componentBuilder('wysiwyg.common.components.pinitpinwidget.viewer.PinItPinWidget', props, targetNode);
        }

        describe('component dimensions', function () {

            var compStyle = {top: 100, left: 200, height: 300, width: 400, position: 'absolute'};

            describe('component NOT in error mode', function () {

                it('should set the iFrame height and width to 100%', function () {
                    var comp = createPinItPinWidgetComponent();
                    var skinProperties = comp.getSkinProperties();

                    expect(skinProperties.iframe.style.width).toEqual('100%');
                    expect(skinProperties.iframe.style.height).toEqual('100%');
                });

                describe('component has iFrame dimensions', function () {

                    it('should have height and width according to component style AND iFrame dimensions', function () {
                        var partialProps = {style: compStyle, iframeDimensions: {width: 100, height: 200}};

                        var comp = createPinItPinWidgetComponent(partialProps);
                        var skinProperties = comp.getSkinProperties();

                        expect(skinProperties[''].style).toEqual({
                            width: 100,
                            height: 200
                        });
                    });

                });

                describe('component has NO iFrame dimensions', function () {

                    it('should have height and width according to component style', function () {
                        var partialProps = {style: compStyle};

                        var comp = createPinItPinWidgetComponent(partialProps);
                        var skinProperties = comp.getSkinProperties();

                        expect(skinProperties[''].style).toEqual({
                            width: 400,
                            height: 300
                        });
                    });

                });

            });

            describe('component in error mode', function () {

                it('should set the component size to default', function () {
                    var partialProps = {style: compStyle, shouldPresentErrorMessage: 'error'};

                    var comp = createPinItPinWidgetComponent(partialProps);
                    var skinProperties = comp.getSkinProperties(partialProps);

                    expect(skinProperties[''].style.width).toEqual(DEFAULT_SIZES.width);
                    expect(skinProperties[''].style.height).toEqual(DEFAULT_SIZES.height);
                });

                it('should set the iframe size to 0%', function () {
                    var partialProps = {style: compStyle, shouldPresentErrorMessage: 'error'};

                    var comp = createPinItPinWidgetComponent(partialProps);
                    var skinProperties = comp.getSkinProperties(partialProps);

                    expect(skinProperties.iframe.style.width).toEqual('0%');
                    expect(skinProperties.iframe.style.height).toEqual('0%');
                });

            });

        });

        describe('iframe src', function () {

            it('should point to pinterestWidget.html', function () {
                var partialProps = {
                    id: 'PinItPinWidgetId',
                    santaBase: 'http://santaBase.com',
                    compData: {
                        pinId: 'pinId'
                    }
                };

                var comp = createPinItPinWidgetComponent(partialProps);
                var skinProperties = comp.getSkinProperties();

                expect(_.startsWith(skinProperties.iframe.src, 'http://santaBase.com/static/external/pinterestWidget.html')).toBe(true);
            });

            it('should pass the compId as a query param', function () {
                var partialProps = {
                    id: 'PinItPinWidgetId1',
                    santaBase: 'http://santaBase.com',
                    compData: {pinId: 'pinId1'}
                };

                var comp = createPinItPinWidgetComponent(partialProps);
                var skinProperties = comp.getSkinProperties();

                var parsedUrl = utils.urlUtils.parseUrl(skinProperties.iframe.src);
                expect(parsedUrl.query.compId).toEqual('PinItPinWidgetId1');
            });

            it('should pass the pinUrl as a query param', function () {
                var partialProps = {
                    id: 'PinItPinWidgetId1',
                    santaBase: 'http://santaBase.com',
                    compData: {pinId: 'pinId1'}
                };

                var comp = createPinItPinWidgetComponent(partialProps);
                var skinProperties = comp.getSkinProperties();

                var parsedUrl = utils.urlUtils.parseUrl(skinProperties.iframe.src);
                expect(parsedUrl.query.pinUrl).toEqual('pinId1');
            });

        });

        describe('component $shouldShowError css state', function () {

            describe('when in error mode', function () {

                it('should be "error"', function () {
                    var comp = createPinItPinWidgetComponent({shouldPresentErrorMessage: 'error'});

                    expect(comp.state.$shouldShowError).toEqual('error');
                });

            });

            describe('when NOT in error mode', function () {

                it('should be noError"', function () {
                    var comp = createPinItPinWidgetComponent();

                    expect(comp.state.$shouldShowError).toEqual('noError');
                });

            });

            describe('when switching from error mode to NO error mode', function () {

                it('should change the css state to "noError"', function () {
                    var targetNode = window.document.createElement('div');
                    var errorProps = {shouldPresentErrorMessage: 'error'};
                    createPinItPinWidgetComponent(errorProps, targetNode);

                    var noErrorProps = {shouldPresentErrorMessage: 'noError'};
                    var comp = createPinItPinWidgetComponent(noErrorProps, targetNode);

                    expect(comp.state.$shouldShowError).toEqual('noError');
                });

            });

            describe('when switching from NO error mode to error mode', function () {

                it('should change the css state to "noError"', function () {
                    var targetNode = window.document.createElement('div');
                    var noErrorProps = {shouldPresentErrorMessage: 'noError'};
                    createPinItPinWidgetComponent(noErrorProps, targetNode);

                    var errorProps = {shouldPresentErrorMessage: 'error'};
                    var comp = createPinItPinWidgetComponent(errorProps, targetNode);

                    expect(comp.state.$shouldShowError).toEqual('error');
                });

            });

        });

    });

});
