define(['documentServices/componentsMetaData/components/wGooglePlusOneMetaData'], function (wGooglePlusOneMetaData) {
    'use strict';
    describe('wGooglePlusOneMetaData - ', function() {

        it('resizableSides should be empty', function() {
            expect(wGooglePlusOneMetaData.resizableSides.length).toEqual(0);
        });
    });
});
