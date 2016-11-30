define(['lodash', 'wixappsCore/util/spacersCalculator'], function (_, spacersCalculator) {
    'use strict';

    describe('spacersCalculator', function () {
        describe('translateStaticSpacers', function () {
            it('spacerBefore and spacerAfter - only style', function () {
                var style = {spacerBefore: 3, spacerAfter: 7};
                var translatedStyle = spacersCalculator.translateStaticSpacers(style);

                var expected = {marginTop: 3, marginBottom: 7};

                expect(translatedStyle).toEqual(expected);
            });
            it('spacers - only style', function () {
                var style = {spacer: 5};
                var translatedStyle = spacersCalculator.translateStaticSpacers(style);

                var expected = {marginTop: 5, marginBottom: 5};

                expect(translatedStyle).toEqual(expected);
            });
            it('spacerBefore and spacerAfter - horizontal and ltr', function () {
                var style = {spacerBefore: 3, spacerAfter: 7};
                _.forEach([null, 'ltr'], function (direction) {

                    var translatedStyle = spacersCalculator.translateStaticSpacers(style, 'horizontal', direction);

                    var expected = {marginLeft: 3, marginRight: 7};

                    expect(translatedStyle).toEqual(expected);
                });
            });
            it('spacerBefore and spacerAfter - horizontal and rtl', function () {
                var style = {spacerBefore: 3, spacerAfter: 7};

                var translatedStyle = spacersCalculator.translateStaticSpacers(style, 'horizontal', 'rtl');

                var expected = {marginLeft: 7, marginRight: 3};

                expect(translatedStyle).toEqual(expected);
            });
        });

        describe('translateStaticSpacersXax', function () {
            it('spacers - only style', function () {
                var style = {spacer: 5};
                var translatedStyle = spacersCalculator.translateStaticSpacersXax(style);

                var expected = {paddingTop: 5, paddingBottom: 5};

                expect(translatedStyle).toEqual(expected);
            });
            it('spacerBefore and spacerAfter - only style', function () {
                var style = {spacerBefore: 3, spacerAfter: 7};
                var translatedStyle = spacersCalculator.translateStaticSpacersXax(style);

                var expected = {paddingTop: 3, paddingBottom: 7};

                expect(translatedStyle).toEqual(expected);
            });
        });
    });
});
