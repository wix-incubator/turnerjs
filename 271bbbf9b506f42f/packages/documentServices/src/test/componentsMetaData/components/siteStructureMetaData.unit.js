define(['documentServices/constants/constants', 'documentServices/componentsMetaData/components/siteStructureMetaData'], function (consts, siteStructureMetaData) {
    'use strict';

    describe('siteSegmentContainerMetaData', function () {

        it('anchors', function () {
            var expectedAnchors = {
                to: {allow: true, lock: consts.ANCHORS.LOCK_CONDITION.ALWAYS, distance: 0},
                from: {allow: false, lock: consts.ANCHORS.LOCK_CONDITION.NEVER}
            };
            expect(siteStructureMetaData.anchors).toEqual(expectedAnchors);
        });

    });
});