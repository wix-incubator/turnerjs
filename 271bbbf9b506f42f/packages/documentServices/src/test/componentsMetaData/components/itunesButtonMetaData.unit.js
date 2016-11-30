define(['documentServices/componentsMetaData/components/itunesButtonMetaData', 'documentServices/constants/constants'], function (itunesButtonMetaData, constants) {
	'use strict';
    describe('itunesButtonMetaData - ', function() {

        it('resizableSides should be left and right', function() {
            var expectedSides = [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT];

            expect(itunesButtonMetaData.resizableSides).toEqual(expectedSides);
        });
    });
});
