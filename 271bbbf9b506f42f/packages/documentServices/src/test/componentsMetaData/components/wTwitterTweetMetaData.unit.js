define(['documentServices/componentsMetaData/components/wTwitterTweetMetaData'], function (wTwitterTweetMetaData) {
    'use strict';
    describe('wTwitterTweetMetaData - ', function() {

        it('resizableSides should be empty', function() {
            expect(wTwitterTweetMetaData.resizableSides.length).toEqual(0);
        });
    });
});
