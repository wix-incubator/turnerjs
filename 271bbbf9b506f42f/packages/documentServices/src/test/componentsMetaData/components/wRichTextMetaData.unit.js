define(['documentServices/componentsMetaData/components/wRichTextMetaData'], function (wRichTextMetaData) {
    'use strict';
    describe('wRichText Meta Data - ', function() {

        it('minWidth should be 40', function() {
            expect(wRichTextMetaData.layoutLimits.minWidth).toBe(40);
        });
    });
});
