define(['documentServices/componentsMetaData/components/skypeCallButtonMetaData'], function (skypeCallButtonMetaData) {
	'use strict';
    describe('skypeCallButtonMetaData - ', function() {

        it('resizableSides should be empty', function() {
            expect(skypeCallButtonMetaData.resizableSides.length).toEqual(0);
        });
    });
});
