define(['documentServices/constants/constants', 'documentServices/componentsMetaData/components/siteSegmentContainerMetaData', 'documentServices/constants/constants'], function (consts, siteSegmentContainerMetaData, constants) {
    'use strict';

    describe('siteSegmentContainerMetaData', function () {

        it('anchors', function () {
            var expectedAnchors = {
                to: {allow: true, lock: consts.ANCHORS.LOCK_CONDITION.THRESHOLD},
                from: {allow: true, lock: consts.ANCHORS.LOCK_CONDITION.ALWAYS}
            };
            expect(siteSegmentContainerMetaData.anchors).toEqual(expectedAnchors);
        });

        it('resizableSides should be top & bottom', function() {
            var expectedSides = [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.BOTTOM];

            expect(siteSegmentContainerMetaData.resizableSides).toEqual(expectedSides);
        });
    });
});