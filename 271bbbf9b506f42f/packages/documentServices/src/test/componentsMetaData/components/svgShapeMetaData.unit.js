define(['documentServices/componentsMetaData/components/svgShapeMetaData'], function (svgShapeMetaData) {
	'use strict';
    describe('svgShape Meta Data - ', function() {

        it('rotatable should be true', function() {
            expect(svgShapeMetaData.rotatable).toBe(true);
        });

    });
});
