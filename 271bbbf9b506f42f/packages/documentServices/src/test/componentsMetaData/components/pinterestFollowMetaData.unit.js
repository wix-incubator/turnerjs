define(['documentServices/componentsMetaData/components/pinterestFollowMetaData'], function (pinterestFollowMetaData) {
	'use strict';
    describe('pinterestFollowMetaData - ', function() {

        it('resizableSides should be empty', function() {
            expect(pinterestFollowMetaData.resizableSides.length).toEqual(0);
        });
    });
});
