define(['documentServices/tpa/utils/tpaUtils', 'documentServices/tpa/constants'], function(tpaUtils, tpaConstants) {
    'use strict';

    describe('document services - tpa - tpaUtils', function() {
        describe('isTpa by comp type', function () {
            it('should be truthy fro tpa types', function () {
                expect(tpaUtils.isTpaByCompType(tpaConstants.TPA_COMP_TYPES.TPA_SECTION)).toBeTruthy();
            });

            it('should be falsy for gallery comps', function () {
                expect(tpaUtils.isTpaByCompType('wysiwyg.viewer.components.tpapps.TPA3DGallery')).toBeFalsy();
            });
        });
    });
});