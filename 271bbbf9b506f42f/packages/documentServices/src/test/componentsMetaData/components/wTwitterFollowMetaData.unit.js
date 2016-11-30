define(['documentServices/componentsMetaData/components/wTwitterFollowMetaData'], function (wTwitterFollowMetaData) {
    'use strict';
    describe('wTwitterFollowMetaData - ', function() {

        it('resizableSides should be empty', function() {
            expect(wTwitterFollowMetaData.resizableSides.length).toEqual(0);
        });
    });
});
