define(['documentServices/componentsMetaData/components/wPhotoMetaData'], function (wPhotoMetaData) {
    'use strict';
    describe('wPhoto Meta Data - ', function() {

        it('rotatable should be true', function() {
            expect(wPhotoMetaData.rotatable).toBe(true);
        });
    });
});
