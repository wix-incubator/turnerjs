define(['documentServices/componentsMetaData/components/verticalLineMetaData', 'documentServices/constants/constants'], function (verticalLineMetaData, constants) {
	'use strict';
    describe('verticalLine Meta Data - ', function() {

        it('rotatable should be true', function() {
            expect(verticalLineMetaData.rotatable).toBe(true);
        });

        it('resizableSides should be top and bottom', function() {
            var expectedSides = [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.BOTTOM];

            expect(verticalLineMetaData.resizableSides).toEqual(expectedSides);
        });

    });
});
