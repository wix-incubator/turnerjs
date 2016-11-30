define([
    'lodash',
    'Squire',
    'documentServices/mobileConversion/modules/fontSizeDefinitions',
    'siteUtils/utils/mobileUtils',
    'documentServices/mobileConversion/modules/textComponentScaler'],
    function (_, Squire, fontSizeDefinitions, mobileUtils, textComponentScaler) {

    'use strict';

    var customMatchers = {
        toBeTrueBecause: function() {
            return {compare: trueBecause};
        }
    };

    function trueBecause(value, message) {
        return {
            pass: !!value,
            message: message
        };
    }

    function fuzzyGreaterThen(a, b){
        return a + 0.00001 > b;
    }

    function mockTextComponent(averageNormalizedFontSize, textLength){
        return {
            componentType: "wysiwyg.viewer.components.WRichText",
            layout: {scale: 1},
            conversionData: {
                averageNormalizedFontSize: averageNormalizedFontSize,
                textLength: textLength
            }
        };
    }

    describe('setScale', function () {

        beforeEach(function () {
            jasmine.addMatchers(customMatchers);
        });

        it('should preserve relations between smaller and larger font sizes if character count is the same', function() {
            var fsRange = fontSizeDefinitions.fontSizeRange;
            var ccRange = fontSizeDefinitions.characterCountRange;
            for (var characterCount = ccRange.min; characterCount <= ccRange.max; characterCount++){

                var prevSize = null;
                for (var fontSize = fsRange.min; fontSize <= fsRange.max; fontSize++) {
                    var comp = mockTextComponent(fontSize, characterCount);
                    textComponentScaler.setScale([comp]);
                    var newSize = mobileUtils.convertFontSizeToMobile(fontSize, comp.layout.scale);

                    expect(fuzzyGreaterThen(newSize, prevSize)).toBeTrueBecause(
                        '(fs: ' + fontSize +
                        ', cc:' + characterCount +
                        ') => ' + newSize +
                        ' must be greater then (fs: ' + (fontSize - 1) +
                        ', cc:' + characterCount + ') => ' +
                        '' + prevSize);

                    prevSize = newSize;
                }
            }
        });

        it('should not fail if components array is empty', function() {
            expect(function(){
                textComponentScaler.setScale([]);
            }).not.toThrow();
        });

        it('should not fail if no text components exist', function() {
            var components = [
                {componentType: 'a'},
                {componentType: 'b', components:[{componentType: 'c'}]}
            ];

            expect(function(){
                textComponentScaler.setScale(components);
            }).not.toThrow();
        });

        it('should not scale non text components', function() {
            var components = [
                {componentType: 'a', layout: {scale: 1}, conversionData: {averageNormalizedFontSize: 14, textLength: 30}}
            ];

            textComponentScaler.setScale(components);
            expect(components[0].layout.scale).toBe(1);
        });

        it('should scale according to our fontSize x characterCount table at https://drive.google.com/a/wix.com/file/d/0B9R6LZzH-7SpZVN0MW9vX211MVk/view?ths=true', function() {
            var tableEntries = [
                {fs: 15, cc: 39, result: 15},
                {fs: 38, cc: 3, result: 34},
                {fs: 52, cc: 30, result: 27},
                {fs: 74, cc: 22, result: 31},
                {fs: 109, cc: 2, result: 38}
            ];

            _.forEach(tableEntries, function(te){
                var comp = mockTextComponent(te.fs, te.cc);
                textComponentScaler.setScale([comp]);
                var newSize = mobileUtils.convertFontSizeToMobile(te.fs, comp.layout.scale);
                expect(newSize).toBe(te.result);
            });
        });
    });
});

