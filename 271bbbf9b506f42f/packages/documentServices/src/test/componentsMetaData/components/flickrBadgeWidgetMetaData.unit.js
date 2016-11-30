define(['documentServices/componentsMetaData/components/flickrBadgeWidgetMetaData'], function (flickrBadgeWidgetMetaData) {
	'use strict';
    describe('flickrBadgeWidgetMetaData - ', function() {

        it('resizableSides should be empty', function() {
            expect(flickrBadgeWidgetMetaData.resizableSides.length).toEqual(0);
        });
    });
});
