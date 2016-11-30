define(['lodash', 'testUtils', 'fonts', 'wixappsBuilder'], function (_, /** testUtils */testUtils, /** fonts */fonts) {
    'use strict';

    var viewDef;
    var proxyData;

    function getProps(viewDefinition, orientation) {
        var props = testUtils.proxyPropsBuilder(viewDefinition, proxyData);
        props.orientation = orientation || 'vertical';
        return props;
    }

    describe('TextField proxy', function () {
        beforeEach(function () {
            proxyData = {};
            viewDef = {
                "data": "this",
                "comp": {
                    "name": "TextField",
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

        describe('shouldHide', function () {
            it('data type is not wix:RichText or string - falsy', function () {
                var data = {_type: "safsd"};
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('TextField', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeFalsy();
            });
            it('data is string and data is not empty - falsy', function () {
                var data = "A";
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('TextField', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeFalsy();
            });
            it('data is string and data is empty - true', function () {
                var data = "";
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('TextField', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeTruthy();
            });
            it('data is string and data is empty and min-lines is greater than zero  - false', function () {
                viewDef.comp['min-lines'] = 1;
                var data = "";
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('TextField', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeFalsy();
            });
            it('data is of type wix:RichText and data is not empty - false', function () {
                var data = {_type: "wix:RichText", text: "a"};
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('TextField', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeFalsy();
            });
            it('data is of type wix:RichText and data is empty and min-lines is greater than zero - false', function () {
                viewDef.comp['min-lines'] = 1;
                var data = {_type: "wix:RichText", text: ""};
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('TextField', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeFalsy();
            });
            it('data is of type wix:RichText and no data - true', function () {
                var data = {_type: "wix:RichText"};
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('TextField', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeTruthy();
            });
            it('data is of type wix:RichText and no data - true', function () {
                var data = {_type: "wix:RichText"};
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('TextField', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeTruthy();
            });
            it('data is undefined (for example when viewDef points to an invalid field)', function () {
                var data; // undefined
                var props = getProps(viewDef);
                var proxy = testUtils.proxyBuilder('TextField', props);

                var shouldHide = proxy.shouldHide(data);

                expect(shouldHide).toBeTruthy();
            });
        });

        describe('getItemLayout', function () {
            describe('height', function () {
                it('no height mode - height is auto', function () {
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    var layout = proxy.getItemLayout();

                    var expected = {height: "auto"};

                    // omit default width
                    expect(_.omit(layout, 'width')).toEqual(expected);
                });
                it('height mode is auto - height is auto', function () {
                    viewDef.comp['height-mode'] = 'auto';
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    var layout = proxy.getItemLayout();

                    var expected = {height: "auto"};

                    // omit default width
                    expect(_.omit(layout, 'width')).toEqual(expected);
                });
                it('height mode is max-chars and no min height - min height is 100', function () {
                    viewDef.comp['height-mode'] = 'max-chars';
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    var layout = proxy.getItemLayout();

                    var expected = {"min-height": 100};

                    // omit default width
                    expect(_.omit(layout, 'width')).toEqual(expected);
                });
                it('height mode is max-chars and has min height - min height is as the prop', function () {
                    viewDef.comp['height-mode'] = 'max-chars';
                    viewDef.comp['min-height'] = '50';
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    var layout = proxy.getItemLayout();

                    var expected = {"min-height": 50};

                    // omit default width
                    expect(_.omit(layout, 'width')).toEqual(expected);
                });
                it('height mode is fixed-height and no height - height is 150', function () {
                    viewDef.comp['height-mode'] = 'fixed-height';
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    var layout = proxy.getItemLayout();

                    var expected = {
                        "min-height": 0,
                        height: 150,
                        "overflow-y": "hidden"};

                    // omit default width
                    expect(_.omit(layout, 'width')).toEqual(expected);
                });
                it('height mode is fixed-height and no height - height is as the prop', function () {
                    viewDef.comp['height-mode'] = 'fixed-height';
                    viewDef.comp.height = '50';
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    var layout = proxy.getItemLayout();

                    var expected = {
                        "min-height": 0,
                        height: 50,
                        "overflow-y": "hidden"};

                    // omit default width
                    expect(_.omit(layout, 'width')).toEqual(expected);
                });
                it('height mode is pixels no height - height is 150', function () {
                    viewDef.comp['height-mode'] = 'pixels';
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    var layout = proxy.getItemLayout();

                    var expected = {height: 150};

                    // omit default width
                    expect(_.omit(layout, 'width')).toEqual(expected);
                });
                it('height mode is pixels and no height - height is as the prop', function () {
                    viewDef.comp['height-mode'] = 'pixels';
                    viewDef.comp.height = '50';
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    var layout = proxy.getItemLayout();

                    var expected = {height: 50};

                    // omit default width
                    expect(_.omit(layout, 'width')).toEqual(expected);
                });
            });
            describe('width', function () {
                it('has manual width-mode and no width and vertical orientation - width is 150', function () {
                    viewDef.comp["width-mode"] = 'manual';
                    var props = getProps(viewDef, 'vertical');
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    var layout = proxy.getItemLayout();

                    var expected = {width: 150};

                    // omit default height
                    expect(_.omit(layout, 'height')).toEqual(expected);
                });
                it('has manual width-mode and width and vertical orientation - width is as comp width', function () {
                    viewDef.comp["width-mode"] = 'manual';
                    viewDef.comp.width = 50;
                    var props = getProps(viewDef, 'vertical');
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    var layout = proxy.getItemLayout();

                    var expected = {width: 50};

                    // omit default height
                    expect(_.omit(layout, 'height')).toEqual(expected);
                });
                it('has no manual width-mode and has width and vertical orientation - width 100%', function () {
                    viewDef.comp.width = 50;
                    var props = getProps(viewDef, 'vertical');
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    var layout = proxy.getItemLayout();

                    var expected = {width: '100%'};

                    // omit default height
                    expect(_.omit(layout, 'height')).toEqual(expected);
                });
                it('has no manual width-mode and has width and horizontal orientation - "box-flex": 1', function () {
                    viewDef.comp.width = 50;
                    var props = getProps(viewDef, 'horizontal');
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    var layout = proxy.getItemLayout();

                    var expected = {"box-flex": "1 1 auto"};

                    // omit default height
                    expect(_.omit(layout, 'height')).toEqual(expected);
                });
            });
        });

        describe('adjustViewDefs', function () {
            describe('viewDef', function () {
                it('vertical orientation - no change', function () {
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    var props = getProps(viewDef, 'vertical');
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {};

                    // omit default height
                    expect(fieldViewDef).toEqual(expected);
                });
                it('vertical orientation and has width - no change', function () {
                    viewDef.comp.width = 50;
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    var props = getProps(viewDef, 'vertical');
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {};

                    // omit default height
                    expect(fieldViewDef).toEqual(expected);
                });
                it('horizontal orientation and no width - max width 150', function () {
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    var props = getProps(viewDef, 'horizontal');
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {layout: {"max-width": 150}};

                    // omit default height
                    expect(fieldViewDef).toEqual(expected);
                });
                it('horizontal orientation and has width - max width is as comp prop', function () {
                    viewDef.comp.width = 50;
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    var props = getProps(viewDef, 'horizontal');
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {layout: {"max-width": 50}};

                    // omit default height
                    expect(fieldViewDef).toEqual(expected);
                });
            });
            describe('itemViewDef', function () {
                it('when the field data is of type wix:Date the comp name should be Date', function () {
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    proxyData = {
                        _type: 'wix:Date',
                        iso: '1993-03-05T00:00:00.000Z'
                    };
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {comp: {name: 'Date', singleLine: false}};

                    // omit default height
                    expect(itemViewDef).toEqual(expected);
                });
                it('no height mode - comp name is Label and single line false', function () {
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {comp: {name: 'Label', singleLine: false}};

                    // omit default height
                    expect(itemViewDef).toEqual(expected);
                });
                it('height mode is auto - comp name is Label and single line false', function () {
                    viewDef.comp["height-mode"] = 'auto';
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {comp: {name: 'Label', singleLine: false}};

                    // omit default height
                    expect(itemViewDef).toEqual(expected);
                });
                it('height mode is lines - comp name is Label', function () {
                    viewDef.comp["height-mode"] = 'lines';
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {comp: {name: 'Label'}};

                    // omit default height
                    expect(itemViewDef).toEqual(expected);
                });
                it('height mode is lines, min lines is 0, max lines is 1 and data is string - comp name is Label and singleLine true', function () {
                    viewDef.comp["height-mode"] = 'lines';
                    viewDef.comp["min-lines"] = 0;
                    viewDef.comp["max-lines"] = 1;
                    proxyData = "some string";
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {comp: {name: 'Label', singleLine: true}};

                    // omit default height
                    expect(itemViewDef).toEqual(expected);
                });
                it('height mode is lines, min lines is 0, max lines is more than 1 and data is string - comp name is ClippedParagraph with min and max lines', function () {
                    viewDef.comp["height-mode"] = 'lines';
                    viewDef.comp["min-lines"] = 0;
                    viewDef.comp["max-lines"] = 10;
                    proxyData = "some string";
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {comp: {name: 'ClippedParagraph', minLines: 0, maxLines: 10}};

                    // omit default height
                    expect(itemViewDef).toEqual(expected);
                });
                it('height mode is lines, min lines is 0, max lines is 1 and data is object - comp name is ClippedParagraph with min and max lines', function () {
                    viewDef.comp["height-mode"] = 'lines';
                    viewDef.comp["min-lines"] = 0;
                    viewDef.comp["max-lines"] = 1;
                    proxyData = {};
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {comp: {name: 'ClippedParagraph', minLines: 0, maxLines: 1}};

                    // omit default height
                    expect(itemViewDef).toEqual(expected);
                });
                it('height mode is lines and data is object - comp name is Label', function () {
                    viewDef.comp["height-mode"] = 'lines';
                    proxyData = {};
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {comp: {name: 'Label'}};

                    // omit default height
                    expect(itemViewDef).toEqual(expected);
                });
                it('height mode is lines, has max-lines and data is object - comp name is ClippedParagraph with 0 min-lines and comp max lines', function () {
                    viewDef.comp["height-mode"] = 'lines';
                    viewDef.comp["max-lines"] = 15;
                    proxyData = {};
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {comp: {name: 'ClippedParagraph', minLines: 0, maxLines: 15}};

                    // omit default height
                    expect(itemViewDef).toEqual(expected);
                });
                it('height mode is lines, has max-lines, min-lines tha and data is object - comp name is ClippedParagraph with 0 min and max lines', function () {
                    viewDef.comp["height-mode"] = 'lines';
                    viewDef.comp["min-lines"] = 25;
                    viewDef.comp["max-lines"] = 15;
                    proxyData = {};
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    var props = getProps(viewDef);
                    spyOn(fonts.fontUtils, 'parseFontStr').and.returnValue({
                        size: 10
                    });
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {comp: {name: 'ClippedParagraph', minLines: 25, maxLines: 25}};

                    // omit default height
                    expect(itemViewDef).toEqual(expected);
                });
                it('height mode is max-chars and no max-chars - ClippedParagraph2 with 100 max-chars', function () {
                    viewDef.comp["height-mode"] = 'max-chars';
                    proxyData = {};
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {comp: {name: 'ClippedParagraph2', 'max-chars': 100}};

                    // omit default height
                    expect(itemViewDef).toEqual(expected);
                });
                it('height mode is max-chars and  max-chars - ClippedParagraph2 with comp max-chars', function () {
                    viewDef.comp["height-mode"] = 'max-chars';
                    viewDef.comp["max-chars"] = 25;
                    proxyData = {};
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {comp: {name: 'ClippedParagraph2', 'max-chars': 25}};

                    // omit default height
                    expect(itemViewDef).toEqual(expected);
                });
                it('height mode is lines and max-lines is 0', function () {
                    viewDef.comp["height-mode"] = 'lines';
                    viewDef.comp["max-lines"] = 0;
                    proxyData = {};
                    var fieldViewDef = {};
                    var itemViewDef = {comp: {}};
                    var props = getProps(viewDef);
                    var proxy = testUtils.proxyBuilder('TextField', props);

                    proxy.adjustViewDefs(fieldViewDef, itemViewDef);

                    var expected = {comp: {name: 'Label'}};

                    // omit default height
                    expect(itemViewDef).toEqual(expected);
                });
            });
        });
    });
});
