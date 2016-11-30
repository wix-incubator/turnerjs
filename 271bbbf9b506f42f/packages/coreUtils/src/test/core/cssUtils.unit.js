define(['lodash', 'coreUtils/core/cssUtils'], function (_, cssUtils) {
    'use strict';
    describe('testing cssUtils', function () {
        describe('sanity', function(){
            it('should create a valid className', function(){
                expect(cssUtils.concatenateStyleIdToClassName("s6", "dummyClassName")).toEqual("s6_dummyClassName");
            });

            it('should create a valid className from a list of classes', function(){
                expect(cssUtils.concatenateStyleIdToClassList("s6", ["dummy1", "dummy2"])).toEqual("s6_dummy1 s6_dummy2");
            });

            it('should create a valid className from a list of classes with nulls', function(){
                expect(cssUtils.concatenateStyleIdToClassList("s6", ["dummy1", null, "dummy2"])).toEqual("s6_dummy1 s6_dummy2");
            });

            it('should create a valid className from an empty list of classes', function(){
                expect(cssUtils.concatenateStyleIdToClassList("s6", [])).toEqual("");
            });
       });

        describe('convertUnitsDataToCssStringValue', function() {
            it('should work for 0', function() {
                var actual = cssUtils.convertUnitsDataToCssStringValue({});
                expect(actual).toEqual(undefined);
            });
            it('should work for 1 wrong', function() {
                var actual = cssUtils.convertUnitsDataToCssStringValue({watsdsg: 22});
                expect(actual).toEqual(undefined);
            });
            it('should work for 1 wrong otu of two', function() {
                var actual = cssUtils.convertUnitsDataToCssStringValue({watsdsg: 22, px: 2});
                expect(actual).toEqual('2px');
            });

            it('should work for an object with one property', function() {
                var actual = cssUtils.convertUnitsDataToCssStringValue({px: 22});
                expect(actual).toEqual('22px');
            });
            it('should work for an object with multiple properties', function() {
                var actual = cssUtils.convertUnitsDataToCssStringValue({px: 22, pct: 11});
                expect(actual).toEqual('calc(11% + 22px)');
            });

            describe('when the object with vw units', function(){
                it('should convert vw to px based on the screen width', function(){
                    var actual = cssUtils.convertUnitsDataToCssStringValue({vw: 10}, 1000);
                    expect(actual).toEqual('100px');
                });

                it('should convert vw to px based on the screen width and add it to the existing px value', function(){
                    var actual = cssUtils.convertUnitsDataToCssStringValue({px: 22, vw: 10}, 1000);
                    expect(actual).toEqual('122px');
                });
            });


        });


        describe('normalizeColorStr', function(){
            it('should normalize format of "11,11,11,1" to rgba()', function(){
                expect(cssUtils.normalizeColorStr("11,11,11,1")).toBe('rgba(11,11,11,1)');
            });

            it('should normalize format of "11,11,11,1" to rgba(), when alpha is a fraction', function(){
                expect(cssUtils.normalizeColorStr("11,11,11,0.5")).toBe('rgba(11,11,11,0.5)');
            });

            it("should not throw when colorStr is undefined", function(){
                expect(cssUtils.normalizeColorStr.bind(null, undefined)).not.toThrow();
            });

        });

        describe('class functions', function() {
            describe('elementHasClass', function() {
                it('should identify if element has class', function() {
                    var element = {className: 'name1 name2     name4 name5name6    name7'};
                    expect(cssUtils.elementHasClass(element, 'name1')).toBe(true);
                    expect(cssUtils.elementHasClass(element, 'name2')).toBe(true);
                    expect(cssUtils.elementHasClass(element, 'name3')).toBe(false);
                    expect(cssUtils.elementHasClass(element, 'name4')).toBe(true);
                    expect(cssUtils.elementHasClass(element, 'name5')).toBe(false);
                    expect(cssUtils.elementHasClass(element, 'name6')).toBe(false);
                    expect(cssUtils.elementHasClass(element, 'name7')).toBe(true);
                    expect(cssUtils.elementHasClass(element, '')).toBe(true);
                    expect(cssUtils.elementHasClass({}, 'name7')).toBe(false);
                    expect(cssUtils.elementHasClass({}, '')).toBe(true);
                });
                it('should identify if element has class with complex names', function() {
                    var element = {className: 'a-b-c a_b_c'};
                    expect(cssUtils.elementHasClass(element, 'b')).toBe(false);
                });
            });
            describe('removeClassFromElement', function() {
                it('should remove class from element', function() {
                    var element = {className: 'b'};
                    cssUtils.removeClassFromElement(element, 'b');
                    expect(element.className).toBe('');
                });
                it('should remove class from element', function() {
                    var element = {className: 'a b'};
                    cssUtils.removeClassFromElement(element, 'b');
                    expect(element.className).toBe('a');
                });
                it('should remove class from element', function() {
                    var element = {className: 'b c'};
                    cssUtils.removeClassFromElement(element, 'b');
                    expect(element.className).toBe('c');
                });
                it('should remove class from element', function() {
                    var element = {className: 'a b c'};
                    cssUtils.removeClassFromElement(element, 'b');
                    expect(element.className).toBe('a c');
                });
                it('should remove class from element', function() {
                    var element = {className: 'a b cb bb ab b4'};
                    cssUtils.removeClassFromElement(element, 'b');
                    expect(element.className).toBe('a cb bb ab b4');
                });
            });
        });

        describe('addStylesheetOfUrl', function() {
            function linkExists(url) {
                return Boolean(window.document.querySelector('link[href=' + url + ']'));
            }
            var fakeUrl = 'fakeUrlforNonExistingCssFor_addStylesheetOfUrl';

            it('should add a link tag to the head', function() {
                expect(linkExists(fakeUrl)).toBe(false);
                cssUtils.addStylesheetOfUrl(fakeUrl);
                expect(linkExists(fakeUrl)).toBe(true);
            });
        });

        describe('getColorsCssString', function () {
            it('should return css string for theme colors and back_colors', function () {
                var themeDataColors = ['#123456', '#FFFFFF', '255, 255, 255, 0.4'];

                var expected =
                    ".color_0 {color: #123456;}\n" +
                    ".backcolor_0 {background-color: #123456;}\n" +
                    ".color_1 {color: #FFFFFF;}\n" +
                    ".backcolor_1 {background-color: #FFFFFF;}\n" +
                    ".color_2 {color: rgba(255, 255, 255, 0.4);}\n" +
                    ".backcolor_2 {background-color: rgba(255, 255, 255, 0.4);}\n";

                expect(cssUtils.getColorsCssString(themeDataColors)).toEqual(expected);
            });
        });
    });
});
