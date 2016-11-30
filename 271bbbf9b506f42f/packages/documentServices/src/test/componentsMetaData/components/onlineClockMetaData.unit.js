define(['documentServices/componentsMetaData/components/onlineClockMetaData'], function (onlineClockMetaData) {
	'use strict';
    describe('onlineClock Meta Data - ', function() {

        it('rotatable should be true', function() {
            expect(onlineClockMetaData.rotatable).toBe(true);
        });

        it('resizableSides should be empty', function() {
            expect(onlineClockMetaData.resizableSides.length).toEqual(0);
        });
    });
});
