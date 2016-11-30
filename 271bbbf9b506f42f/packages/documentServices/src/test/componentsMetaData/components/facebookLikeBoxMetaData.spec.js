define(['documentServices/componentsMetaData/components/facebookLikeBoxMetaData', 'documentServices/dataModel/dataModel'
], function (facebookLikeBoxMetaData, dataModel) {
    'use strict';
    describe('facebookLikeBox Meta Data - ', function () {
        describe('resizableSides', function () {

            it('Should return only left and right resize only if post stream is not shown', function () {
                spyOn(dataModel, 'getDataItem').and.returnValue({
                    showFaces: false,
                    showStream: false
                });

                var expectedSides = ["RESIZE_LEFT", "RESIZE_RIGHT"];
                var resizableSides = facebookLikeBoxMetaData.resizableSides({}, 'facebookLikeBox');
                expect(resizableSides).toEqual(expectedSides);
            });

            it('Should return all sides resize if showStream = true', function () {
                spyOn(dataModel, 'getDataItem').and.returnValue({
                    showStream: true
                });

                var expectedSides = ["RESIZE_TOP", "RESIZE_LEFT", "RESIZE_BOTTOM", "RESIZE_RIGHT"];
                var resizableSides = facebookLikeBoxMetaData.resizableSides({}, 'facebookLikeBox');
                expect(resizableSides).toEqual(expectedSides);
            });
        });
    });
});