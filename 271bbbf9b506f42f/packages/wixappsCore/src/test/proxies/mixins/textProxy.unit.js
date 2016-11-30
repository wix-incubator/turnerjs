define([
    "lodash",
    "wixappsCore/core/proxyFactory",
    "wixappsCore/proxies/mixins/textProxy",
    'testUtils',
    'react'
], function (
    _,
    proxyFactory,
    textProxy,
    testUtils,
    React
) {
    'use strict';

    describe('textProxy', function () {

        beforeEach(function () {
            var TestTextProxy = {
                mixins: [textProxy],
                renderProxy: function () {
                    return React.DOM.div();
                }
            };

            proxyFactory.register('TestTextProxy', TestTextProxy);
        });

        afterEach(function () {
            proxyFactory.invalidate('TestTextProxy');
        });

        describe('createFormattedText - string', function () {
            it('no style properties, but has default element - span with default attributes and string in inner html', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestTextProxy', props);

                var defaultStyle = proxyClass.createFormattedText('some text', 'span');

                var expected = '<span class="font_8">some text</span>';

                expect(defaultStyle).toEqual(expected);
            });

            it('rich text no style properties, but has default element with version 2 - span with default attributes and string in inner html', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestTextProxy', props);

                var defaultStyle = proxyClass.createFormattedText({_type: 'wix:RichText', text: '<hatul>some text</hatul>', version: 2}, 'span');

                var expected = '<span class="font_8">some text</span>';

                expect(defaultStyle).toEqual(expected);
            });

            it('no style properties, rich text with no hatul and no version - p with default attributes and string in inner html', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestTextProxy', props);

                var defaultStyle = proxyClass.createFormattedText({_type: 'wix:RichText', text: 'some text'});

                var expected = '<p class="font_8">some text</p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('no style properties, rich text with no hatul and version 1 - p with default attributes and string in inner html', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestTextProxy', props);

                var defaultStyle = proxyClass.createFormattedText({_type: 'wix:RichText', text: 'some text', version: 1});

                var expected = '<p class="font_8">some text</p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('no style properties, rich text with surrounding p and version 1 - p with default attributes and string in inner html', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestTextProxy', props);

                var defaultStyle = proxyClass.createFormattedText({_type: 'wix:RichText', text: '<p>some text</p>', version: 1});

                var expected = '<p class="font_8">some text</p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('no style properties - p with default attributes and string in inner html', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestTextProxy', props);

                var defaultStyle = proxyClass.createFormattedText('some text');

                var expected = '<p class="font_8">some text</p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('no style properties - p with default attributes and "<div></div>" string in inner html', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestTextProxy', props);

                var text = '<div></div>';
                var formattedText = proxyClass.createFormattedText(text);
                var expected = '<p class="font_8">' + text + '</p>';

                expect(formattedText).toEqual(expected);
            });

            it('no style properties - p with default attributes and %%% string in inner html', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestTextProxy', props);

                var text = '%%%';
                var formattedText = proxyClass.createFormattedText(text);
                var expected = '<p class="font_8">' + text + '</p>';

                expect(formattedText).toEqual(expected);
            });

            it('no style properties - p with default attributes and <br/> or <br> string in inner html texts', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestTextProxy', props);

                var tests = {
                    '<br>': '<br>',
                    '<br/>': '<br>',
                    'a<br>b': 'a<br>b',
                    'a<br/>b': 'a<br>b'
                };

                _.forEach(tests, function (expectedInnerText, text) {
                    var formattedText = proxyClass.createFormattedText(text);
                    var expected = '<p class="font_8">' + expectedInnerText + '</p>';
                    expect(formattedText).toEqual(expected);
                });
            });

            it('has style properties - p with inner tags string in inner html', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", italic: true
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestTextProxy', props);

                var defaultStyle = proxyClass.createFormattedText('some text');

                var expected = '<p class="font_8"><em style="font-style: italic;">some text</em></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('has style properties, prefix and postfix - p with inner tags string in inner html', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", italic: true, prefix: "PREFIX-", postfix: "-POSTFIX"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestTextProxy', props);

                var defaultStyle = proxyClass.createFormattedText('some text');

                var expected = '<p class="font_8"><em style="font-style: italic;">PREFIX-some text-POSTFIX</em></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('has max-chars - string is limited in inner html', function () {
                testUtils.experimentHelper.openExperiments('sv_limitAuthorLength');
                var viewDef = {
                    "comp": {
                        "name": "Label", "max-chars": "3"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestTextProxy', props);

                var defaultStyle = proxyClass.createFormattedText('some text');

                var expected = '<p class="font_8">som</p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('has Formulas and Data Types attribute in table element', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestTextProxy', props);

                var defaultStyle = proxyClass.createFormattedText('<table x:str="">some text</table>');

                var expected = '<p class="font_8"><table x:str="">some text</table></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('has : in the tag name', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestTextProxy', props);

                var defaultStyle = proxyClass.createFormattedText('<o:p></o:p>');

                var expected = '<p class="font_8"><o:p></o:p></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('has ? in the tag name', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestTextProxy', props);

                var defaultStyle = proxyClass.createFormattedText('<?xml:namespace />');

                var expected = '<p class="font_8"><?xml:namespace></p>';

                expect(defaultStyle).toEqual(expected);
            });

            describe('hatul tags in lists of version 2.0', function() {

                function getDefaultProxyClass() {
                    var viewDef = {
                        "comp": {
                            "name": "Label"
                        }
                    };
                    var props = testUtils.proxyPropsBuilder(viewDef);
                    props.viewProps.getPartDefinition = jasmine.createSpy('getPartDefinition').and.returnValue({
                        version: '2.0'
                    });
                    return testUtils.proxyBuilder('TestTextProxy', props);
                }

                it('should ignore hatul elements by converting them to span elements with no attributes for', function () {
                    var testRichTextField = {
                        _type: 'wix:RichText',
                        text: '<p><hatul class="font_8" someattribute="xxx">Test text 1</hatul><hatul class="font_8"><span>Test text 2</span></hatul></p>',
                        version: 2
                    };
                    var expected = '<p><span>Test text 1</span><span><span>Test text 2</span></span></p>';

                    var proxyClass = getDefaultProxyClass();
                    var formattedText = proxyClass.createFormattedText(testRichTextField, 'testTag');

                    expect(formattedText).toEqual(expected);
                });


                it('should keep old behavior for single root hatul elements', function () {
                    var testRichTextField = {
                        _type: 'wix:RichText',
                        text: '<hatul class="font_8" someattribute="xxx">Test text 1</hatul>',
                        version: 2
                    };
                    var expected = '<testTag class="font_8" someattribute="xxx">Test text 1</testTag>';

                    var proxyClass = getDefaultProxyClass();
                    var formattedText = proxyClass.createFormattedText(testRichTextField, 'testTag');

                    expect(formattedText).toEqual(expected);
                });

                it('should keep old behavior for sibling root hatul elements', function () {
                    var testRichTextField = {
                        _type: 'wix:RichText',
                        text: '<hatul class="font_8" someattribute="xxx">Test text 1</hatul><hatul class="font_8"><span>Test text 2</span></hatul>',
                        version: 2
                    };
                    var expected = '<testTag class="font_8" someattribute="xxx">Test text 1</testTag><testTag class="font_8"><span>Test text 2</span></testTag>';

                    var proxyClass = getDefaultProxyClass();
                    var formattedText = proxyClass.createFormattedText(testRichTextField, 'testTag');

                    expect(formattedText).toEqual(expected);
                });

            });
        });


        describe('createFormattedText - number', function () {
            it('p with default attributes and number in inner html', function () {
                var viewDef = {comp: {name: 'Label'}};

                var props = testUtils.proxyPropsBuilder(viewDef);
                var proxyClass = testUtils.proxyBuilder('TestTextProxy', props);

                expect(proxyClass.createFormattedText(123)).toBe('<p class="font_8">123</p>');
                expect(proxyClass.createFormattedText(0)).toBe('<p class="font_8">0</p>');
                expect(proxyClass.createFormattedText(-1)).toBe('<p class="font_8">-1</p>');
            });
        });
    });
});
