define(['documentServices/componentsMetaData/components/spotifyFollowMetaData', 'documentServices/dataModel/dataModel', 'documentServices/constants/constants'],
    function (spotifyFollowMetaData, dataModel, constants) {
        'use strict';
        describe('spotifyFollowMetaData - ', function () {

            it('resizableSides should be left and right if uri is defined', function () {
                spyOn(dataModel, 'getPropertiesItem').and.returnValue({
                    uri: 'someUri'
                });
                var expectedSides = [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT];

                expect(spotifyFollowMetaData.resizableSides({}, 'spotifyFollow')).toEqual(expectedSides);
            });

            it('resizableSides should be empty if uri isn\'t defined', function () {
                spyOn(dataModel, 'getPropertiesItem').and.returnValue({});
                var expectedSides = [];

                expect(spotifyFollowMetaData.resizableSides({}, 'spotifyFollow')).toEqual(expectedSides);
            });
        });
    });
