define(['lodash', 'testUtils', 'wixappsBuilder'], function (_, /** testUtils */testUtils) {
    'use strict';

    var viewDef;

    function getProps(viewDefinition, proxyData) {
        return testUtils.proxyPropsBuilder(viewDefinition, proxyData || {});
    }

    describe('Field proxy', function () {
        beforeEach(function () {
            viewDef = {
                data: "this",
                "comp": {
                    "name": "Field",
                    items: [
                        {
                            "comp": {
                                "name": "VBox"
                            }
                        }
                    ]
                }
            };
        });

        describe('getItemLayout', function () {
            it('No props - default values', function () {
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var itemLayout = proxy.getItemLayout();

                var expected = {
                    minWidth: 100,
                    height: 100
                };

                expect(itemLayout).toEqual(expected);
            });
            it('Has min-width that is less than defined width - width wins', function () {
                viewDef.comp.layout = {'min-width': 50};
                viewDef.comp.width = 200;
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var itemLayout = proxy.getItemLayout();

                var expected = {
                    minWidth: 200,
                    height: 100
                };

                expect(itemLayout).toEqual(expected);
            });
            it('Has min-width that is greater than defined width - min-width wins', function () {
                viewDef.comp.layout = {'min-width': 50};
                viewDef.comp.width = 25;
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var itemLayout = proxy.getItemLayout();

                var expected = {
                    minWidth: 50,
                    height: 100
                };

                expect(itemLayout).toEqual(expected);
            });
            it('Has min-width that is less than default width - width wins', function () {
                viewDef.comp.layout = {'min-width': 50};
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var itemLayout = proxy.getItemLayout();

                var expected = {
                    minWidth: 100,
                    height: 100
                };

                expect(itemLayout).toEqual(expected);
            });
            it('Has min-width that is greater than default width - min-width wins', function () {
                viewDef.comp.layout = {'min-width': 150};
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var itemLayout = proxy.getItemLayout();

                var expected = {
                    minWidth: 150,
                    height: 100
                };

                expect(itemLayout).toEqual(expected);
            });
            it('Has height and height-mode which is not manual - auto', function () {
                viewDef.comp.height = 150;
                viewDef.comp.heightMode = 'yes';
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var itemLayout = proxy.getItemLayout();

                var expected = {
                    minWidth: 100,
                    height: 'auto'
                };

                expect(itemLayout).toEqual(expected);
            });
            it('Has height and height-mode which is manual - auto', function () {
                viewDef.comp.height = 150;
                viewDef.comp.heightMode = 'manual';
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var itemLayout = proxy.getItemLayout();

                var expected = {
                    minWidth: 100,
                    height: 150
                };

                expect(itemLayout).toEqual(expected);
            });
            it('Has height no heightMode - height', function () {
                viewDef.comp.height = 150;
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var itemLayout = proxy.getItemLayout();

                var expected = {
                    minWidth: 100,
                    height: 150
                };

                expect(itemLayout).toEqual(expected);
            });
        });

        describe('shouldHide', function () {
            it('data is empty string - true', function () {
                var data = "";
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeTruthy();
            });
            it('data is non-empty string - falsy', function () {
                var data = "1";
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeFalsy();
            });
            it('data type is not wix:Image or wix:Video - falsy', function () {
                var data = {_type: "safsd"};
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeFalsy();
            });
            it('data type is wix:Image and src is "http://images/noimage.png" - true', function () {
                var data = {_type: "wix:Image", src: "http://images/noimage.png"};
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeTruthy();
            });
            it('data type is wix:Image and src is "" - true', function () {
                var data = {_type: "wix:Image", src: ""};
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeTruthy();
            });
            it('data type is wix:Image and src is neither "http://images/noimage.png" nor "" - falsy', function () {
                var data = {_type: "wix:Image", src: "another"};
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeFalsy();
            });
            it('data type is wix:Video and video is default - true', function () {
                var data = {_type: "wix:Video", videoType: "YOUTUBE", videoId: "xLk7JoPDx4Q"};
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeTruthy();
            });
            it('data type is wix:Video and video has empty videoId - true', function () {
                var data = {_type: "wix:Video", videoType: "YOUTUBE", videoId: ""};
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeTruthy();

                data.videoType = 'VIMEO';
                shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeTruthy();
            });
            it('data type is wix:Video and video is neither default nor empty videoId- falsy', function () {
                var data = {_type: "wix:Video", videoType: "YOUTUBE", videoId: "@@@@@@"};
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeFalsy();
            });
            it('data is undefined (for example when viewDef points to an invalid field)', function () {
                var data; // undefined
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('Field', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeTruthy();
            });
        });
    });
});
