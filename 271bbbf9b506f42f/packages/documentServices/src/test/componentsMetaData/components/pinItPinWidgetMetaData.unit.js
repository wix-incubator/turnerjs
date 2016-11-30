define(['documentServices/componentsMetaData/components/pinItPinWidgetMetaData'], function (pinItPinWidgetMetaData) {
	'use strict';
    describe('pinItPinWidget Meta Data - ', function() {

        it('resizableSides should be empty', function() {
            expect(pinItPinWidgetMetaData.resizableSides.length).toEqual(0);
        });
    });
});
