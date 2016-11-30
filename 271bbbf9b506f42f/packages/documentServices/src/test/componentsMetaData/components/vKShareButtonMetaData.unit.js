define(['documentServices/componentsMetaData/components/vKShareButtonMetaData'], function (vKShareButtonMetaData) {
	'use strict';
    describe('vKShareButtonMetaData - ', function() {

        it('resizableSides should be empty', function() {
            expect(vKShareButtonMetaData.resizableSides.length).toEqual(0);
        });
    });
});
