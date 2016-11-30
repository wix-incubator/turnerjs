/**
 * Created by eitanr on 6/16/14.
 */
define(['coreUtils/core/dateTimeUtils'], function (dateTimeUtils) {
    'use strict';

    describe('dateTimeUtils', function(){
        describe('getMonthName() checks', function () {
            it('should return an empty string if month index is out of bounds', function () {
                var outOfBoundsMonthIndex = 30;

                expect(dateTimeUtils.getMonthName(outOfBoundsMonthIndex)).toBe('');
            });

            it('should return a capitilized month name', function () {
                var monthName = dateTimeUtils.getMonthName(3);

                expect(monthName[0].toUpperCase()).toBe(monthName[0]);
            });
        });

        describe('getDayName() checks', function () {
            it('should return an empty string if day index is out of bounds', function () {
                var outOfBoundsMonthIndex = 9;

                expect(dateTimeUtils.getDayName(outOfBoundsMonthIndex)).toBe('');
            });

            it('should return a capitilized month name', function () {
                var dayName = dateTimeUtils.getDayName(3);

                expect(dayName[0].toUpperCase()).toBe(dayName[0]);
            });
        });
    });
});
