define(['lodash', 'Squire'], function (_, Squire) {
    'use strict';

    var EPSILON = 0.1;

    var customMatchers = {
        toFuzzyCompare: function() {
            return {compare: fuzzyCompare};
        }
    };

    function fuzzyCompare(actual, expected) {
        return {
            pass: Math.abs(actual - expected) < EPSILON,
            message: 'Expected \'' + actual + '\' to be closely comparable with \'' + expected + '\''
        };
    }

    describe('convertSize', function () {
        var injector = new Squire();

        beforeEach(function (done) {
            var mockFontComparisonTable = {
                tableEntries: {
                    'fontA': {referencePoints: [18, 50, 90], friendlyName: 'font A'}
                }
            };

            var builder = injector.mock('documentServices/mobileConversion/modules/fontSizeComparisonTable', mockFontComparisonTable);

            var self = this;
            builder.require(['documentServices/mobileConversion/modules/fontSizeConverter'], function (fontSizeConverter) {
                self.fontSizeConverter = fontSizeConverter;
                done();
            });

            jasmine.addMatchers(customMatchers);
        });

        it('should convert font size to equivalent baseline font', function () {
            expect(this.fontSizeConverter.convertSize('fontA', 2)).toFuzzyCompare(2.5);
            expect(this.fontSizeConverter.convertSize('fontA', 25)).toFuzzyCompare(20.47);
            expect(this.fontSizeConverter.convertSize('fontA', 67)).toFuzzyCompare(57.85);
            expect(this.fontSizeConverter.convertSize('fontA', 230)).toFuzzyCompare(229);
        });
    });
});

