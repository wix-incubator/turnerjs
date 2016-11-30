define(['documentServices/componentsMetaData/components/subscribeFormMetaData', 'documentServices/constants/constants'], function (subscribeFormMetaData, constants) {
	'use strict';
    describe('subscribeFormMetaData - ', function() {

        it('resizableSides should be left and right', function() {
            var expectedSides = [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT];

            expect(subscribeFormMetaData.resizableSides).toEqual(expectedSides);
        });
    });
});
