define(['documentServices/componentsMetaData/components/singleAudioPlayerMetaData', 'documentServices/constants/constants'], function (singleAudioPlayerMetaData, constants) {
	'use strict';
    describe('singleAudioPlayerMetaData - ', function() {

        it('resizableSides should be left and right', function() {
            var expectedSides = [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT];

            expect(singleAudioPlayerMetaData.resizableSides).toEqual(expectedSides);
        });
    });
});
