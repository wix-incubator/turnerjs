define(['lodash', 'coreUtils/core/colorParser'], function (_, colorParser) {
    'use strict';

    describe('ColorParser', function () {

        describe('getColor', function(){
            var colorsHexToRgbaMap = {
                '#FFFFFF': 'rgba(255, 255, 255, 1)',
                '#F0F8FF': 'rgba(240, 248, 255, 1)',
                '#FAEBD7': 'rgba(250, 235, 215, 1)'
            };
            var colorsMap = _.keys(colorsHexToRgbaMap);

            describe('support colors in [color_x] or {color_x} format', function(){
                it('[color_x] format - should return the right color from the map and convert it to rgba format', function () {
                    var index;
                    for (index = 0; index < colorsHexToRgbaMap.length; index++) {
                        var color = colorParser.getColor(colorsMap, '[color_' + index + ']');

                        var colorInHex = colorsMap[index];
                        expect(color).toEqual(colorsHexToRgbaMap[colorInHex]);
                    }

                });

                it('{color_x} format - should return the right color from the map and convert it to rgba format', function () {
                    var index;
                    for (index = 0; index < colorsHexToRgbaMap.length; index++) {
                        var color = colorParser.getColor(colorsMap, '{color_' + index + '}');

                        var colorInHex = colorsMap[index];
                        expect(color).toEqual(colorsHexToRgbaMap[colorInHex]);
                    }

                });
            });

            it('should return "transparent" if passed "none"', function () {
                var color = colorParser.getColor(colorsMap, 'none');
                expect(color).toEqual('transparent');
            });

            it('should override the color alpha if passed a numeric third parameter', function () {
                var color = colorParser.getColor(colorsMap, '{color_1}', 0.5);

                var rgbaColor = 'rgba(240, 248, 255, 0.5)';
                expect(color).toEqual(rgbaColor);
            });

            it('should not override the color alpha if passed a string third parameter', function () {
                var color = colorParser.getColor(colorsMap, '{color_1}', '0.5');

                var rgbaColor = 'rgba(240, 248, 255, 1)';
                expect(color).toEqual(rgbaColor);
            });

            it('should be transparent if alpha value is 0', function () {
                var color = colorParser.getColor(colorsMap, '{color_1}', 0);

                expect(color).toEqual('transparent');
            });
        });
    });

});
