define(['documentServices/componentsMetaData/components/linkBarMetaData'], function (linkBarMetaData) {
	'use strict';
    describe('linkBarMetaData - ', function() {

        it('resizableSides should be empty', function() {
            expect(linkBarMetaData.resizableSides.length).toEqual(0);
        });
    });
});
