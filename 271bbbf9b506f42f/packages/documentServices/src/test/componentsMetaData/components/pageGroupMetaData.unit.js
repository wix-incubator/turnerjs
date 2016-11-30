define(['documentServices/constants/constants', 'documentServices/componentsMetaData/components/pageGroupMetaData'], function (consts, pageGroupMetaData) {
    'use strict';

    describe('pageGroupMetaData', function () {

        it('anchors', function () {
            var expectedAnchors = {
                to: {allow: true, lock: consts.ANCHORS.LOCK_CONDITION.THRESHOLD},
                from: {allow: true, lock: consts.ANCHORS.LOCK_CONDITION.ALWAYS}
            };
            expect(pageGroupMetaData.anchors).toEqual(expectedAnchors);
        });

    });
});