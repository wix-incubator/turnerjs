define(['documentServices/constants/constants', 'documentServices/componentsMetaData/components/pagesContainerMetaData'], function (consts, pagesContainerMetaData) {
    'use strict';

    describe('pagesContainerMetaData', function () {

        it('anchors', function () {
            var expectedAnchors = {
                to: {allow: true, allowBottomBottom: false, lock: consts.ANCHORS.LOCK_CONDITION.THRESHOLD},
                from: {allow: true, lock: consts.ANCHORS.LOCK_CONDITION.ALWAYS}
            };
            expect(pagesContainerMetaData.anchors).toEqual(expectedAnchors);
        });

        it('resizableSides should be empty', function() {
            expect(pagesContainerMetaData.resizableSides.length).toEqual(0);
        });
    });
});