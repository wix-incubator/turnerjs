define(['documentServices/componentsMetaData/components/payPalButtonMetaData'], function (payPalButtonMetaData) {
	'use strict';
    describe('payPalButtonMetaData - ', function() {

        it('resizableSides should be empty', function() {
            expect(payPalButtonMetaData.resizableSides.length).toEqual(0);
        });
    });
});
