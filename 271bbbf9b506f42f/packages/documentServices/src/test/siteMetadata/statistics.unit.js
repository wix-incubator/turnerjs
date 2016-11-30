define(['lodash', 'definition!documentServices/siteMetadata/statistics', 'fake!documentServices/siteMetadata/dataManipulation'], function (_, StatisticsDef, fakeDataManipulation) {
    'use strict';

    describe('siteMetadata statistics sub module', function() {
        beforeEach(function() {
            fakeDataManipulation.PROPERTY_NAMES = {
                SUPRESS_COOKIES: 'suppress_cookies_path'
            };
            this.statistics = new StatisticsDef(_, fakeDataManipulation);
        });
        describe('cookies enable method', function() {
            beforeEach(function() {
                spyOn(fakeDataManipulation, 'setProperty').and.stub();
            });

            it('cookies enable/disable with legal argument', function() {
                this.statistics.cookies.enable(null, true);
                // suppress is the opposite of enable
                expect(fakeDataManipulation.setProperty).toHaveBeenCalledWith(null, fakeDataManipulation.PROPERTY_NAMES.SUPPRESS_COOKIES, false);

                this.statistics.cookies.enable(null, false);
                // suppress is the opposite of enable
                expect(fakeDataManipulation.setProperty).toHaveBeenCalledWith(null, fakeDataManipulation.PROPERTY_NAMES.SUPPRESS_COOKIES, true);
            });

            it('cookies enable/disable with a non-boolean argument should throw an error', function() {
                var invalidArguments = [null, {}, [], '', 5, NaN, undefined];

                _.forEach(invalidArguments, function(invalidArgument) {
                    expect(this.statistics.cookies.enable.bind(this.statistics, null, invalidArgument)).toThrowError();
                }, this);
                expect(fakeDataManipulation.setProperty).not.toHaveBeenCalled();
            });
        });

        describe('cookies isEnabled method', function() {
            beforeEach(function() {
                spyOn(fakeDataManipulation, 'getProperty').and.stub();
            });

            it('cookies isEnabled should return the result from the correct metadata path', function() {
                this.statistics.cookies.isEnabled(null);
                expect(fakeDataManipulation.getProperty).toHaveBeenCalledWith(null, fakeDataManipulation.PROPERTY_NAMES.SUPPRESS_COOKIES);
            });
        });
    });
});
