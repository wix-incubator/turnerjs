define(['documentServices/componentsMetaData/components/imageButtonMetaData'], function (imageButtonMetaData) {
	'use strict';
    describe('imageButton Meta Data - ', function() {

        it('rotatable should be true', function() {
            expect(imageButtonMetaData.rotatable).toBe(true);
        });

    });
});
