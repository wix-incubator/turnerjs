define(['documentServices/componentsMetaData/components/facebookShareMetaData'], function (facebookShareMetaData) {
	'use strict';
    describe('facebookShareMetaData - ', function() {

        it('resizableSides should be empty', function() {
            expect(facebookShareMetaData.resizableSides.length).toEqual(0);
        });
    });
});
