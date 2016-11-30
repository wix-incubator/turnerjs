define(['documentServices/componentsMetaData/components/weatherMetaData'], function (weatherMetaData) {
    'use strict';
    describe('weather Meta Data - ', function() {

        it('resizableSides should be empty', function() {
            expect(weatherMetaData.resizableSides.length).toEqual(0);
        });
    });
});
