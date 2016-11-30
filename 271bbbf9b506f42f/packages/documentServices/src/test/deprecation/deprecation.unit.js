/**
 * Created by alexandreroitman on 23/11/2016.
 */
define(['documentServices/deprecation/deprecation'], function (deprecation) {
    'use strict';

    describe('Deprecation', function(){
        it('should set shouldThrowOnDeprecation true', function() {
            var ps = {
                runtimeConfig: {
                    shouldThrowOnDeprecation: false
                }
            };
            deprecation.setThrowOnDeprecation(ps, true);

            expect(ps.runtimeConfig.shouldThrowOnDeprecation).toBeTruthy();
        });

        it('should set shouldThrowOnDeprecation false', function() {
            var ps = {
                runtimeConfig: {
                    shouldThrowOnDeprecation: false
                }
            };
            deprecation.setThrowOnDeprecation(ps, false);

            expect(ps.runtimeConfig.shouldThrowOnDeprecation).toBeFalsy();
        });
    });
});
