define(['documentServices/componentsMetaData/components/contactFormMetaData', 'documentServices/constants/constants'], function (contactFormMetaData, constants) {
	'use strict';
    describe('contactFormMetaData - ', function() {

        it('resizableSides should be left and right', function() {
            var expectedSides = [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT];

            expect(contactFormMetaData.resizableSides).toEqual(expectedSides);
        });
    });
});
