define(['documentServices/componentsMetaData/components/rssButtonMetaData'], function (rssButtonMetaData) {
	'use strict';
    describe('rssButton Meta Data - ', function() {

        it('rotatable should be true', function() {
            expect(rssButtonMetaData.rotatable).toBe(true);
        });

    });
});
