define(['cloud/layout/cloudGluedWidgetPlacement'], function(placementStrategy) {
    'use strict';

    describe('cloudGluedWidgetPlacement', function() {

        it('should return the default placement', function() {
            var expected = {};

            var compData = {
                gluedOptions: {
                    placement: expected
                }
            };

            var actual = placementStrategy.getDefaultPlacement(compData);
            expect(actual).toEqual(expected);
        });

    });
});