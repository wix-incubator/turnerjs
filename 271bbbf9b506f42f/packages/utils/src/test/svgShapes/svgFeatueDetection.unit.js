define(['lodash', 'utils/svgShapes/svgFeatureDetection'], function (_, svgFeatureDetection) {
    'use strict';

    describe('svgFeatureDetection', function () {

        it('should return a key with a boolean value for feature detection', function (){
            var featureDetection = svgFeatureDetection.flags();
            var keys = _.keys(featureDetection);

            expect(featureDetection).toBeDefined();
            expect(keys).toContain('isVectorEffect');

        });

    });
});
