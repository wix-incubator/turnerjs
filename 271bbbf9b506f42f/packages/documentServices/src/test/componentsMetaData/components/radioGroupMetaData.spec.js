define(['documentServices/componentsMetaData/components/radioGroupMetaData'
], function (radioGroupMetaData) {
    'use strict';
    describe('radioGroup Meta Data ', function () {
        describe('resizableSides', function () {
            it('Should return only left and right resize', function () {
                expect(radioGroupMetaData.resizableSides).toEqual(["RESIZE_LEFT", "RESIZE_RIGHT"]);
            });
            it('Should be disableable', function () {
                expect(radioGroupMetaData.disableable).toEqual(true);
            });
        });
    });
});
