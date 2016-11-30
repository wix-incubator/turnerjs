define([
    'lodash',
    'wixappsCore/util/richTextUtils',
    'wixappsCore/util/viewsUtils',
    'testUtils',
    'packages/wixappsCore/src/test/util/richTextUtilsData.json'
], function (_, richTextUtils, viewUtils, testUtils, richTextUtilsData) {
    'use strict';
    describe('richTextUtils', function () {

        function bindGetCompProp(viewDef) {
            return function (prop) {
                return viewUtils.getCompProp(prop, viewDef);
            };
        }

        describe('getDataWithDefaultStyle with open experiemnt sv_fixColorOfHatulOnHover', function () {
            beforeEach(function () {
                testUtils.experimentHelper.openExperiments('sv_fixColorOfHatulOnHover');
            });

            it('getDataWithDefaultStyle - data has hatul - all default style properties set to true', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", bold: 'true', italic: 'true', lineThrough: 'true', underline: 'true', fontSize: '15.5'
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8" style="font-size:15.5px;color:#FFFFFF;"><strong style="font-weight: bold;"><em style="font-style: italic;"><strike style="text-decoration: line-through;"><u style="text-decoration: underline;">some text</u></strike></em></strong></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('should merge similar elements created because of compProps', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", "backgroundColor": "#01FF", "bold": true
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8" style="color:#FFFFFF;"><span style="background-color:#01FF;"><strong style="font-weight: bold;">some text</strong></span></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('should merge same elements with different attributes created because of compProps', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", "backgroundColor": "backcolor_2", "bold": true
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8" style="color:#FFFFFF;"><span class="backcolor_2"><strong style="font-weight: bold;">some text</strong></span></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul - all default style properties set to true', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", bold: 'true', italic: 'true', lineThrough: 'true', underline: 'true', fontSize: '15.5'
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8" style="font-size:15.5px;color:#FFFFFF;"><strong style="font-weight: bold;"><em style="font-style: italic;"><strike style="text-decoration: line-through;"><u style="text-decoration: underline;">some text</u></strike></em></strong></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul - all default style properties set to false', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", bold: 'false', italic: 'false', lineThrough: 'false', underline: 'false'
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8" style="color:#FFFFFF;"><strong style="font-weight: normal;"><em style="font-style: normal;"><strike style="text-decoration: none;"><u style="text-decoration: none;">some text</u></strike></em></strong></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul - bold set to false', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", bold: 'false'
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8" style="color:#FFFFFF;"><strong style="font-weight: normal;">some text</strong></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul - italic set to false', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", italic: 'false'
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8" style="color:#FFFFFF;"><em style="font-style: normal;">some text</em></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul - underline set to false', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", underline: 'false'
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8" style="color:#FFFFFF;"><u style="text-decoration: none;">some text</u></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul - strike through set to false', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", lineThrough: 'false'
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8" style="color:#FFFFFF;"><strike style="text-decoration: none;">some text</strike></p>';

                expect(defaultStyle).toEqual(expected);
            });
        });

        describe('getDataWithDefaultStyle', function () {
            it('getDataWithDefaultStyle - data has no hatul and all default style properties set to true - no change', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", bold: 'true', italic: 'true', lineThrough: 'true', underline: 'true', fontSize: '15.5'
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<p>some text</p>');

                var expected = '<p>some text</p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - ignore whitespace chars outside elements', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '  \n <p>some text</p>\n<p>some text</p>\n ');

                var expected = '<p>some text</p><p>some text</p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul - replace to p and keep old attributes except class, which gets the default style', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul class="font_9 color_25" someattribute="xxx">some text</hatul>');

                var expected = '<p class="font_8" someattribute="xxx">some text</p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul - replace to p and keep old attributes except class, which gets the viewDef style', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", style: 'Heading XL'
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul class="font_9 color_25" someattribute="xxx">some text</hatul>');

                var expected = '<p class="font_3" someattribute="xxx">some text</p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul and line height and viewDef has line height - replace to p and keep old line height', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "line-height": "13"
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul style="line-height:normal;">some text</hatul>');

                var expected = '<p style="line-height:normal;" class="font_8">some text</p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul and style on it and additional attributes was applied', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul style="line-height:normal;">some text</hatul>', undefined, false, false, 'text-align:center');

                var expected = '<p style="text-align:center;line-height:normal;" class="font_8">some text</p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul and line height and viewDef has line height - replace to p and keep old line height', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "line-height": "13"
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8" style="line-height:13em;">some text</p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul - all default style properties set to true', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", bold: 'true', italic: 'true', lineThrough: 'true', underline: 'true', fontSize: '15.5'
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8" style="font-size:15.5px;"><span style="color:#FFFFFF;"><strong style="font-weight: bold;"><em style="font-style: italic;"><strike style="text-decoration: line-through;"><u style="text-decoration: underline;">some text</u></strike></em></strong></span></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('should merge similar elements created because of compProps', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", "backgroundColor": "#01FF", "bold": true
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8"><span style="color:#FFFFFF; background-color:#01FF;"><strong style="font-weight: bold;">some text</strong></span></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('should merge same elements with different attributes created because of compProps', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", "backgroundColor": "backcolor_2", "bold": true
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8"><span style="color:#FFFFFF;" class="backcolor_2"><strong style="font-weight: bold;">some text</strong></span></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul - all default style properties set to true', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", bold: 'true', italic: 'true', lineThrough: 'true', underline: 'true', fontSize: '15.5'
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8" style="font-size:15.5px;"><span style="color:#FFFFFF;"><strong style="font-weight: bold;"><em style="font-style: italic;"><strike style="text-decoration: line-through;"><u style="text-decoration: underline;">some text</u></strike></em></strong></span></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul - all default style properties set to false', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", bold: 'false', italic: 'false', lineThrough: 'false', underline: 'false'
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8"><span style="color:#FFFFFF;"><strong style="font-weight: normal;"><em style="font-style: normal;"><strike style="text-decoration: none;"><u style="text-decoration: none;">some text</u></strike></em></strong></span></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul - bold set to false', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", bold: 'false'
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8"><span style="color:#FFFFFF;"><strong style="font-weight: normal;">some text</strong></span></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul - italic set to false', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", italic: 'false'
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8"><span style="color:#FFFFFF;"><em style="font-style: normal;">some text</em></span></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul - underline set to false', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", underline: 'false'
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8"><span style="color:#FFFFFF;"><u style="text-decoration: none;">some text</u></span></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul - strike through set to false', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "#FFFFFF", lineThrough: 'false'
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8"><span style="color:#FFFFFF;"><strike style="text-decoration: none;">some text</strike></span></p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - data has hatul - prop value is null', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", "color": "null"
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>some text</hatul>');

                var expected = '<p class="font_8">some text</p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - single line - take the first element and remove <br> & <br/>', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", singleLine: true
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<hatul>so<br>me t<br/>ext1</hatul><hatul>some text2</hatul>');

                var expected = '<p class="font_8 singleLine">some text1</p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - single line - skip all empty/media elements and take only one', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", singleLine: true
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), richTextUtilsData);

                var expected = '<p class="font_8 singleLine"><span style="font-style:italic;"><span style="font-weight:bold;">ghjghjghjg</span></span>hjghjghj</p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - disableLinks is true, clean all <a> tags', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label", disableLinks: true
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<p><a dataquery=\"#appbuilder_5596C49D\">bla bla</a></p>');

                var expected = '<p>bla bla</p>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - hatul in li', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<ul class="font_8"><li><hatul class="font_8">a<br>b<br/>c</hatul></li></ul>');

                var expected = '<ul class="font_8"><li><p class="font_8">a<br>b<br>c</p></li></ul>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - hatul in li with <br> & <br/>', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<ul class="font_8"><li><hatul>some<br> text1<br/></hatul><hatul>some text2</hatul></li></ul>');

                var expected = '<ul class="font_8"><li><p class="font_8">some<br> text1<br></p><p class="font_8">some text2</p></li></ul>';

                expect(defaultStyle).toEqual(expected);
            });

            it('getDataWithDefaultStyle - has double quotes in an attribute - wrap with single quote', function () {
                var viewDef = {
                    "comp": {
                        "name": "Label"
                    }
                };

                var defaultStyle = richTextUtils.getDataWithDefaultStyle(bindGetCompProp(viewDef), '<img wix-comp=\'{"a":"b"}\'>');

                var expected = '<img wix-comp=\'{"a":"b"}\'>';

                expect(defaultStyle).toEqual(expected);
            });
        });

    });
});
