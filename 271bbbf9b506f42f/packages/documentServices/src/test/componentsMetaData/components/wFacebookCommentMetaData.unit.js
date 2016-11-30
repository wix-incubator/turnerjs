define(['documentServices/componentsMetaData/components/wFacebookCommentMetaData', 'documentServices/documentMode/documentModeInfo', 'documentServices/constants/constants'],
    function (wFacebookCommentMetaData, documentModeInfo, constants) {
        'use strict';
        describe('wFacebookCommentMetaData - ', function () {

            it('resizableSides should be empty if in mobile mode', function () {
                spyOn(documentModeInfo, 'getViewMode').and.returnValue(constants.VIEW_MODES.MOBILE);

                var expectedSides = [];
                expect(wFacebookCommentMetaData.resizableSides({}, 'spotifyFollow')).toEqual(expectedSides);
            });

            it('resizableSides should be left & right if in desktop mode', function () {
                spyOn(documentModeInfo, 'getViewMode').and.returnValue(constants.VIEW_MODES.DESKTOP);

                var expectedSides = [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT];
                expect(wFacebookCommentMetaData.resizableSides({}, 'spotifyFollow')).toEqual(expectedSides);
            });
        });
    });
