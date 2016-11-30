define(['wixappsCore/core/expressions/functionLibrary'], function (FunctionLibrary) {
    'use strict';

    describe('FunctionLibrary', function () {
        beforeEach(function () {
            var SITE_DATA = null;
            this.functionLibrary = new FunctionLibrary(SITE_DATA);
        });


        describe('invertAlignment', function () {
            it('should return "right" for "left"', function () {
                expect(this.functionLibrary.invertAlignment('left')).toBe('right');
            });

            it('should return "left" for "right"', function () {
                expect(this.functionLibrary.invertAlignment('right')).toBe('left');
            });

            it('should return "center" for "center"', function () {
                expect(this.functionLibrary.invertAlignment('center')).toBe('center');
            });
        });
    });
});
