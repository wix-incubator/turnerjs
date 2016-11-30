define(['documentServices/componentsMetaData/components/siteButtonMetaData'], function (siteButtonMetaData) {
	'use strict';
    describe('siteButton Meta Data - ', function() {

        it('rotatable should be true', function() {
            expect(siteButtonMetaData.rotatable).toBe(true);
        });

    });
});
