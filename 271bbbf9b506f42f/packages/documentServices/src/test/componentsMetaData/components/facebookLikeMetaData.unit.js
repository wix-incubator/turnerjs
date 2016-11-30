define(['documentServices/componentsMetaData/components/facebookLikeMetaData'], function (facebookLikeMetaData) {
	'use strict';
    describe('facebookLikeMetaData - ', function() {

        it('resizableSides should be empty', function() {
            expect(facebookLikeMetaData.resizableSides.length).toEqual(0);
        });
    });
});
