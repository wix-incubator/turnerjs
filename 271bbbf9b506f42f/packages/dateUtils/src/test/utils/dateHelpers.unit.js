define(['lodash', 'dateUtils/utils/dateHelpers'], function (_, dateHelpers) {
    'use strict';

    describe('dateHelpers', function () {

        var date = new Date(2016, 6, 6, 0, 0, 0, 0);

        describe('getDateByFormat', function () {
            it('should return date in string representation according to format given', function () {
                var formattedDate = dateHelpers.getDateByFormat(date, 'DD/MM/YYYY');

                expect(formattedDate).toBe('06/07/2016');
            });
        });

        describe('getStartDayOfTheWeek', function () {
            it('should return date that is the start of the week from a given date', function () {
                var expectedStartOfTheWeek = new Date(2016, 6, 3);
                var actualStartOfTheWeek = dateHelpers.getStartDayOfTheWeek(date);

                expect(actualStartOfTheWeek.getTime()).toBe(expectedStartOfTheWeek.getTime());
            });

            it('should support setting first day of the week via option params', function () {
                var expectedStartOfTheWeek = new Date(2016, 6, 4);
                var actualStartOfTheWeek = dateHelpers.getStartDayOfTheWeek(date, {weekStartsOn: 1});

                expect(actualStartOfTheWeek.getTime()).toBe(expectedStartOfTheWeek.getTime());
            });
        });

        describe('getStartDayOfTheMonth', function () {
            it('should return date that is the start of the month from a given date', function () {
                var expectedStartOfTheMonth = new Date(2016, 6, 1);
                var actualStartOfTheMonth = dateHelpers.getStartDayOfTheMonth(date);

                expect(actualStartOfTheMonth.getTime()).toBe(expectedStartOfTheMonth.getTime());
            });
        });

        describe('getDate', function () {
            it('should return the date of a given date', function () {
                expect(dateHelpers.getDate(date)).toBe(6);
            });
        });

        describe('getDay', function () {
            it('should return the day of the week of a given date', function () {
                expect(dateHelpers.getDay(date)).toBe(3);
            });
        });

        describe('getYear', function () {
            it('should return the year of a given date', function () {
                expect(dateHelpers.getYear(date)).toBe(2016);
            });
        });

        describe('getStartOfDay', function () {
            it('should return the start of a given date', function () {
                var expectedDate = new Date(2016, 5, 6, 0, 0, 0, 0);

                expect(dateHelpers.getStartOfDay(new Date(2016, 5, 6, 20, 0, 0, 0)).getTime()).toBe(expectedDate.getTime());
            });
        });

        describe('getStartOfToday', function () {
            it('should return the start of today', function () {
                var expectedDate = new Date();
                expectedDate.setHours(0, 0, 0, 0);

                expect(dateHelpers.getStartOfToday(date).getTime()).toBe(expectedDate.getTime());
            });
        });

        describe('getISOWeek', function () {
            it('should return the iso week number', function () {
                var expectedDate = new Date(2016, 8, 3);

                expect(dateHelpers.getISOWeek(expectedDate)).toEqual(35);
            });
        });

        describe('getDayNameMin', function () {
            it('should return short day name of a given date', function () {
                expect(dateHelpers.getDayNameMin(date)).toBe('We');
            });
        });

        describe('setYear', function () {
            it('should return a new date with the year set', function () {
                var expectedDate = new Date(1988, 6, 6, 0, 0, 0, 0);

                expect(dateHelpers.setYear(date, 1988).getTime()).toBe(expectedDate.getTime());
            });
        });

        describe('addDays', function () {
            it('should add days given date and number of days', function () {
                var expectedDate = new Date(2016, 6, 8);
                var incrementedDate = dateHelpers.addDays(date, 2);
                expect(incrementedDate.getTime()).toBe(expectedDate.getTime());
            });
        });

        describe('addWeeks', function () {
            it('should add weeks given date and number of weeks', function () {
                var expectedDate = new Date(2016, 6, 13);
                var incrementedDate = dateHelpers.addWeeks(date, 1);
                expect(incrementedDate.getTime()).toBe(expectedDate.getTime());
            });
        });

        describe('addMonths', function () {
            it('should add months given date and number of months', function () {
                var expectedDate = new Date(2016, 8, 6);
                var incrementedDate = dateHelpers.addMonths(date, 2);
                expect(incrementedDate.getTime()).toBe(expectedDate.getTime());
            });
        });

        describe('addYears', function () {
            it('should add years given date and number of years', function () {
                var expectedDate = new Date(2020, 6, 6);
                var incrementedDate = dateHelpers.addYears(date, 4);
                expect(incrementedDate.getTime()).toBe(expectedDate.getTime());
            });
        });

        describe('subMonths', function () {
            it('should subtract months given date and number of months', function () {
                var expectedDate = new Date(2016, 3, 6);
                var incrementedDate = dateHelpers.subMonths(date, 3);
                expect(incrementedDate.getTime()).toBe(expectedDate.getTime());
            });
        });

        describe('subYears', function () {
            it('should subtract years given date and number of years', function () {
                var expectedDate = new Date(2010, 6, 6);
                var incrementedDate = dateHelpers.subYears(date, 6);
                expect(incrementedDate.getTime()).toBe(expectedDate.getTime());
            });
        });

        describe('isSameDay', function () {
            it('should return true if two dates are on the same day', function () {
                var secondDate = new Date(2016, 6, 6, 14, 0, 0, 0);
                expect(dateHelpers.isSameDay(date, secondDate)).toBe(true);
            });

            it('should return false if two dates are not on the same day', function () {
                var secondDate = new Date(2016, 6, 7);
                expect(dateHelpers.isSameDay(date, secondDate)).toBe(false);
            });
        });

        describe('isSameMonth', function () {
            it('should return true if two dates are on the same month', function () {
                var secondDate = new Date(2016, 6, 9);
                expect(dateHelpers.isSameMonth(date, secondDate)).toBe(true);
            });

            it('should return false if two dates are not on the same month', function () {
                var secondDate = new Date(2016, 7, 7);
                expect(dateHelpers.isSameMonth(date, secondDate)).toBe(false);
            });
        });

        describe('isBefore', function () {
            it('should return true if first date is before second date', function () {
                var secondDate = new Date(2016, 6, 9);
                expect(dateHelpers.isBefore(date, secondDate)).toBe(true);
            });

            it('should return false if first date is not before second date', function () {
                var secondDate = new Date(2016, 5, 7);
                expect(dateHelpers.isBefore(date, secondDate)).toBe(false);
            });
        });

        describe('isAfter', function () {
            it('should return true if first date is after second date', function () {
                var secondDate = new Date(2016, 2, 9);
                expect(dateHelpers.isAfter(date, secondDate)).toBe(true);
            });

            it('should return false if first date is not after second date', function () {
                var secondDate = new Date(2016, 9, 7);
                expect(dateHelpers.isAfter(date, secondDate)).toBe(false);
            });
        });

        describe('isEqual', function () {
            it('should return true given dates are equal', function () {
                expect(dateHelpers.isEqual(date, date)).toBe(true);
            });

            it('should return false given dates are not equal', function () {
                var secondDate = new Date(2016, 9, 7);
                expect(dateHelpers.isEqual(date, secondDate)).toBe(false);
            });
        });
    });
});
